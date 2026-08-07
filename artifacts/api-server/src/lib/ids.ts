/** Web-crypto IDs — works on Workers and Node without relying on node:crypto. */

function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function newId(prefix = ""): string {
  const id = randomHex(16);
  return prefix ? `${prefix}_${id}` : id;
}

/** Human-readable order number, e.g. CUCCI-20260805-A3F9 */
export function newOrderNumber(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const suffix = randomHex(2).toUpperCase();
  return `CUCCI-${y}${m}${day}-${suffix}`;
}

/** 31 minutes — Stripe Checkout Session expires_at requires ≥ 30 minutes from creation. */
export const RESERVATION_TTL_MS = 31 * 60 * 1000;
export const MAX_LINE_QTY = 5;
export const DEFAULT_SHIPPING_CENTS = 800;
