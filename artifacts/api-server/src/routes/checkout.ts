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

  try {
    await cleanupExpiredReservations();

    if (parsed.data.resumeOrderId) {
      const resumed = await tryResumeCheckout(
        parsed.data.resumeOrderId,
        parsed.data.items,
      );
      if (resumed) {
        return c.json(resumed);
      }
    }

    const prepared = await createPendingCheckout(parsed.data.items);
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
      await releaseReservationsForOrder(prepared.orderId);
      console.error(
        "stripe session create failed",
        stripeErr instanceof Error ? stripeErr.message : "unknown",
      );
      return c.json(
        {
          error: "Unable to start checkout. Please try again.",
          code: "stripe_session_failed",
        },
        502,
      );
    }

    if (!session.client_secret) {
      await releaseReservationsForOrder(prepared.orderId);
      return c.json(
        {
          error: "Unable to start checkout. Please try again.",
          code: "missing_client_secret",
        },
        502,
      );
    }

    await updateOrderSessionId(prepared.orderId, session.id);

    return c.json({
      clientSecret: session.client_secret,
      orderId: prepared.orderId,
      orderNumber: prepared.orderNumber,
      expiresAt: prepared.expiresAt.toISOString(),
    });
  } catch (err) {
    if (err instanceof CheckoutError) {
      return c.json(
        {
          error: err.message,
          code: err.code,
          lines: err.lines,
        },
        err.status as 400 | 409 | 500,
      );
    }
    console.error(
      "checkout session error",
      err instanceof Error ? err.message : "unknown",
    );
    return c.json({ error: "Checkout failed. Please try again." }, 500);
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
  } catch {
    return null;
  }
}
