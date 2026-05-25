# Cofinder — living memory

Project state summary. Keep under ~200 lines; move detail to `docs/topics/*` if it grows.
See `CLAUDE.md` (locked decisions) and `ARCHITECTURE.md` (full rationale).

## Current state (2026-05-24)

Init phase complete (tasks 1–10, 14, 15) — all committed, lint/typecheck green.
Foundation + backend + auth are **live-verified** against a local Supabase stack:
3 migrations apply clean, RLS + policies confirmed on all 4 tables, both auth
triggers present, `db lint` clean, and the `nearby-cafes` Edge Function runs
end-to-end (validation + cache path + Places fetch; only a real
`GOOGLE_PLACES_API_KEY` is needed for live cafe data).

Local test data and the dev-only test-login button have been removed. A Supabase
**Cloud** project exists (ref `ndogivynbzrpwcrzsiwb`) and `.env` now holds the real
cloud URL + anon key (gitignored). Local Supabase + Expo dev server are stopped
(local DB persisted in its Docker volume).

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

## Next steps

### Next session — wire the Cloud project (ref `ndogivynbzrpwcrzsiwb`)

`.env` is already filled with the real cloud URL + anon key. Remaining:

1. **Push schema**: `supabase link --project-ref ndogivynbzrpwcrzsiwb` then
   `supabase db push` (applies the 3 migrations to cloud).
2. **Google OAuth**: create an OAuth client in Google Cloud Console; in Supabase
   Dashboard → Authentication → Providers → Google, paste client id + secret and enable.
   Add `cofinder://**` to the allowed redirect URLs.
3. **Places**: enable "Places API (New)" + create an API key in Google Cloud;
   `supabase secrets set GOOGLE_PLACES_API_KEY=...`; deploy with
   `supabase functions deploy nearby-cafes`.
4. **Sanity check**: run the app, real Google login → lands on home.

### Feature phase (tasks 11–13) — needs a dev build

- `npx expo prebuild` + native run, or an EAS dev build (react-native-maps and
  expo-location are native; Expo Go won't run them).
- Add a TanStack Query provider in the root layout.
- 11 nearby cafes (map + list + geolocation), 12 cafe detail, 13 favorites.

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
