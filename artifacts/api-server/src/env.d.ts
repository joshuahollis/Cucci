/**
 * Cloudflare Worker bindings for the Cucci API (Hono).
 * Secrets via Dashboard / `wrangler secret put` — never commit values.
 */
interface Env {
  // Secrets
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  /** Optional — schema tooling / Hyperdrive only; Worker uses Supabase HTTPS. */
  DATABASE_URL?: string;
  STRIPE_STANDARD_SHIPPING_RATE_ID?: string;

  // Vars
  NODE_ENV?: string;
  PUBLIC_SITE_URL: string;
  CORS_ORIGINS: string;
  STRIPE_STANDARD_SHIPPING_AMOUNT_CENTS?: string;
  STRIPE_ALLOW_PROMOTION_CODES?: string;
  STRIPE_AUTOMATIC_TAX_ENABLED?: string;
  LOG_LEVEL?: string;
}
