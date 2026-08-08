import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { applyWorkerEnv, validateProductionEnv } from "./env.ts";

/**
 * Mirrors production middleware order in app.ts:
 * applyWorkerEnv → CORS → validateProductionEnv (skip OPTIONS / healthz)
 */
function createCorsOrderedApp(opts?: {
  onValidate?: () => void;
}) {
  let envValidated = false;
  let validateCalls = 0;
  const app = new Hono<{ Bindings: Record<string, string | undefined> }>();

  app.use("*", async (c, next) => {
    applyWorkerEnv(c.env as unknown as Env);
    await next();
    return;
  });

  app.use("*", async (c, next) => {
    const isProd = process.env.NODE_ENV === "production";
    const origins = (process.env.CORS_ORIGINS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const handler = cors({
      origin: (origin) => {
        if (!origin) return origin;
        if (origins.includes(origin)) return origin;
        if (
          !isProd &&
          /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        ) {
          return origin;
        }
        return null;
      },
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type", "Stripe-Signature", "Authorization"],
      maxAge: 86400,
    });
    return handler(c, next);
  });

  app.use("*", async (c, next) => {
    if (c.req.path === "/api/healthz") {
      await next();
      return;
    }
    if (c.req.method === "OPTIONS") {
      await next();
      return;
    }
    if (!envValidated) {
      validateCalls += 1;
      opts?.onValidate?.();
      try {
        validateProductionEnv();
        envValidated = true;
      } catch {
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

  return {
    app,
    getValidateCalls: () => validateCalls,
  };
}

const ENV_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "PUBLIC_SITE_URL",
  "CORS_ORIGINS",
  "NODE_ENV",
] as const;

describe("CORS before env validation", () => {
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
    for (const k of ENV_KEYS) snapshot[k] = process.env[k];
    for (const k of ENV_KEYS) delete process.env[k];
  });

  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (snapshot[k] === undefined) delete process.env[k];
      else process.env[k] = snapshot[k];
    }
  });

  it("A) OPTIONS preflight succeeds without running validateProductionEnv", async () => {
    // Deliberately omit Stripe secrets so validation would fail if it ran.
    const envWithoutSecrets = {
      PUBLIC_SITE_URL: workerEnv.PUBLIC_SITE_URL,
      CORS_ORIGINS: workerEnv.CORS_ORIGINS,
      NODE_ENV: workerEnv.NODE_ENV,
    };

    const { app, getValidateCalls } = createCorsOrderedApp();
    const res = await app.request(
      "https://api.ilovecucci.com/api/checkout/session",
      {
        method: "OPTIONS",
        headers: {
          Origin: "https://ilovecucci.com",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "content-type",
        },
      },
      envWithoutSecrets,
    );

    assert.ok(res.status === 204 || res.status === 200, `status=${res.status}`);
    assert.equal(getValidateCalls(), 0);
    assert.equal(
      res.headers.get("access-control-allow-origin"),
      "https://ilovecucci.com",
    );
    const methods = (res.headers.get("access-control-allow-methods") ?? "")
      .toUpperCase()
      .split(",")
      .map((s) => s.trim());
    assert.ok(methods.includes("POST"));
    assert.ok(methods.includes("GET"));
    assert.ok(methods.includes("OPTIONS"));
    const allowHeaders = (
      res.headers.get("access-control-allow-headers") ?? ""
    ).toLowerCase();
    assert.match(allowHeaders, /content-type/);
    assert.match((res.headers.get("vary") ?? "").toLowerCase(), /origin/);
  });

  it("A2) OPTIONS from www origin is allowed", async () => {
    const { app, getValidateCalls } = createCorsOrderedApp();
    const res = await app.request(
      "https://api.ilovecucci.com/api/checkout/session",
      {
        method: "OPTIONS",
        headers: {
          Origin: "https://www.ilovecucci.com",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "content-type",
        },
      },
      {
        PUBLIC_SITE_URL: workerEnv.PUBLIC_SITE_URL,
        CORS_ORIGINS: workerEnv.CORS_ORIGINS,
        NODE_ENV: workerEnv.NODE_ENV,
      },
    );
    assert.ok(res.status === 204 || res.status === 200);
    assert.equal(getValidateCalls(), 0);
    assert.equal(
      res.headers.get("access-control-allow-origin"),
      "https://www.ilovecucci.com",
    );
  });

  it("B) POST still runs production env validation", async () => {
    let validated = false;
    const { app, getValidateCalls } = createCorsOrderedApp({
      onValidate: () => {
        validated = true;
      },
    });

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
    assert.ok(validated);
    assert.ok(getValidateCalls() >= 1);
    const body = (await res.json()) as { code: string };
    assert.equal(body.code, "invalid_request");
  });

  it("C) unauthorized Origin does not get Allow-Origin", async () => {
    const { app } = createCorsOrderedApp();
    const res = await app.request(
      "https://api.ilovecucci.com/api/checkout/session",
      {
        method: "OPTIONS",
        headers: {
          Origin: "https://evil.example",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "content-type",
        },
      },
      {
        PUBLIC_SITE_URL: workerEnv.PUBLIC_SITE_URL,
        CORS_ORIGINS: workerEnv.CORS_ORIGINS,
        NODE_ENV: workerEnv.NODE_ENV,
      },
    );

    const allowOrigin = res.headers.get("access-control-allow-origin");
    assert.ok(
      allowOrigin == null || allowOrigin === "" || allowOrigin === "null",
      `unexpected Allow-Origin: ${allowOrigin}`,
    );
    assert.notEqual(allowOrigin, "https://evil.example");
    assert.notEqual(allowOrigin, "*");
  });
});

describe("env-gated checkout pre-handler", () => {
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
    for (const k of ENV_KEYS) snapshot[k] = process.env[k];
    for (const k of ENV_KEYS) delete process.env[k];
  });

  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (snapshot[k] === undefined) delete process.env[k];
      else process.env[k] = snapshot[k];
    }
  });

  it("lets {items:[]} reach the route and return JSON invalid_request", async () => {
    const { app } = createCorsOrderedApp();
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

  it("returns JSON env_validation_failed when secrets are missing on POST", async () => {
    const { app } = createCorsOrderedApp();
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
