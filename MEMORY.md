# Cofinder — living memory

Project state summary. Keep under ~200 lines; move detail to `docs/topics/*` if it grows.
See `CLAUDE.md` (locked decisions) and `ARCHITECTURE.md` (full rationale).

## Current state (2026-05-26)

App feature-complete (v2). All migrations deployed. Edge Functions live.

### What works end-to-end
- Onboarding → email/senha auth → home with cafes (20km default)
- Filter bottom sheet (radius 1–50km, rating, price, sort)
- Search by name
- Cafe detail: hero photo (`cafe-photo` Edge Function), mini-map, reviews
- Favorites: toggle + list
- Reviews: rate + comment, saved to DB, shown in cafe detail + profile
- Profile: display name, avatar, stats (review count + avg rating), reviews list

### Migrations deployed (7 total)
- `profiles`, `cafes_cache`, `favorites`, `avatars_storage`, `profiles_constraints`,
  `reviews`, `reviews_comment_length`

### Edge Functions deployed
- `nearby-cafes` — Places proxy, cache-first per geo cell, JWT-gated, MAX_RADIUS 50km
- `cafe-photo` — Places photo proxy, JWT-gated, 24h Cache-Control

### Dev seed
`supabase/seed_dev.sql` — 15 SP cafes + cache for 5 radius buckets. Run in SQL Editor
to test without a Places API key.

## Backlog

- Photo placeholder when `photo_ref` is null (hero shows empty view)
- Dot animation in onboarding (instant jump, no Animated)
- Regenerate Google OAuth client secret (exposed in old chat history)
- `FilterBar` component in `filter-bar.tsx` is dead code — only exports types
- `npm audit fix` — 11 moderate (uuid via xcode/expo-splash-screen, build tooling only)

## Gotchas / decisions worth remembering

- **Maps + location require a dev build** — Expo Go will not run them.
- **Places key is server-side only.** Never call Places from the client; go through
  the `nearby-cafes` Edge Function.
- **MAX_RADIUS is 50km** (was 20km). Cell key includes radius, so different radii are
  separate cache entries.
- **SecureStore has a ~2KB limit** that breaks Supabase sessions → we use AsyncStorage.
  Encrypted upgrade path is a "LargeSecureStore" adapter if needed.
- **Local Google sign-in** needs `[auth.external.google] enabled = true` in config.toml
  plus `SUPABASE_AUTH_EXTERNAL_GOOGLE_*` env vars (kept disabled by default so
  `supabase start` works without credentials).
- Deno Edge Functions are excluded from the Expo tsconfig + ESLint (different runtime).
- Pre-commit hook only audits when `supabase/migrations/` files are staged.
- `supabase.upsert()` can silently succeed (no error) but save nothing when RLS blocks it.
  Always chain `.select()` and check `data.length > 0` for mutations that must persist.
