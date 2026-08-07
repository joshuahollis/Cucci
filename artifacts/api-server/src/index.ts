/**
 * Cloudflare Worker entry — Hono fetch handler.
 * Runtime DB access uses Supabase HTTPS (service role), not TCP `pg`.
 */
export { default } from "./app";
