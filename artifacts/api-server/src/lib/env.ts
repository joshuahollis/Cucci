/**
 * Validate required environment for the Worker.
 * Never logs secret values.
 */

export function applyWorkerEnv(workerEnv: Env): void {
  const keys = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_STANDARD_SHIPPING_RATE_ID",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "DATABASE_URL",
    "PUBLIC_SITE_URL",
    "CORS_ORIGINS",
    "NODE_ENV",
    "STRIPE_STANDARD_SHIPPING_AMOUNT_CENTS",
    "STRIPE_ALLOW_PROMOTION_CODES",
    "STRIPE_AUTOMATIC_TAX_ENABLED",
    "LOG_LEVEL",
  ] as const;

  for (const key of keys) {
    const value = workerEnv[key];
    if (typeof value === "string" && value.length > 0) {
      process.env[key] = value;
    }
  }

  process.env.CF_WORKER = "1";
}

export function validateProductionEnv(): void {
  const required = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "PUBLIC_SITE_URL",
  ] as const;

  const missing: string[] = [];
  for (const key of required) {
    const value = process.env[key];
    if (value == null || String(value).trim() === "") {
      missing.push(key);
    }
  }

  const isProd = process.env.NODE_ENV === "production";
  const cors = process.env.CORS_ORIGINS?.trim();
  if (isProd && (!cors || cors === "*")) {
    missing.push("CORS_ORIGINS");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}`,
    );
  }

  // Trim before format checks — wrangler secret values often include a trailing newline.
  const site = process.env.PUBLIC_SITE_URL!.trim();
  if (!/^https?:\/\//i.test(site)) {
    throw new Error("PUBLIC_SITE_URL must be an absolute http(s) URL");
  }
  process.env.PUBLIC_SITE_URL = site;

  const sk = process.env.STRIPE_SECRET_KEY!.trim();
  if (!sk.startsWith("sk_test_") && !sk.startsWith("sk_live_")) {
    throw new Error("STRIPE_SECRET_KEY must start with sk_test_ or sk_live_");
  }
  process.env.STRIPE_SECRET_KEY = sk;

  const wh = process.env.STRIPE_WEBHOOK_SECRET!.trim();
  if (!wh.startsWith("whsec_")) {
    throw new Error("STRIPE_WEBHOOK_SECRET must start with whsec_");
  }
  process.env.STRIPE_WEBHOOK_SECRET = wh;

  const supabaseUrl = process.env.SUPABASE_URL!.trim();
  if (!/^https:\/\//i.test(supabaseUrl)) {
    throw new Error("SUPABASE_URL must be an https:// URL");
  }
  process.env.SUPABASE_URL = supabaseUrl;

  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim();
  process.env.SUPABASE_SERVICE_ROLE_KEY = serviceRole;

  if (isProd && cors) {
    const origins = cors.split(",").map((s) => s.trim()).filter(Boolean);
    if (origins.length === 0 || origins.includes("*")) {
      throw new Error(
        "CORS_ORIGINS must list explicit origins (no wildcards) in production",
      );
    }
    for (const origin of origins) {
      if (!/^https:\/\//i.test(origin)) {
        throw new Error("CORS_ORIGINS entries must use https:// in production");
      }
    }
    process.env.CORS_ORIGINS = origins.join(",");
  }
}
