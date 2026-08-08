/**
 * Safe checkout failure diagnostics — never log secrets or PII.
 */

export type CheckoutStage =
  | "input_validation"
  | "cleanup_expired_reservations"
  | "create_pending_checkout_rpc"
  | "shipping_configuration"
  | "stripe_checkout_session_create"
  | "stripe_session_retrieve"
  | "order_update_after_stripe"
  | "unknown";

/** Infra stages: production clients get a generic message + code only. */
export const INFRA_CHECKOUT_CODES = new Set([
  "cleanup_expired_reservations",
  "create_pending_checkout_rpc",
  "shipping_configuration",
  "stripe_checkout_session_create",
  "stripe_session_retrieve",
  "order_update_after_stripe",
  "missing_client_secret",
  "config_error",
]);

export function checkoutEnvFlags() {
  return {
    supabaseUrlConfigured: Boolean(process.env.SUPABASE_URL?.trim()),
    serviceRoleConfigured: Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
    ),
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
    stripeWebhookConfigured: Boolean(
      process.env.STRIPE_WEBHOOK_SECRET?.trim(),
    ),
    shippingRateConfigured: Boolean(
      process.env.STRIPE_STANDARD_SHIPPING_RATE_ID?.trim(),
    ),
    publicSiteUrlConfigured: Boolean(process.env.PUBLIC_SITE_URL?.trim()),
  };
}

export function stripeKeyMode(): "live" | "test" | "unknown" {
  const key = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  if (key.startsWith("sk_live_")) return "live";
  if (key.startsWith("sk_test_")) return "test";
  return "unknown";
}

export function safeStripeError(err: unknown): {
  stripeType?: string;
  stripeCode?: string;
  statusCode?: number;
  message?: string;
  declineCode?: string;
  param?: string;
} {
  if (!err || typeof err !== "object") {
    return { message: err instanceof Error ? err.message : "unknown" };
  }
  const e = err as {
    type?: string;
    code?: string;
    statusCode?: number;
    message?: string;
    raw?: { code?: string; message?: string; decline_code?: string; param?: string };
  };
  return {
    stripeType: e.type,
    stripeCode: e.code ?? e.raw?.code,
    statusCode: e.statusCode,
    message: e.message ?? e.raw?.message,
    declineCode: e.raw?.decline_code,
    param: e.raw?.param,
  };
}

export function safeSupabaseError(err: unknown): {
  supabaseCode?: string;
  message?: string;
  hint?: string;
  details?: string;
} {
  if (!err || typeof err !== "object") {
    return { message: err instanceof Error ? err.message : "unknown" };
  }
  const e = err as {
    code?: string;
    message?: string;
    hint?: string;
    details?: string;
  };
  return {
    supabaseCode: e.code,
    message: e.message,
    hint: e.hint,
    // PostgREST sometimes puts "function X does not exist" in details/message
    details: e.details,
  };
}

export function logCheckoutFailure(
  stage: CheckoutStage,
  err: unknown,
  extra: Record<string, unknown> = {},
): void {
  const stripe = safeStripeError(err);
  const supabase = safeSupabaseError(err);
  const message =
    (typeof extra.message === "string" && extra.message) ||
    supabase.message ||
    stripe.message ||
    (err instanceof Error ? err.message : "unknown");

  console.error("checkout session failed", {
    stage,
    ...checkoutEnvFlags(),
    stripeMode: stripeKeyMode(),
    stripeType: stripe.stripeType,
    stripeCode: stripe.stripeCode,
    statusCode: stripe.statusCode,
    supabaseCode: supabase.supabaseCode,
    supabaseHint: supabase.hint,
    message,
    ...extra,
  });
}
