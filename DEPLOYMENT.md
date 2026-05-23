# Deployment checklist

Use this before promoting Qarar to production (Vercel, Railway, or any Node 18+ host).

## 1. Database (Supabase)

Run in order in the SQL editor:

1. `supabase/schema.sql`
2. `supabase/migrations/002_profile_extensions.sql`
3. `supabase/migrations/003_autopsy_inference_metadata.sql`
4. `supabase/migrations/004_durable_ai_rate_limits.sql`
5. `supabase/migrations/005_pipeline_extensions.sql`

**Auth → URL configuration**

- Site URL: `https://<your-production-domain>`
- Redirect URLs: `https://<your-production-domain>/auth/callback`

## 2. Environment variables

Copy from `.env.example` into your host dashboard.

| Variable | Required | Notes |
|----------|:--------:|-------|
| `NEXT_PUBLIC_APP_URL` | Yes | Production URL, no trailing slash |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | |
| `GEMINI_API_KEY` | Yes | Server only |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server only — webhooks, deletes, rate limits |
| `GEMINI_MODEL` | Optional | Default `gemini-2.0-flash` |
| `STRIPE_SECRET_KEY` | If billing | |
| `STRIPE_WEBHOOK_SECRET` | If billing | |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | If billing | |
| `NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY` | If billing | |
| `NEXT_PUBLIC_STRIPE_PRICE_ELITE_MONTHLY` | If billing | |
| `RESEND_API_KEY` | Optional | Payment-failure emails |
| `RESEND_FROM_EMAIL` | Optional | Verified sender in Resend |

## 3. Stripe webhook

- Endpoint: `https://<domain>/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

## 4. Build and verify locally

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

## 5. Post-deploy probes

- `GET /api/ready` → 200 when app is up
- `GET /api/health` → reports env presence (warn on optional keys)
- Sign up → onboarding → first autopsy
- Pro checkout (if Stripe configured)

## 6. Vercel (recommended)

- Framework preset: **Next.js**
- Build command: `npm run build`
- Output: default (Next.js)
- Install command: `npm ci`
- Node.js: **20.x**

No custom `vercel.json` is required; security headers are set in `next.config.mjs`.
