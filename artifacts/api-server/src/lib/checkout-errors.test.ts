import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  INFRA_CHECKOUT_CODES,
  safeStripeError,
  stripeKeyMode,
} from "./checkout-errors.ts";

describe("checkout error helpers", () => {
  it("treats RPC/stripe infra codes as production-generic", () => {
    assert.equal(INFRA_CHECKOUT_CODES.has("create_pending_checkout_rpc"), true);
    assert.equal(INFRA_CHECKOUT_CODES.has("stripe_checkout_session_create"), true);
    assert.equal(INFRA_CHECKOUT_CODES.has("inventory_changed"), false);
  });

  it("extracts Stripe fields without assuming Error shape", () => {
    const fields = safeStripeError({
      type: "StripeInvalidRequestError",
      code: "resource_missing",
      statusCode: 400,
      message: "No such price: 'price_test'; a similar object exists in test mode",
    });
    assert.equal(fields.stripeType, "StripeInvalidRequestError");
    assert.equal(fields.stripeCode, "resource_missing");
    assert.equal(fields.statusCode, 400);
    assert.match(fields.message ?? "", /test mode/);
  });

  it("detects stripe key mode from env prefix", () => {
    const prev = process.env.STRIPE_SECRET_KEY;
    process.env.STRIPE_SECRET_KEY = "sk_live_x";
    assert.equal(stripeKeyMode(), "live");
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    assert.equal(stripeKeyMode(), "test");
    if (prev === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = prev;
  });
});
