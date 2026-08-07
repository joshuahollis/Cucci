# Cucci Stripe Embedded Checkout — setup guide (TEST MODE)

This storefront is a **static Vite SPA** on GitHub Pages (`artifacts/cucci`).
Embedded Stripe Checkout **requires a trusted server**. Deploy `artifacts/api-server`
as a **Cloudflare Worker** (Hono + Supabase HTTPS) and point the SPA at it with
`VITE_API_URL=https://api.ilovecucci.com`.

Secrets must **never** be placed in the frontend — use **Cloudflare Worker Secrets**.

Full deploy steps: see [`CLOUDFLARE_DEPLOY.md`](./CLOUDFLARE_DEPLOY.md).

**Required before first API deploy:** run `lib/db/migrations/0002_commerce_rpcs.sql` in the Supabase SQL editor (atomic inventory RPCs).

---

## 1. When to insert keys — do this now

`.env.example` and this guide are ready. Insert **test** keys next:

1. **API Worker secrets / local `.dev.vars`** (never commit): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`, plus Wrangler vars for `PUBLIC_SITE_URL` / CORS / shipping.
2. **Frontend local `.env`** in `artifacts/cucci` (or export when running Vite): `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_API_URL`.
3. **GitHub Actions secrets** (Pages build): `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_API_URL`.

| Variable | Where | Value |
|---|---|---|
| `STRIPE_SECRET_KEY` | API host only | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | API host only | `whsec_...` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Frontend + GitHub secret | `pk_test_...` |
| `VITE_API_URL` | Frontend + GitHub secret | Public HTTPS API origin |
| `DATABASE_URL` | API host only | Postgres URL |

Do **not** paste live (`sk_live_` / `pk_live_`) keys yet. The API rejects `sk_live_` until you remove that guard after test verification.

Also set `PUBLIC_SITE_URL` on the API (production: `https://ilovecucci.com`; local: your Vite origin, e.g. `http://127.0.0.1:5175`) so Stripe `return_url` lands on `/order-confirmation`.

---

## 2. Stripe Dashboard (test mode)

1. Toggle **Test mode** ON.
2. Copy **Publishable** (`pk_test_...`) and **Secret** (`sk_test_...`) keys.
3. **Shipping** → create a fixed-amount Shipping Rate for **$8.00 USD** named “Standard Shipping (US)”.
   - Copy the ID (`shr_...`) → `STRIPE_STANDARD_SHIPPING_RATE_ID`.
   - If you skip this, the API falls back to `shipping_rate_data` using `STRIPE_STANDARD_SHIPPING_AMOUNT_CENTS=800`.
4. **Customer emails** → enable successful payment receipts (optional but recommended).
5. **Tax** → leave `STRIPE_AUTOMATIC_TAX_ENABLED=false` until Stripe Tax is registered.
6. **Promotion codes** → leave `STRIPE_ALLOW_PROMOTION_CODES=false` initially.
7. Products/Prices in Stripe are optional. The API builds `price_data` from the database when `stripe_price_id` is null. Map Price IDs later if you want Dashboard catalog sync — do not treat Stripe as inventory.

### Webhook endpoint (production API)

Create an endpoint:

- URL: `https://YOUR-API-HOST/api/stripe/webhook`
- Events:
  - `checkout.session.completed`
  - `checkout.session.async_payment_succeeded`
  - `checkout.session.async_payment_failed`
  - `checkout.session.expired`
  - `charge.refunded`
- Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### Local webhook forwarding

```bash
stripe listen --forward-to http://127.0.0.1:8787/api/stripe/webhook
```

Use the CLI printed `whsec_...` as `STRIPE_WEBHOOK_SECRET` in `.dev.vars` while developing.

---

## 3. Database (Postgres / Supabase)

1. Create a Postgres database.
2. Set `DATABASE_URL` for the API process (and for drizzle commands).
3. Push schema from repo root:

```bash
export DATABASE_URL='postgresql://...'
pnpm --filter @workspace/db push
pnpm --filter @workspace/db seed
```

4. After seed, adjust `variants.inventory_on_hand` in the DB dashboard to match the ~13 physical units you actually have (seed defaults to **1 per SKU**).
5. If using Supabase:
   - Use the **service role** connection string only on the API server.
   - Do not expose the service role key to the browser.
   - Prefer disabling public writes via RLS; the API uses a direct Postgres connection and does not rely on anon client mutations.

### Admin / fulfillment (no insecure in-app admin)

Use Supabase/SQL dashboard + Stripe Dashboard:

- View paid orders: `select * from orders where payment_status = 'paid' order by created_at desc;`
- View SKU availability: `select sku, inventory_on_hand, inventory_reserved, (inventory_on_hand - inventory_reserved) as available from variants;`
- Update stock: `update variants set inventory_on_hand = N, updated_at = now() where sku = '...';`
- Mark shipped: `update orders set status = 'shipped', tracking_number = '...', carrier = '...', shipped_at = now() where order_number = '...';`
- Refunds: refund in Stripe Dashboard; `charge.refunded` webhook syncs order status.

