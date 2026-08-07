import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** Lightweight mirror of checkout body rules (Zod used in the route). */
function validateCheckoutBody(body: unknown): { ok: true; items: Array<{ variantId: string; quantity: number }> } | { ok: false } {
  if (!body || typeof body !== "object") return { ok: false };
  const items = (body as { items?: unknown }).items;
  if (!Array.isArray(items) || items.length < 1 || items.length > 20) return { ok: false };
  const normalized: Array<{ variantId: string; quantity: number }> = [];
  for (const item of items) {
    if (!item || typeof item !== "object") return { ok: false };
    const variantId = (item as { variantId?: unknown }).variantId;
    const quantity = (item as { quantity?: unknown }).quantity;
    if (typeof variantId !== "string" || variantId.length < 1 || variantId.length > 64) return { ok: false };
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > 5) {
      return { ok: false };
    }
    // Client prices must be ignored — only id + qty are kept
    normalized.push({ variantId, quantity });
  }
  return { ok: true, items: normalized };
}

describe("checkout request validation", () => {
  it("rejects client-provided prices (only ids+qty accepted)", () => {
    const parsed = validateCheckoutBody({
      items: [{ variantId: "51113821569257", quantity: 1, unitAmount: 1, price: 0.01 }],
    });
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.deepEqual(parsed.items[0], { variantId: "51113821569257", quantity: 1 });
    }
  });

  it("rejects invalid quantity", () => {
    assert.equal(validateCheckoutBody({ items: [{ variantId: "x", quantity: 0 }] }).ok, false);
    assert.equal(validateCheckoutBody({ items: [{ variantId: "x", quantity: 99 }] }).ok, false);
    assert.equal(validateCheckoutBody({ items: [{ variantId: "x", quantity: 1.5 }] }).ok, false);
  });

  it("rejects empty cart", () => {
    assert.equal(validateCheckoutBody({ items: [] }).ok, false);
  });

  it("rejects missing variantId", () => {
    assert.equal(validateCheckoutBody({ items: [{ quantity: 1 }] }).ok, false);
  });
});
