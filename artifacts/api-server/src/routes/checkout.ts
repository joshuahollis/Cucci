import type { Context } from "hono";
import { z } from "zod";
import {
  CheckoutError,
  createPendingCheckout,
  getOrderById,
  getOrderItems,
  listCatalogAvailability,
  releaseReservationsForOrder,
  updateOrderSessionId,
  type CartLineInput,
} from "../lib/commerce";
import { cleanupExpiredReservations } from "../lib/cleanup";
import {
  INFRA_CHECKOUT_CODES,
  logCheckoutFailure,
  safeStripeError,
  stripeKeyMode,
  type CheckoutStage,
} from "../lib/checkout-errors";
import { clientIpFromHeaders, rateLimit } from "../lib/rate-limit";
import { boolEnv, getPublicSiteUrl, getStripe } from "../lib/stripe";

const checkoutBodySchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().min(1).max(64),
        quantity: z.number().int().positive().max(5),
      }),
    )
    .min(1)
    .max(20),
  resumeOrderId: z.string().min(1).max(80).optional(),
});

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function publicCheckoutError(
  code: string,
  detailedMessage: string,
): { error: string; code: string } {
  if (isProduction() && INFRA_CHECKOUT_CODES.has(code)) {
    return {
      error: "Checkout failed. Please try again.",
      code,
    };
  }
  return { error: detailedMessage, code };
}

export async function catalogAvailabilityHandler(c: Context): Promise<Response> {
  try {
    await cleanupExpiredReservations();
    const items = await listCatalogAvailability();
    return c.json({ items });
  } catch (err) {
    console.error(
      "catalog availability error",
      err instanceof Error ? err.message : "unknown",
    );
    return c.json({ error: "Unable to load availability." }, 500);
  }
}

