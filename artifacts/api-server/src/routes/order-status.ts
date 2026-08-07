import type { Context } from "hono";
import { z } from "zod";
import { getOrderBySessionId, getOrderItems } from "../lib/commerce";
import { clientIpFromHeaders, rateLimit } from "../lib/rate-limit";
import { getStripe } from "../lib/stripe";

const querySchema = z.object({
  session_id: z.string().min(10).max(200),
});

export async function orderStatusBySessionHandler(
  c: Context,
): Promise<Response> {
  const ip = clientIpFromHeaders(c.req.raw.headers);
  const limited = rateLimit(`order-status:${ip}`, 60, 60_000);
  if (!limited.ok) {
    c.header("Retry-After", String(limited.retryAfterSec));
    return c.json({ error: "Too many requests." }, 429);
  }

  const parsed = querySchema.safeParse({
    session_id: c.req.query("session_id"),
  });
  if (!parsed.success) {
    return c.json({ error: "Missing or invalid session_id." }, 400);
  }

  try {
    const sessionId = parsed.data.session_id;
    const order = await getOrderBySessionId(sessionId);

    if (!order) {
      return c.json({ error: "Order not found.", code: "not_found" }, 404);
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.orderId && session.metadata.orderId !== order.id) {
      return c.json({ error: "Order not found.", code: "not_found" }, 404);
    }

    const items = await getOrderItems(order.id);

    const paymentComplete =
      session.payment_status === "paid" ||
      order.payment_status === "paid" ||
      order.status === "paid" ||
      order.status === "processing" ||
      order.status === "shipped" ||
      order.status === "delivered";

    const processing =
      session.status === "complete" &&
      (session.payment_status === "unpaid" ||
        session.payment_status === "no_payment_required") === false &&
      !paymentComplete &&
      (session.payment_status === "unpaid" ||
        order.payment_status === "unpaid");

    const asyncProcessing =
      session.status === "complete" &&
      session.payment_status !== "paid" &&
      order.payment_status !== "paid" &&
      order.payment_status !== "failed";

    let displayStatus: "paid" | "processing" | "open" | "expired" | "failed" =
      "open";
    if (paymentComplete) displayStatus = "paid";
    else if (session.status === "expired") displayStatus = "expired";
    else if (
      order.payment_status === "failed" ||
      order.status === "canceled"
    ) {
      displayStatus = "failed";
    } else if (asyncProcessing || processing) displayStatus = "processing";
    else if (session.status === "open") displayStatus = "open";

    const shipping = (order.shipping_address ?? null) as Record<
      string,
      unknown
    > | null;
    const sessionAny = session as unknown as {
      collected_information?: {
        shipping_details?: {
          address?: {
            line1?: string | null;
            line2?: string | null;
            city?: string | null;
            state?: string | null;
            postal_code?: string | null;
            country?: string | null;
          } | null;
        };
      } | null;
      shipping_details?: {
        address?: {
          line1?: string | null;
          line2?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string | null;
        } | null;
      } | null;
    };
    const sessionShipping =
      sessionAny.collected_information?.shipping_details?.address ??
      sessionAny.shipping_details?.address;

    return c.json({
      status: displayStatus,
      orderNumber: order.order_number,
      customerEmail:
        order.customer_email ?? session.customer_details?.email ?? null,
      customerName:
        order.customer_name ?? session.customer_details?.name ?? null,
      currency: order.currency,
      subtotalAmount: order.subtotal_amount,
      shippingAmount: order.shipping_amount,
      taxAmount: order.tax_amount,
      discountAmount: order.discount_amount,
      totalAmount: order.total_amount,
      shippingAddress: shipping
        ? {
            line1: shipping.line1 ?? shipping.addressLine1 ?? null,
            line2: shipping.line2 ?? shipping.addressLine2 ?? null,
            city: shipping.city ?? null,
            state: shipping.state ?? null,
            postalCode: shipping.postal_code ?? shipping.postalCode ?? null,
            country: shipping.country ?? null,
          }
        : sessionShipping
          ? {
              line1: sessionShipping.line1 ?? null,
              line2: sessionShipping.line2 ?? null,
              city: sessionShipping.city ?? null,
              state: sessionShipping.state ?? null,
              postalCode: sessionShipping.postal_code ?? null,
              country: sessionShipping.country ?? null,
            }
          : null,
      items: items.map((i) => ({
        productName: i.product_name,
        color: i.color,
        size: i.size,
        quantity: i.quantity,
        unitAmount: i.unit_amount,
        lineTotal: i.line_total,
      })),
    });
  } catch (err) {
    console.error(
      "order by-session error",
      err instanceof Error ? err.message : "unknown",
    );
    return c.json({ error: "Unable to load order status." }, 500);
  }
}
