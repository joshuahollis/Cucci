import type { Context } from "hono";
import type Stripe from "stripe";
import {
  convertReservationsForOrder,
  getOrderById,
  getOrderByPaymentIntent,
  releaseReservationsForOrder,
} from "../lib/commerce";
import { getStripe } from "../lib/stripe";
import { getSupabase } from "../lib/supabase";

function addressToJson(
  addr: Stripe.Address | null | undefined,
  name?: string | null,
): Record<string, unknown> | null {
  if (!addr) return null;
  return {
    name: name ?? null,
    line1: addr.line1,
    line2: addr.line2,
    city: addr.city,
    state: addr.state,
    postal_code: addr.postal_code,
    country: addr.country,
  };
}

async function markEventProcessed(event: Stripe.Event): Promise<boolean> {
  const { error } = await getSupabase().from("webhook_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    payload: { type: event.type, created: event.created },
  });
  if (error) {
    // Unique violation → already processed
    if (error.code === "23505") return false;
    throw new Error(`webhook_events insert: ${error.message}`);
  }
  return true;
}

async function unmarkEvent(eventId: string): Promise<void> {
  await getSupabase().from("webhook_events").delete().eq("stripe_event_id", eventId);
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const orderId = session.metadata?.orderId;
  if (!orderId) {
    console.error("checkout completed without orderId metadata");
    return;
  }

  const order = await getOrderById(orderId);
  if (!order) {
    console.error("checkout completed for unknown order");
    return;
  }

  if (
    order.stripe_checkout_session_id &&
    order.stripe_checkout_session_id !== session.id
  ) {
    console.error("session id mismatch for order");
    return;
  }

  if (order.payment_status === "paid") {
    return;
  }

  if (
    session.payment_status !== "paid" &&
    session.payment_status !== "no_payment_required"
  ) {
    return;
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  const shippingDetails =
    session.collected_information?.shipping_details ??
    (
      session as {
        shipping_details?: { address?: Stripe.Address; name?: string };
      }
    ).shipping_details;

  await convertReservationsForOrder(orderId);

  const { error } = await getSupabase()
    .from("orders")
    .update({
      status: "paid",
      payment_status: "paid",
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      customer_email: session.customer_details?.email ?? order.customer_email,
      customer_name:
        session.customer_details?.name ??
        shippingDetails?.name ??
        order.customer_name,
      shipping_address: addressToJson(
        shippingDetails?.address,
        shippingDetails?.name,
      ),
      billing_address: addressToJson(
        session.customer_details?.address,
        session.customer_details?.name,
      ),
      shipping_amount:
        session.shipping_cost?.amount_total != null
          ? session.shipping_cost.amount_total
          : order.shipping_amount,
      tax_amount: session.total_details?.amount_tax ?? order.tax_amount,
      discount_amount:
        session.total_details?.amount_discount ?? order.discount_amount,
      total_amount: session.amount_total ?? order.total_amount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("payment_status", "unpaid");

  if (error) {
    throw new Error(`mark order paid: ${error.message}`);
  }
}

async function handleCheckoutExpired(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;
  await releaseReservationsForOrder(orderId);
}

async function handleAsyncFailed(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;
  await releaseReservationsForOrder(orderId);
}

async function handleRefund(charge: Stripe.Charge): Promise<void> {
  const pi =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;
  if (!pi) return;

  const order = await getOrderByPaymentIntent(pi);
  if (!order) return;

  const fullyRefunded =
    charge.refunded || charge.amount_refunded >= charge.amount;
  const { error } = await getSupabase()
    .from("orders")
    .update({
      status: fullyRefunded ? "refunded" : "partially_refunded",
      payment_status: fullyRefunded ? "refunded" : "partially_refunded",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (error) throw new Error(`handleRefund: ${error.message}`);
}

async function handleDispute(dispute: Stripe.Dispute): Promise<void> {
  const charge =
    typeof dispute.charge === "string" ? dispute.charge : dispute.charge?.id;
  if (!charge) return;

  const stripe = getStripe();
  const chargeObj = await stripe.charges.retrieve(charge);
  const pi =
    typeof chargeObj.payment_intent === "string"
      ? chargeObj.payment_intent
      : chargeObj.payment_intent?.id;
  if (!pi) return;

  const order = await getOrderByPaymentIntent(pi);
  if (!order) return;

  if (dispute.status === "won") {
    const { error } = await getSupabase()
      .from("orders")
      .update({
        status: "paid",
        payment_status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);
    if (error) throw new Error(`dispute won: ${error.message}`);
    return;
  }

  if (dispute.status === "lost") {
    const { error } = await getSupabase()
      .from("orders")
      .update({
        status: "refunded",
        payment_status: "refunded",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);
    if (error) throw new Error(`dispute lost: ${error.message}`);
    return;
  }

  const { error } = await getSupabase()
    .from("orders")
    .update({
      status: "disputed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);
  if (error) throw new Error(`dispute open: ${error.message}`);
}

/**
 * Stripe webhooks — caller must pass the unmodified raw body string/bytes
 * for signature verification.
 */
export async function stripeWebhookHandler(
  c: Context,
  rawBody: string,
): Promise<Response> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return c.text("Webhook secret not configured", 500);
  }

  const signature = c.req.header("stripe-signature");
  if (!signature) {
    return c.text("Missing Stripe-Signature", 400);
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error(
      "webhook signature verification failed",
      err instanceof Error ? err.message : "",
    );
    return c.text("Invalid signature", 400);
  }

  const isNew = await markEventProcessed(event);
  if (!isNew) {
    return c.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "checkout.session.async_payment_failed":
        await handleAsyncFailed(event.data.object as Stripe.Checkout.Session);
        break;
      case "checkout.session.expired":
        await handleCheckoutExpired(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "charge.refunded":
        await handleRefund(event.data.object as Stripe.Charge);
        break;
      case "charge.dispute.created":
      case "charge.dispute.updated":
      case "charge.dispute.closed":
      case "charge.dispute.funds_withdrawn":
      case "charge.dispute.funds_reinstated":
        await handleDispute(event.data.object as Stripe.Dispute);
        break;
      default:
        break;
    }
  } catch (err) {
    try {
      await unmarkEvent(event.id);
    } catch {
      /* ignore */
    }
    console.error(
      "webhook processing failed",
      err instanceof Error ? err.message : "unknown",
    );
    return c.json({ error: "Webhook processing failed" }, 500);
  }

  return c.json({ received: true });
}
