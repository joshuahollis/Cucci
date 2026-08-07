import { Hono } from "hono";
import { cors } from "hono/cors";
import { applyWorkerEnv, validateProductionEnv } from "./lib/env";
import {
  catalogAvailabilityHandler,
  checkoutSessionHandler,
} from "./routes/checkout";
import { orderStatusBySessionHandler } from "./routes/order-status";
import { stripeWebhookHandler } from "./routes/webhook";

export type AppEnv = {
  Bindings: Env;
};

let envValidated = false;

export function createApp() {
  const app = new Hono<AppEnv>();

  // Liveness — no secrets required (platform probes).
  app.get("/health", (c) => c.json({ status: "ok" }));

  app.use("*", async (c, next) => {
    if (c.req.path === "/health") {
      await next();
      return;
    }
    applyWorkerEnv(c.env);
    if (!envValidated) {
      validateProductionEnv();
      envValidated = true;
    }
    await next();
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

  app.get("/api/healthz", (c) => c.json({ status: "ok" }));

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
