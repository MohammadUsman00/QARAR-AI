# Qarar AI - Decision Intelligence Platform

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.0-38B2AC?logo=tailwindcss)
![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?logo=google)
![Supabase](https://img.shields.io/badge/Database-Supabase-3FCF8E?logo=supabase)
![Stripe](https://img.shields.io/badge/Payments-Stripe-635BFF?logo=stripe)
![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest)
![Playwright](https://img.shields.io/badge/E2E-Playwright-2EAD33?logo=playwright)

Qarar is a forensic AI platform that helps users autopsy regretted decisions, identify recurring cognitive biases, and build a measurable personal decision profile over time.

## Problem Statement

Most people repeat expensive decision patterns because current tools are not designed for forensic self-analysis:

- Therapy is expensive and difficult to access quickly.
- Generic self-help does not adapt to personal historical patterns.
- Friends and peers provide emotionally biased advice.
- Existing journaling tools do not produce structured, testable pattern intelligence.

## Our Solution

Qarar combines structured AI analysis + decision history + profile modeling:

- Decision autopsy reports with root cause, bias detection, and trigger mapping.
- Longitudinal cognitive profile that improves with every analyzed decision.
- Plan-based feature gating to support free-first onboarding and paid expansion.
- Production-ready APIs for AI analysis, readiness/health checks, and payments.

## What We Have Built

### Product Surfaces

- Marketing + conversion: `/`, `/about`, `/pricing`
- Auth + onboarding: `/login`, `/signup`, `/onboarding`
- Core app:
  - `/dashboard`
  - `/autopsy` (+ `/autopsy/[id]` route alias)
  - `/history`
  - `/patterns`
  - `/profile`
  - `/upgrade`

### Core Backend APIs

- `POST /api/autopsy/analyze` - Gemini-powered autopsy engine
- `POST /api/patterns/generate` - profile narrative refresh
- `POST /api/stripe/checkout` - subscription checkout bootstrap
- `POST /api/stripe/webhook` - plan synchronization
- `GET /api/health` - operational health with dependency checks
- `GET /api/ready` - readiness probe for deployment gating

### Data + Security

- Supabase schema in `supabase/schema.sql`
- Row Level Security (RLS) policies across profile/decision/autopsy tables
- User-scoped reads and writes with Supabase Auth-backed identity

### Engineering Quality

- Typed domain utilities and API contracts
- Free-plan feature gating via `src/lib/plan-limits.ts`
- Unit/integration test suite with Vitest + coverage
- End-to-end smoke test with Playwright

## UI Screenshots (Real App Captures)

Captured directly from the running app (`npm run capture:ui`):

### Landing

![Qarar Landing UI](public/screenshots/landing.png)

### Login

![Qarar Login UI](public/screenshots/login.png)

### Signup

![Qarar Signup UI](public/screenshots/signup.png)

### Onboarding

![Qarar Onboarding UI](public/screenshots/onboarding.png)

## Tech Stack

- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts
- UI primitives: Radix-based components (shadcn-style patterns)
- AI: Google Gemini (`@google/generative-ai`)
- Database/Auth: Supabase PostgreSQL + Supabase Auth + RLS
- Payments: Stripe (free-first mode supports optional activation)
- State: Zustand
- Testing: Vitest, Testing Library, Playwright
- Deploy target: Vercel

## Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment

```bash
cp .env.example .env.local
```

3. Create Supabase schema

- Open your Supabase SQL editor.
- Run `supabase/schema.sql`.
- Enable Email auth and optional Google OAuth redirect:
  - `http://localhost:3000/auth/callback`

4. Start app

```bash
npm run dev
```

Open: `http://localhost:3000`

## Environment Variables

Required for core app readiness:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`

Optional (warn in health check if absent):

- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY`
- `NEXT_PUBLIC_STRIPE_PRICE_ELITE_MONTHLY`
- `RESEND_API_KEY`

## Test Commands

- `npm run lint` - static checks
- `npm run test` - unit + integration tests with coverage
- `npm run test:e2e` - Playwright smoke test
- `npm run test:all` - lint + unit + e2e
- `npm run capture:ui` - capture updated UI screenshots into `public/screenshots`

## Deployment Notes

- Deploy on Vercel with all required env vars.
- Point Stripe webhook endpoint to `/api/stripe/webhook` when billing is enabled.
- Use `/api/ready` for readiness probes and `/api/health` for operational visibility.
