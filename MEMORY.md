# Cofinder — living memory

Project state summary. Keep under ~200 lines; move detail to `docs/topics/*` if it grows.
See `CLAUDE.md` (locked decisions) and `ARCHITECTURE.md` (full rationale).

## Current state (2026-05-25)

Cloud setup complete. Google OAuth working on dev build. Places API key pending
(skipped for now — no budget). `nearby-cafes` Edge Function deployed but will
return error on actual Places fetch until key is set.

Done:

- Expo SDK 56 + Expo Router + TS strict; ESLint (expo+prettier) + Prettier + EditorConfig.
- Design tokens in `src/theme` (light/dark colors, spacing, type, radius, shadow).
- Env via `EXPO_PUBLIC_*` + typed `src/lib/env.ts`; `.env` gitignored.
- Supabase initialized; migrations: `profiles`, `cafes`, `places_search_cache`, `favorites`
  (all with RLS + policies in-file).
- `scripts/audit-rls.sh` + pre-commit hook (verified: catches a table without RLS).
- Edge Function `nearby-cafes`: Places proxy, cache-first per geo cell, JWT-gated. Deployed to cloud.
- Auth: Supabase client (AsyncStorage + PKCE), AuthProvider (Google OAuth + signOut),
  login screen, session-gated routing, protected home with profile + sign out.
- **Cloud wired**: schema pushed (3 migrations), Google OAuth configured, `nearby-cafes` deployed.
- **Dev build**: `npx expo run:ios` done — `cofinder://` scheme registered, OAuth works end-to-end.

## Next steps

### Feature phase (tasks 11–13)

- Add TanStack Query provider in the root layout.
- 11 nearby cafes (map + list + geolocation), 12 cafe detail, 13 favorites.
- When ready for Places data: `supabase secrets set GOOGLE_PLACES_API_KEY=...`

### Pending
- `expo-crypto` not installed — WebCrypto warning on every PKCE flow (PKCE still works with "plain" method, but less secure). Fix: install `expo-crypto` + configure as crypto adapter in Supabase client.

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
