# Qarar AI

Forensic decision autopsies powered by **Google Gemini** (no Anthropic dependency), **Supabase** (PostgreSQL + Auth), and **Next.js 14** (App Router).

## Free build first

- Core flows work with **Gemini + Supabase + Vercel-ready Next.js**.
- **Stripe** is optional: checkout returns HTTP 501 until `STRIPE_SECRET_KEY` and price IDs are set.

## Setup

1. **Install**

   ```bash
   npm install
   ```

2. **Supabase**

   - Create a project and run `supabase/schema.sql` in the SQL editor (enables RLS policies).
   - Enable **Email** auth and (optionally) **Google** OAuth; set redirect URL to `http://localhost:3000/auth/callback` (and production URL later).

3. **Environment**

   - Copy `.env.example` to `.env.local` and fill values.

4. **Run**

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000`.

## Key env vars

| Variable              | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `GEMINI_API_KEY`      | Google AI Studio / Vertex key for autopsies |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server client |
| `SUPABASE_SERVICE_ROLE_KEY` | Stripe webhooks updating `user_profiles` (server only) |

## Scripts

- `npm run dev` — development
- `npm run build` — production build
- `npm run start` — serve production build

## Notes

- Autopsy analysis: `src/lib/gemini.ts` + `POST /api/autopsy/analyze`.
- Charts use **Recharts** with `dynamic(..., { ssr: false })` where needed.
- Feature gating: `src/lib/plan-limits.ts` (free tier: 3 lifetime autopsies, patterns locked on `/patterns`).

## Deploy (Vercel)

- Set the same environment variables in the Vercel project.
- Add `GEMINI_API_KEY` and Supabase keys.
- Configure Stripe webhook URL to `/api/stripe/webhook` when billing goes live.
