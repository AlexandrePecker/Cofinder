# Cofinder

Mobile app to discover well-rated cafes near your location.

Portfolio project — Expo SDK 56 + Supabase + Google Places API.

## Stack

| Layer | Choice |
|---|---|
| Mobile | Expo SDK 56 + React Native + TypeScript strict |
| Navigation | Expo Router (file-based, type-safe) |
| Auth + DB | Supabase (Postgres + Auth + RLS) |
| Cafe data | Google Places API (New) — server-side only |
| Server state | TanStack Query |
| Maps | react-native-maps |
| Styling | StyleSheet + design tokens (`src/theme`) |

## Features

- Onboarding (3 slides, shown once via AsyncStorage)
- Auth: email/senha + Google OAuth (PKCE)
- Home: cafes nearby with configurable radius (1–50km)
- Filters: rating, price, sort — bottom sheet
- Search by name (client-side)
- Cafe detail: hero photo, mini-map, reviews
- Favorites: toggle + dedicated list
- Reviews: rate (1–5★) + comment, edit, community list
- Profile: display name, avatar upload, stats, reviews list

## Setup

```bash
npm install
cp .env.example .env   # fill EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY
bash scripts/install-hooks.sh   # pre-commit RLS audit (run once)
```

Maps and geolocation require a **dev build** (not Expo Go):

```bash
npx expo run:ios    # or: eas build --profile development
```

Local Supabase backend:

```bash
supabase start               # Postgres + Auth + Studio + Edge runtime
supabase db reset            # apply migrations + seed
supabase functions serve     # run Edge Functions locally
```

To test without a Google Places API key, run `supabase/seed_dev.sql` in the
Supabase SQL Editor — it inserts 15 São Paulo cafes with pre-warmed cache entries.

## Development

```bash
npm start          # Expo dev server
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run format     # Prettier
```

## Architecture

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for design rationale.

The Places API key never reaches the client — it lives as a Supabase Edge Function
secret. All cafe lookups go through the `nearby-cafes` Edge Function which caches
results per ~1.1km geo cell for 24h.

## Security

- RLS on every public table; enforced by `scripts/audit-rls.sh` + pre-commit hook
- `EXPO_PUBLIC_*` vars are safe to ship (protected by RLS)
- Places key + service role key are server-side only
- `.env` is gitignored; `.env.example` tracks required vars
