# Roadmigo

A social road-trip tracker for RVers: log trips, map the states you've visited, earn badges and trophies, follow friends, and get a yearly "Wrapped".

**Stack:** React + Vite + TypeScript + Tailwind/shadcn · Supabase (Postgres, auth, storage, edge functions) · Stripe subscriptions · Capacitor for iOS/Android.

## Run it locally

```sh
npm install
cp .env.example .env   # fill in your Supabase URL + key
npm run dev            # http://localhost:8080
npm test               # unit tests
npm run lint
```

## Deploy

The app has three parts, deployed separately:

| Part | Where | Cost to start |
| --- | --- | --- |
| Backend (database, auth, photos, payment functions) | Your own Supabase project | Free tier |
| Web app | Vercel, Netlify or Cloudflare Pages | Free tier |
| iPhone / Android apps | App Store / Google Play | Apple $99/yr, Google $25 once |

### 1. Backend: your own Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli), then from this repo:
   ```sh
   supabase login
   supabase link --project-ref YOUR-PROJECT-REF
   supabase db push                      # creates all tables, rules and triggers
   supabase functions deploy check-subscription create-checkout customer-portal
   supabase secrets set STRIPE_SECRET_KEY=sk_live_... SITE_URL=https://your-domain
   ```
3. **Auth → URL Configuration:** set *Site URL* to your web address, and add these *Redirect URLs*:
   `https://your-domain/**`, `capacitor://localhost`, `https://localhost`.
4. If you're moving off **Lovable Cloud**, export your data from Lovable (Cloud → Database → export) *before*
   cancelling, then import users/data into the new project. See
   [Lovable's self-hosting guide](https://docs.lovable.dev/tips-tricks/self-hosting).

### 2. Web app

Connect this GitHub repo to Vercel (or Netlify / Cloudflare Pages):

- Build command: `npm run build` · Output directory: `dist`
- Environment variables: everything in `.env.example`
- SPA routing is already configured (`vercel.json`, `public/_redirects`)

Every push to `main` redeploys.

### 3. iPhone and Android apps

Requires a Mac with Xcode for iOS, and Android Studio for Android.

```sh
npm run build
npx cap add ios        # first time only
npx cap add android    # first time only
npx cap sync
npx cap open ios       # then Product → Archive in Xcode → upload to App Store Connect
npx cap open android   # then Build → Generate Signed Bundle
```

Run `npm run build && npx cap sync` before every native release. For live reload while developing, see the
comment in `capacitor.config.ts`.

**Payments on iOS:** apps on the US App Store may link out to Stripe checkout. In other countries, Apple requires
In-App Purchase for digital subscriptions, so either limit the iOS app to the US storefront at first or add
In-App Purchase (e.g. via RevenueCat) before launching elsewhere.

## Project layout

- `src/pages` – screens; `src/components` – UI pieces
- `src/context` – auth, trips, social, subscription state
- `src/lib/gamification.ts` – badges, trophies, streaks, levels (XP formula mirrors the database)
- `src/lib/trips.ts` – trip loading, feed paging, photo uploads
- `supabase/migrations` – database schema and security rules (applied in order)
- `supabase/functions` – Stripe edge functions