---

## 4. Deploy API (Cloudflare Workers)

See **[`CLOUDFLARE_DEPLOY.md`](./CLOUDFLARE_DEPLOY.md)** for Dashboard + CLI steps.

**Before deploy:** run `lib/db/migrations/0002_commerce_rpcs.sql` in Supabase SQL Editor.

```bash
pnpm --filter @workspace/api-server exec wrangler login
cd artifacts/api-server
pnpm exec wrangler secret put STRIPE_SECRET_KEY
pnpm exec wrangler secret put STRIPE_WEBHOOK_SECRET
pnpm exec wrangler secret put SUPABASE_URL
pnpm exec wrangler secret put SUPABASE_SERVICE_ROLE_KEY
pnpm run deploy
```

Production origin: **`https://api.ilovecucci.com`**

- Health: `GET https://api.ilovecucci.com/health` → `{ "status": "ok" }`
- Webhook: `https://api.ilovecucci.com/api/stripe/webhook`
- Frontend: `VITE_API_URL=https://api.ilovecucci.com`

---

## 5. Build & deploy storefront

GitHub Pages build must include:

```bash
VITE_API_URL=https://YOUR-API-HOST
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Rebuild/redeploy Pages after changing these.

CSP (if you add headers later): allow Stripe `https://js.stripe.com`, `https://api.stripe.com`, frames from Stripe checkout domains.

---

## 6. Customer flow QA (test mode)

1. Collections → product → choose size → Add to bag.
2. Open bag → Checkout.
3. Embedded Stripe form loads inside `/checkout`.
4. Pay with test card `4242 4242 4242 4242`.
5. Return to `/order-confirmation?session_id=...` → status **paid**, order number shown, bag cleared.
6. Confirm row in `orders` + inventory decremented once for that SKU.
7. Stripe CLI: replay `checkout.session.completed` → no double decrement (webhook idempotency).
8. Start checkout, abandon until session expires → reservation released.
9. Two browsers race the last unit → only one succeeds.
10. Declined card `4000 0000 0000 0002` → no paid order / no stock decrement.
11. Mobile viewport + Apple Pay/Google Pay availability where supported by Stripe test mode / browser.

---

## 7. Go-live (production)

### Important: where the webhook must land

The storefront on **GitHub Pages is static**. It cannot run `POST /api/stripe/webhook` by itself.

Use the API custom domain (recommended):

`https://api.ilovecucci.com/api/stripe/webhook`

An apex path like `https://ilovecucci.com/api/stripe/webhook` only works if you
separately proxy `/api/*` to the Worker. Checkout still uses
`PUBLIC_SITE_URL=https://ilovecucci.com` for the customer return page.

### Code change already applied

The `sk_live_` hard-block in `getStripe()` has been removed. Live secrets are allowed when set in the **production** environment.

### Keep local test keys

Do **not** overwrite `artifacts/api-server/.env` or `artifacts/cucci/.env.local` with live keys. Local stays on `sk_test_` / `pk_test_`.

### Stripe Dashboard — Live mode ON

1. Finish account activation (business details + bank for payouts).
2. **API keys** → copy `pk_live_...` and `sk_live_...` (same account).
3. **Shipping rates** → create a **live** $8 USD fixed “Standard Shipping (US)” → copy live `shr_...`.
4. **Webhooks → Add endpoint**
   - Endpoint URL (only if `/api` is proxied to the API):
     `https://ilovecucci.com/api/stripe/webhook`
   - Or use your API host URL (see above).
   - Events:
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.async_payment_failed`
     - `checkout.session.expired`
     - `charge.refunded`
   - Copy the **live** signing secret → `STRIPE_WEBHOOK_SECRET=whsec_...`
5. Enable successful payment **receipt emails** (optional).
6. Leave Tax / promotion codes off until configured:
   - `STRIPE_AUTOMATIC_TAX_ENABLED=false`
   - `STRIPE_ALLOW_PROMOTION_CODES=false`
7. Payment methods: enable cards; Apple Pay may need domain verification for `ilovecucci.com`.

### Production Worker secrets + vars

**Secrets:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DATABASE_URL`  
**Vars:** `PUBLIC_SITE_URL`, `CORS_ORIGINS`, shipping flags (see `wrangler.jsonc`)

Health check after deploy: `GET https://api.ilovecucci.com/health`

### GitHub Actions secrets (Pages build)

| Secret | Live value |
|---|---|
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` |
| `VITE_API_URL` | `https://api.ilovecucci.com` (no trailing slash) |

Redeploy Pages after updating secrets.

### Post-deploy verification

1. Stripe Dashboard → Webhooks → send a test event → expect **2xx** from your endpoint.
2. One small real purchase (or carefully monitor first live order).
3. Confirm `/order-confirmation` shows paid, DB order is `paid`, inventory decremented once.
4. Confirm webhook delivery log is successful (not failing against GitHub Pages HTML).
5. Refund the verification charge in Stripe if it was only a go-live check.
