# Deploy Cucci API — Cloudflare Worker `cucci-api`

## Architecture

| Surface | Path | Worker | Domain |
|---|---|---|---|
| Storefront | `artifacts/cucci` | `cucci` | https://ilovecucci.com |
| Commerce API | `artifacts/api-server` | `cucci-api` | https://api.ilovecucci.com |

Stack: **Hono** fetch handler + `nodejs_compat` + **Supabase HTTPS** (service role) + Postgres RPCs for atomic inventory.

Direct `DATABASE_URL` / `node-postgres` TCP is **not** used in the Worker runtime.

## Prerequisites

1. Apply `lib/db/migrations/0002_commerce_rpcs.sql` in Supabase SQL Editor.
2. Seed / inventory data present.
3. Stripe webhook endpoint: `https://api.ilovecucci.com/api/stripe/webhook`

## Scripts (from `artifacts/api-server`)

```bash
pnpm install
pnpm run typecheck
pnpm test
pnpm run build      # typecheck + wrangler dry-run
pnpm run dev        # wrangler dev :8787
pnpm run deploy     # wrangler deploy (when ready)
```

## Secrets

```bash
cd artifacts/api-server
pnpm exec wrangler secret put STRIPE_SECRET_KEY
pnpm exec wrangler secret put STRIPE_WEBHOOK_SECRET
pnpm exec wrangler secret put SUPABASE_URL
pnpm exec wrangler secret put SUPABASE_SERVICE_ROLE_KEY
# optional:
pnpm exec wrangler secret put STRIPE_STANDARD_SHIPPING_RATE_ID
# optional tooling only:
# pnpm exec wrangler secret put DATABASE_URL
```

## Vars (in wrangler.jsonc)

`NODE_ENV`, `PUBLIC_SITE_URL`, `CORS_ORIGINS`, shipping amount/flags.

Frontend `VITE_API_URL` must be `https://api.ilovecucci.com` (GitHub Actions / Pages secret — publishable Stripe key only on the frontend).
