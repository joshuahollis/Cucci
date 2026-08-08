import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import { Hono } from "hono";
import { applyWorkerEnv, validateProductionEnv } from "./env.ts";

/**
 * Mirrors the production env-gate middleware in app.ts (without importing app.ts,
 * which pulls the full Worker graph via extensionless ESM imports).
 */
function createEnvGatedApp() {
  let envValidated = false;
  const app = new Hono<{ Bindings: Record<string, string | undefined> }>();

  app.onError((err, c) => {
    console.error("uncaught worker error", {
      path: c.req.path,
      method: c.req.method,
      name: err instanceof Error ? err.name : "UnknownError",
      message: err instanceof Error ? err.message : String(err),
    });
    return c.json(
      { error: "Internal API error.", code: "uncaught_worker_error" },
      500,
    );
  });

  app.use("*", async (c, next) => {
    applyWorkerEnv(c.env as unknown as Env);
    if (!envValidated) {
      try {
        validateProductionEnv();
        envValidated = true;
      } catch (err) {
        console.error("worker env middleware: validateProductionEnv failed", {
          path: c.req.path,
          method: c.req.method,
          name: err instanceof Error ? err.name : "UnknownError",
          message: err instanceof Error ? err.message : String(err),
        });
        return c.json(
          { error: "Internal API error.", code: "env_validation_failed" },
          500,
        );
      }
    }
    await next();
    return;
  });

  app.post("/api/checkout/session", async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json(
        { error: "Invalid checkout request.", code: "invalid_request" },
        400,
      );
    }
    const items = (body as { items?: unknown })?.items;
    if (!Array.isArray(items) || items.length < 1) {
      return c.json(
        { error: "Invalid checkout request.", code: "invalid_request" },
        400,
      );
    }
    return c.json({ ok: true });
  });

  return app;
}

describe("env-gated checkout pre-handler", () => {
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

  const workerEnv = {
    SUPABASE_URL: "https://xxxx.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "eyJtest",
    STRIPE_SECRET_KEY: "sk_test_x",
    STRIPE_WEBHOOK_SECRET: "whsec_x",
    PUBLIC_SITE_URL: "https://ilovecucci.com",
    CORS_ORIGINS: "https://ilovecucci.com,https://www.ilovecucci.com",
    NODE_ENV: "production",
  };

  beforeEach(() => {
    for (const k of keys) snapshot[k] = process.env[k];
    for (const k of keys) delete process.env[k];
  });

  afterEach(() => {
    for (const k of keys) {
      if (snapshot[k] === undefined) delete process.env[k];
      else process.env[k] = snapshot[k];
    }
  });

  it("lets {items:[]} reach the route and return JSON invalid_request", async () => {
    const app = createEnvGatedApp();
    const res = await app.request(
      "https://api.ilovecucci.com/api/checkout/session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://ilovecucci.com",
        },
        body: JSON.stringify({ items: [] }),
      },
      workerEnv,
    );
    assert.equal(res.status, 400);
    assert.match(res.headers.get("content-type") ?? "", /application\/json/);
    const body = (await res.json()) as { code: string };
    assert.equal(body.code, "invalid_request");
  });

  it("returns JSON env_validation_failed when secrets are missing", async () => {
    const app = createEnvGatedApp();
    const res = await app.request(
      "https://api.ilovecucci.com/api/checkout/session",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [] }),
      },
      { ...workerEnv, STRIPE_SECRET_KEY: "" },
    );
    assert.equal(res.status, 500);
    assert.match(res.headers.get("content-type") ?? "", /application\/json/);
    const body = (await res.json()) as { code: string };
    assert.equal(body.code, "env_validation_failed");
  });
});