export async function checkoutSessionHandler(c: Context): Promise<Response> {
  const ip = clientIpFromHeaders(c.req.raw.headers);
  const limited = rateLimit(`checkout:${ip}`, 20, 60_000);
  if (!limited.ok) {
    c.header("Retry-After", String(limited.retryAfterSec));
    return c.json(
      { error: "Too many checkout attempts. Please wait and try again." },
      429,
    );
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json(
      { error: "Invalid checkout request.", code: "invalid_request" },
      400,
    );
  }

  const parsed = checkoutBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      {
        error: "Invalid checkout request.",
        code: "invalid_request",
        details: parsed.error.flatten(),
      },
      400,
    );
  }

  let stage: CheckoutStage = "input_validation";
  let orderId: string | undefined;

  try {
    stage = "cleanup_expired_reservations";
    await cleanupExpiredReservations();

    if (parsed.data.resumeOrderId) {
      stage = "stripe_session_retrieve";
      const resumed = await tryResumeCheckout(
        parsed.data.resumeOrderId,
        parsed.data.items,
      );
      if (resumed) {
        return c.json(resumed);
      }
    }

    stage = "create_pending_checkout_rpc";
    const prepared = await createPendingCheckout(parsed.data.items);
    orderId = prepared.orderId;

    stage = "shipping_configuration";
    const stripe = getStripe();
    const siteUrl = getPublicSiteUrl();
    const expiresAtUnix = Math.floor(prepared.expiresAt.getTime() / 1000);

    const shippingRateId =
      process.env.STRIPE_STANDARD_SHIPPING_RATE_ID?.trim();
    const shippingOptions =
      shippingRateId && shippingRateId.startsWith("shr_")
        ? [{ shipping_rate: shippingRateId }]
        : [
            {
              shipping_rate_data: {
                type: "fixed_amount" as const,
                fixed_amount: {
                  amount: prepared.shippingAmount,
                  currency: prepared.currency,
                },
                display_name: "Standard Shipping (US)",
                delivery_estimate: {
                  minimum: { unit: "business_day" as const, value: 5 },
                  maximum: { unit: "business_day" as const, value: 10 },
                },
              },
            },
          ];

    const usingPriceIds = prepared.lineItems.filter((l) => Boolean(l.stripePriceId));
    const lineItems = prepared.lineItems.map((line) => {
      if (line.stripePriceId) {
        return { price: line.stripePriceId, quantity: line.quantity };
      }
      return {
        quantity: line.quantity,
        price_data: {
          currency: prepared.currency,
          unit_amount: line.unitAmount,
          product_data: {
            name: line.name,
            description: line.description || undefined,
            images: line.imageUrl ? [line.imageUrl] : undefined,
            metadata: {
              variantId: line.variantId,
              sku: line.sku,
            },
          },
        },
      };
    });

    stage = "stripe_checkout_session_create";
    let session;
    try {
      session = await stripe.checkout.sessions.create(
        {
          mode: "payment",
          ui_mode: "embedded_page",
          return_url: `${siteUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
          customer_creation: "always",
          billing_address_collection: "auto",
          shipping_address_collection: { allowed_countries: ["US"] },
          shipping_options: shippingOptions,
          phone_number_collection: { enabled: true },
          allow_promotion_codes: boolEnv("STRIPE_ALLOW_PROMOTION_CODES", false),
          automatic_tax: {
            enabled: boolEnv("STRIPE_AUTOMATIC_TAX_ENABLED", false),
          },
          expires_at: expiresAtUnix,
          line_items: lineItems,
          metadata: {
            orderId: prepared.orderId,
            orderNumber: prepared.orderNumber,
          },
          payment_intent_data: {
            metadata: {
              orderId: prepared.orderId,
              orderNumber: prepared.orderNumber,
            },
          },
        },
        {
          idempotencyKey: `checkout_${prepared.orderId}`,
        },
      );
    } catch (stripeErr) {
      await releaseReservationsForOrder(prepared.orderId).catch((releaseErr) => {
        logCheckoutFailure("stripe_checkout_session_create", releaseErr, {
          orderId: prepared.orderId,
          message: "failed to release reservations after Stripe error",
        });
      });
      const stripe = safeStripeError(stripeErr);
      logCheckoutFailure("stripe_checkout_session_create", stripeErr, {
        orderId: prepared.orderId,
        orderNumber: prepared.orderNumber,
        stripeMode: stripeKeyMode(),
        shippingRateUsed: Boolean(shippingRateId?.startsWith("shr_")),
        catalogPriceIdCount: usingPriceIds.length,
        lineItemCount: prepared.lineItems.length,
        variantIds: prepared.lineItems.map((l) => l.variantId),
      });
      const body = publicCheckoutError(
        "stripe_checkout_session_create",
        stripe.message ?? "Unable to start checkout. Please try again.",
      );
      return c.json(body, 502);
    }

    if (!session.client_secret) {
      await releaseReservationsForOrder(prepared.orderId).catch(() => undefined);
      logCheckoutFailure("stripe_checkout_session_create", null, {
        orderId: prepared.orderId,
        message: "missing client_secret on Checkout Session",
      });
      return c.json(
        publicCheckoutError(
          "missing_client_secret",
          "Unable to start checkout. Please try again.",
        ),
        502,
      );
    }

    stage = "order_update_after_stripe";
    await updateOrderSessionId(prepared.orderId, session.id);

    return c.json({
      clientSecret: session.client_secret,
      orderId: prepared.orderId,
      orderNumber: prepared.orderNumber,
      expiresAt: prepared.expiresAt.toISOString(),
    });
  } catch (err) {
    if (err instanceof CheckoutError) {
      const stageFromCode: CheckoutStage =
        err.code === "cleanup_expired_reservations" ||
        err.code === "create_pending_checkout_rpc" ||
        err.code === "shipping_configuration" ||
        err.code === "stripe_checkout_session_create" ||
        err.code === "order_update_after_stripe"
          ? err.code
          : stage;

      if (INFRA_CHECKOUT_CODES.has(err.code) || err.status >= 500) {
        logCheckoutFailure(stageFromCode, err, {
          orderId,
          code: err.code,
          message: err.message,
          variantIds: err.lines?.map((l) => l.variantId),
        });
      }
      const body = {
        ...publicCheckoutError(err.code, err.message),
        ...(err.lines ? { lines: err.lines } : {}),
      };
      return c.json(body, err.status as 400 | 409 | 500);
    }

    logCheckoutFailure(stage, err, { orderId });
    return c.json(
      {
        error: "Checkout failed. Please try again.",
        code: stage === "input_validation" ? "unknown" : stage,
      },
      500,
    );
  }
}

function cartFingerprint(items: CartLineInput[]): string {
  return items
    .map((i) => `${i.variantId}:${Math.floor(i.quantity)}`)
    .sort()
    .join("|");
}

async function tryResumeCheckout(
  orderId: string,
  items: CartLineInput[],
): Promise<{
  clientSecret: string;
  orderId: string;
  orderNumber: string;
  expiresAt: string;
} | null> {
  const order = await getOrderById(orderId);
  if (!order) return null;
  if (order.status !== "pending_payment" || order.payment_status !== "unpaid") {
    return null;
  }
  if (!order.stripe_checkout_session_id) return null;
  if (
    order.reservation_expires_at &&
    new Date(order.reservation_expires_at).getTime() < Date.now()
  ) {
    await releaseReservationsForOrder(order.id);
    return null;
  }

  const lines = await getOrderItems(order.id);
  const existingFp = cartFingerprint(
    lines.map((l) => ({ variantId: l.variant_id, quantity: l.quantity })),
  );
  const requestedFp = cartFingerprint(items);
  if (existingFp !== requestedFp) {
    return null;
  }

  const stripe = getStripe();
  try {
    const session = await stripe.checkout.sessions.retrieve(
      order.stripe_checkout_session_id,
    );
    if (session.status !== "open" || !session.client_secret) {
      await releaseReservationsForOrder(order.id);
      return null;
    }
    return {
      clientSecret: session.client_secret,
      orderId: order.id,
      orderNumber: order.order_number,
      expiresAt: (order.reservation_expires_at
        ? new Date(order.reservation_expires_at)
        : new Date()
      ).toISOString(),
    };
  } catch (err) {
    logCheckoutFailure("stripe_session_retrieve", err, { orderId: order.id });
    return null;
  }
}
