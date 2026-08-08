import type { Context } from "hono";

export type HealthzOk = { status: "ok" };
export type HealthzError = {
  status: "error";
  check: string;
  message: string;
};

function configured(key: string): boolean {
  const value = process.env[key];
  return value != null && String(value).trim() !== "";
}

/** Safe presence flags only — never include secret values. */
export function healthzConfigFlags() {
  return {
    supabaseUrlConfigured: configured("SUPABASE_URL"),
    serviceRoleConfigured: configured("SUPABASE_SERVICE_ROLE_KEY"),
    stripeConfigured: configured("STRIPE_SECRET_KEY"),
    stripeWebhookConfigured: configured("STRIPE_WEBHOOK_SECRET"),
    publicSiteUrlConfigured: configured("PUBLIC_SITE_URL"),
    corsOriginsConfigured: configured("CORS_ORIGINS"),
  };
}

/**
 * Readiness checks that mirror validateProductionEnv, but return a structured
 * failure instead of throwing. Does not call Supabase or Stripe.
 */
export function runHealthzChecks(): HealthzOk | HealthzError {
  const required = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "PUBLIC_SITE_URL",
  ] as const;

  const missing: string[] = [];
  for (const key of required) {
    if (!configured(key)) missing.push(key);
  }

  const isProd = process.env.NODE_ENV === "production";
  const cors = process.env.CORS_ORIGINS?.trim();
  if (isProd && (!cors || cors === "*")) {
    missing.push("CORS_ORIGINS");
  }

  if (missing.length > 0) {
    return {
      status: "error",
      check: "env",
      message: `Missing required environment variable(s): ${missing.join(", ")}`,
    };
  }

  const site = process.env.PUBLIC_SITE_URL!.trim();
  if (!/^https?:\/\//i.test(site)) {
    return {
      status: "error",
      check: "public_site_url",
      message: "PUBLIC_SITE_URL must be an absolute http(s) URL",
    };
  }

  const sk = process.env.STRIPE_SECRET_KEY!.trim();
  if (!sk.startsWith("sk_test_") && !sk.startsWith("sk_live_")) {
    return {
      status: "error",
      check: "stripe",
      message: "STRIPE_SECRET_KEY must start with sk_test_ or sk_live_",
    };
  }

  const wh = process.env.STRIPE_WEBHOOK_SECRET!.trim();
  if (!wh.startsWith("whsec_")) {
    return {
      status: "error",
      check: "stripe_webhook",
      message: "STRIPE_WEBHOOK_SECRET must start with whsec_",
    };
  }

  const supabaseUrl = process.env.SUPABASE_URL!.trim();
  if (!/^https:\/\//i.test(supabaseUrl)) {
    return {
      status: "error",
      check: "supabase",
      message: "SUPABASE_URL must be an https:// URL",
    };
  }

  if (isProd && cors) {
    const origins = cors.split(",").map((s) => s.trim()).filter(Boolean);
    if (origins.length === 0 || origins.includes("*")) {
      return {
        status: "error",
        check: "cors",
        message:
          "CORS_ORIGINS must list explicit origins (no wildcards) in production",
      };
    }
    for (const origin of origins) {
      if (!/^https:\/\//i.test(origin)) {
        return {
          status: "error",
          check: "cors",
          message: "CORS_ORIGINS entries must use https:// in production",
        };
      }
    }
  }

  return { status: "ok" };
}

export function healthzHandler(c: Context) {
  const flags = healthzConfigFlags();
  try {
    const result = runHealthzChecks();
    if (result.status === "ok") {
      return c.json(result, 200);
    }

    console.error("healthz failed", {
      ...flags,
      check: result.check,
      error: result.message,
    });
    return c.json(result, 500);
  } catch (err) {
    const safeErrorMessage =
      err instanceof Error ? err.message : "unknown healthz failure";
    console.error("healthz failed", {
      ...flags,
      check: "unexpected",
      error: safeErrorMessage,
    });
    return c.json(
      {
        status: "error",
        check: "unexpected",
        message: safeErrorMessage,
      } satisfies HealthzError,
      500,
    );
  }
}
