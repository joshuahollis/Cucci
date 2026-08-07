import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rateLimit } from "./rate-limit.ts";

describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    const key = `test-${Date.now()}-ok`;
    for (let i = 0; i < 5; i++) {
      assert.equal(rateLimit(key, 5, 60_000).ok, true);
    }
  });

  it("blocks when limit exceeded", () => {
    const key = `test-${Date.now()}-block`;
    for (let i = 0; i < 3; i++) rateLimit(key, 3, 60_000);
    const result = rateLimit(key, 3, 60_000);
    assert.equal(result.ok, false);
    assert.ok(result.retryAfterSec >= 1);
  });
});
