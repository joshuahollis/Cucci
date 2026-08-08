import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import { runHealthzChecks } from "./healthz.ts";

describe("runHealthzChecks", () => {
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

  function fillValid() {
    process.env.NODE_ENV = "production";
    process.env.SUPABASE_URL = "https://xxxx.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "eyJtest";
    process.env.STRIPE_SECRET_KEY = "sk_live_x";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_x";
    process.env.PUBLIC_SITE_URL = "https://ilovecucci.com";
    process.env.CORS_ORIGINS =
      "https://ilovecucci.com,https://www.ilovecucci.com";
  }

  it("returns ok when production config is complete", () => {
    fillValid();
    assert.deepEqual(runHealthzChecks(), { status: "ok" });
  });

  it("returns structured env error when Stripe secret is missing", () => {
    fillValid();
    delete process.env.STRIPE_SECRET_KEY;
    const result = runHealthzChecks();
    assert.equal(result.status, "error");
    if (result.status === "error") {
      assert.equal(result.check, "env");
      assert.match(result.message, /STRIPE_SECRET_KEY/);
    }
  });

  it("returns stripe check when key prefix is invalid", () => {
    fillValid();
    process.env.STRIPE_SECRET_KEY = "rk_live_wrong";
    const result = runHealthzChecks();
    assert.equal(result.status, "error");
    if (result.status === "error") {
      assert.equal(result.check, "stripe");
    }
  });
});
