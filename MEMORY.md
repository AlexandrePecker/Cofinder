# Cofinder — living memory

Project state summary. Keep under ~200 lines; move detail to `docs/topics/*` if it grows.
See `CLAUDE.md` (locked decisions) and `ARCHITECTURE.md` (full rationale).

## Current state (2026-05-24)

Foundation + backend + auth are **written and committed**; not yet verified against a
live Postgres / Places API (deferred to a batch verification step).

Done:

- Expo SDK 56 + Expo Router + TS strict; ESLint (expo+prettier) + Prettier + EditorConfig.
- Design tokens in `src/theme` (light/dark colors, spacing, type, radius, shadow).
- Env via `EXPO_PUBLIC_*` + typed `src/lib/env.ts`; `.env` gitignored.
- Supabase initialized; migrations: `profiles`, `cafes`, `places_search_cache`, `favorites`
  (all with RLS + policies in-file).
- `scripts/audit-rls.sh` + pre-commit hook (verified: catches a table without RLS).
- Edge Function `nearby-cafes`: Places proxy, cache-first per geo cell, JWT-gated.
- Auth: Supabase client (AsyncStorage + PKCE), AuthProvider (Google OAuth + signOut),
  login screen, session-gated routing, protected home with profile + sign out.

## Next up

- Feature phase (tasks 11–13): nearby cafes (map + list + geolocation), cafe detail,
  favorites. **Needs a dev build** (react-native-maps, expo-location are native) +
  TanStack Query.
- Batch live verification: `supabase start` + `db reset` + `functions serve`;
  real Google OAuth needs Google Cloud creds + Supabase config.
- Final security pass (`/hm-security` L1).

## Gotchas / decisions worth remembering

- **Maps + location require a dev build** — Expo Go will not run them.
- **Places key is server-side only.** Never call Places from the client; go through
  the `nearby-cafes` Edge Function.
- **SecureStore has a ~2KB limit** that breaks Supabase sessions → we use AsyncStorage.
  Encrypted upgrade path is a "LargeSecureStore" adapter if needed.
- **Local Google sign-in** needs `[auth.external.google] enabled = true` in config.toml
  plus `SUPABASE_AUTH_EXTERNAL_GOOGLE_*` env vars (kept disabled by default so
  `supabase start` works without credentials).
- Deno Edge Functions are excluded from the Expo tsconfig + ESLint (different runtime).
- Pre-commit hook only audits when `supabase/migrations/` files are staged.
