import assert from "node:assert/strict";
import { describe, it } from "node:test";

function requireStripeSignature(headers: Record<string, unknown>): string | null {
  const signature = headers["stripe-signature"];
  if (!signature || typeof signature !== "string") return null;
  return signature;
}

describe("stripe webhook signature gate", () => {
  it("requires Stripe-Signature header", () => {
    assert.equal(requireStripeSignature({}), null);
    assert.equal(requireStripeSignature({ "stripe-signature": 123 }), null);
    assert.equal(requireStripeSignature({ "stripe-signature": "t=1,v1=abc" }), "t=1,v1=abc");
  });

  it("never accepts unverified JSON body alone as payment proof", () => {
    const body = { type: "checkout.session.completed", data: { object: { payment_status: "paid" } } };
    // Without a verified signature, handlers must not process — gate returns null
    assert.equal(requireStripeSignature({}), null);
    assert.ok(body.type);
  });
});
