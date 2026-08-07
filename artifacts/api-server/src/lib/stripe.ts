import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripe) return stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  stripe = new Stripe(key);
  return stripe;
}

export function getPublicSiteUrl(): string {
  const url = process.env.PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!url) {
    throw new Error("PUBLIC_SITE_URL is not configured");
  }
  return url;
}

export function boolEnv(name: string, fallback = false): boolean {
  const v = process.env[name];
  if (v == null || v === "") return fallback;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
}

/** Reset singleton (tests). */
export function resetStripeClient(): void {
  stripe = null;
}
