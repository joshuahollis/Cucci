import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import { validateProductionEnv } from "./env.ts";

describe("validateProductionEnv", () => {
  const keys = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "PUBLIC_SITE_URL",
    "CORS_ORIGINS",
    "NODE_ENV",
  ];
  const snapshot: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of keys) snapshot[k] = process.env[k];
  });

  afterEach(() => {
    for (const k of keys) {
      if (snapshot[k] === undefined) delete process.env[k];
      else process.env[k] = snapshot[k];
    }
  });

  it("passes with a complete production config", () => {
    process.env.NODE_ENV = "production";
    process.env.SUPABASE_URL = "https://xxxx.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "eyJtest";
    process.env.STRIPE_SECRET_KEY = "sk_live_x";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_x";
    process.env.PUBLIC_SITE_URL = "https://ilovecucci.com";
    process.env.CORS_ORIGINS =
      "https://ilovecucci.com,https://www.ilovecucci.com";
    assert.doesNotThrow(() => validateProductionEnv());
  });

  it("rejects wildcard CORS in production", () => {
    process.env.NODE_ENV = "production";
    process.env.SUPABASE_URL = "https://xxxx.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "eyJtest";
    process.env.STRIPE_SECRET_KEY = "sk_live_x";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_x";
    process.env.PUBLIC_SITE_URL = "https://ilovecucci.com";
    process.env.CORS_ORIGINS = "*";
    assert.throws(() => validateProductionEnv(), /CORS_ORIGINS/);
  });

  it("rejects missing SUPABASE_URL", () => {
    process.env.NODE_ENV = "development";
    delete process.env.SUPABASE_URL;
    process.env.SUPABASE_SERVICE_ROLE_KEY = "eyJtest";
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_x";
    process.env.PUBLIC_SITE_URL = "http://127.0.0.1:5175";
    assert.throws(() => validateProductionEnv(), /SUPABASE_URL/);
  });

  it("does not require PORT or DATABASE_URL on Workers", () => {
    process.env.NODE_ENV = "development";
    delete process.env.PORT;
    delete process.env.DATABASE_URL;
    process.env.SUPABASE_URL = "https://xxxx.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "eyJtest";
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_x";
    process.env.PUBLIC_SITE_URL = "http://127.0.0.1:5175";
    assert.doesNotThrow(() => validateProductionEnv());
  });

  it("accepts Stripe secrets with trailing newlines (wrangler secret paste)", () => {
    process.env.NODE_ENV = "production";
    process.env.SUPABASE_URL = "https://xxxx.supabase.co\n";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "eyJtest\n";
    process.env.STRIPE_SECRET_KEY = "sk_live_x\n";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_x\n";
    process.env.PUBLIC_SITE_URL = "https://ilovecucci.com\n";
    process.env.CORS_ORIGINS =
      "https://ilovecucci.com,https://www.ilovecucci.com";
    assert.doesNotThrow(() => validateProductionEnv());
    assert.equal(process.env.STRIPE_SECRET_KEY, "sk_live_x");
  });
});
