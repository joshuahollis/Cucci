import { Hono } from "hono";
import { cors } from "hono/cors";
import { applyWorkerEnv, validateProductionEnv } from "./lib/env";
import {
  catalogAvailabilityHandler,
  checkoutSessionHandler,
} from "./routes/checkout";
import { healthzHandler } from "./routes/healthz";
import { orderStatusBySessionHandler } from "./routes/order-status";
import { stripeWebhookHandler } from "./routes/webhook";

export type AppEnv = {
  Bindings: Env;
};

let envValidated = false;

/** Test helper — reset module-level validation gate. */
export function resetEnvValidated(): void {
  envValidated = false;
}

function envPresenceFlags() {
  return {
    supabaseUrlConfigured: Boolean(process.env.SUPABASE_URL?.trim()),
    serviceRoleConfigured: Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
    ),
    stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY?.trim()),
    stripeWebhookConfigured: Boolean(
      process.env.STRIPE_WEBHOOK_SECRET?.trim(),
    ),
    publicSiteUrlConfigured: Boolean(process.env.PUBLIC_SITE_URL?.trim()),
    corsOriginsConfigured: Boolean(process.env.CORS_ORIGINS?.trim()),
    nodeEnv: process.env.NODE_ENV ?? null,
  };
}

export function createApp() {
  const app = new Hono<AppEnv>();

  app.onError((err, c) => {
    console.error("uncaught worker error", {
      path: c.req.path,
      method: c.req.method,
      name: err instanceof Error ? err.name : "UnknownError",
      message: err instanceof Error ? err.message : String(err),
    });
    return c.json(
      {
        error: "Internal API error.",
        code: "uncaught_worker_error",
      },
      500,
    );
  });

  // Liveness — no secrets required (platform probes).
  app.get("/health", (c) => c.json({ status: "ok" }));

  // Bind Worker env for all non-liveness routes. /api/healthz is a readiness
  // probe: it applies env but must not throw from validateProductionEnv so it
  // can return structured JSON diagnostics instead of a bare 500.
  app.use("*", async (c, next) => {
    if (c.req.path === "/health") {
      await next();
      return;
    }

    applyWorkerEnv(c.env);

    if (c.req.path === "/api/healthz") {
      await next();
      return;
    }

    if (!envValidated) {
      console.error("worker env middleware: before validateProductionEnv", {
        path: c.req.path,
        method: c.req.method,
        ...envPresenceFlags(),
      });
      try {
        validateProductionEnv();
        envValidated = true;
        console.error("worker env middleware: after validateProductionEnv", {
          path: c.req.path,
          ok: true,
        });
      } catch (err) {
        console.error("worker env middleware: validateProductionEnv failed", {
          path: c.req.path,
          method: c.req.method,
          ...envPresenceFlags(),
          name: err instanceof Error ? err.name : "UnknownError",
          message: err instanceof Error ? err.message : String(err),
        });
        // Do not leave the gate half-open; surface a structured failure.
        return c.json(
          {
            error: "Internal API error.",
            code: "env_validation_failed",
          },
          500,
        );
      }
    }
    await next();
    return;
  });

  app.use("*", async (c, next) => {
    if (c.req.path === "/health") {
      await next();
      return;
    }
    const isProd = process.env.NODE_ENV === "production";
    const allowedOrigins = (process.env.CORS_ORIGINS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const handler = cors({
      origin: (origin) => {
        if (!origin) return origin;
        if (allowedOrigins.includes(origin)) return origin;
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

  app.get("/api/healthz", (c) => healthzHandler(c));

  // Raw body required — do not parse JSON before signature verification.
  app.post("/api/stripe/webhook", async (c) => {
    const rawBody = await c.req.text();
    return stripeWebhookHandler(c, rawBody);
  });

  app.get("/api/catalog/availability", (c) => catalogAvailabilityHandler(c));
  app.post("/api/checkout/session", (c) => checkoutSessionHandler(c));
  app.get("/api/checkout/status", (c) => orderStatusBySessionHandler(c));
  app.get("/api/orders/by-session", (c) => orderStatusBySessionHandler(c));

  return app;
}

const app = createApp();
export default app;
