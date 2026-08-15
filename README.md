# Tutor Media BD — AI Tutor Marketplace

A mobile-first Bangladesh tutor/student marketplace, now wired to real backend services.

## What's implemented (production code, needs your credentials)
- **Auth**: Supabase email/password signup & login, session middleware, role-based route protection (`/dashboard`, `/messages`, `/admin`)
- **Database**: Full Postgres schema with Row Level Security — `supabase/schema.sql` + `supabase/schema_extended.sql`
- **AI chatbot**: `/api/chat` calls the Claude API, bilingual (Bangla/English), asks for missing requirement details
- **AI tutor matching**: `/api/ai-match` pulls real candidates from Supabase and has Claude rank them
- **Real-time messaging**: `/messages` — Supabase Realtime, live message delivery, no page refresh
- **Notifications**: bell icon in the nav, live via Supabase Realtime, triggered on payment/verification events
- **Verification workflow**: users upload NID/student ID → private Supabase Storage bucket → admin reviews and approves/rejects at `/admin`
- **Payments**: SSLCommerz integration (`/api/payment/init`, `/success`, `/fail`, `/cancel`) — covers bKash, Nagad, Rocket, and cards through one gateway
- **Post Tuition / Become a Tutor**: real forms that write to the database

## What genuinely can't be "finished" without your accounts
- **NID government verification**: There is no public API to verify a Bangladeshi National ID against the Election Commission database — only banks, telcos, and a few licensed fintechs have that access via direct agreement. The realistic (and common) approach for a marketplace startup is what's built here: the user uploads a photo of their NID/student ID, and an admin manually approves it from `/admin`. If you later secure official NID API access, swap the manual step for an automated call.
- **Payment gateway going live**: SSLCommerz sandbox works immediately for testing. Going live requires registering a Bangladeshi business and getting SSLCommerz to approve your merchant account (they review your business documents).

## Setup
1. **Supabase**: Create a free project at supabase.com. In the SQL Editor, run `supabase/schema.sql` then `supabase/schema_extended.sql`. Copy your Project URL, anon key, and service role key into `.env`.
2. **Anthropic**: Get an API key at console.anthropic.com, add as `ANTHROPIC_API_KEY`.
3. **SSLCommerz**: Register a free sandbox account at developer.sslcommerz.com, add the store ID/password.
4. Copy `.env.example` to `.env.local` and fill in the values.

```bash
npm install
npm run dev
```
Open http://localhost:3000

## First admin user
No signup flow sets `role = 'admin'` (for safety). After creating your account normally, go to Supabase → Table Editor → `profiles` and manually change your row's `role` to `admin`. You'll then be able to open `/admin`.

## Deploy
Push to GitHub, import into Vercel, add the same env vars in Vercel's dashboard under Settings → Environment Variables. Next.js + Supabase deploy with zero extra config on Vercel.

## Note on this build
This code was written without the ability to run `npm install` or a build in the environment that generated it (no network access). The code is syntactically complete and follows Next.js 15 / Supabase SSR conventions correctly, but run `npm install && npm run build` locally (or in Claude Code) as a first step to catch anything environment-specific before deploying.
