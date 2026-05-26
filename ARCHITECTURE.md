# Cofinder — Architecture

Mobile app to discover well-rated cafes near the user's location.
Portfolio / personal project. No AI agent.

## Stack and why

| Layer            | Choice                                               | Why this one                                                                                                                                                |
| ---------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile runtime   | **Expo SDK 56 + React Native + TypeScript (strict)** | One codebase for iOS + Android; geolocation, maps and auth are all first-class. Strict TS catches errors before they ship.                                  |
| Navigation       | **Expo Router** (file-based)                         | Type-safe routes, deep linking out of the box (needed for the OAuth callback).                                                                              |
| Auth + database  | **Supabase** (Postgres + Auth + RLS)                 | Managed Google OAuth, Postgres with Row Level Security, generous free tier. No server to run or patch.                                                      |
| Cafe data        | **Google Places API (New)**                          | Best ratings/reviews/photos coverage — the core of "well-rated". Paid, so it is **cached** (see Cost).                                                      |
| Cafe-data access | **Supabase Edge Function** (Deno)                    | Keeps the Places API key server-side; the client never sees it. Also where caching lives.                                                                   |
| Server state     | **TanStack Query**                                   | Client-side caching, retries, offline-awareness for cafe lists and user data.                                                                               |
| Maps             | **react-native-maps**                                | Mature RN map component (Google provider). Native module → requires a dev build.                                                                            |
| Styling          | **StyleSheet + design tokens**                       | No Tailwind/NativeWind. Tokens centralize colors/spacing/type; predictable and dependency-free.                                                             |
| Session storage  | **AsyncStorage**                                     | Supabase's documented Expo pattern; reliable for session payloads. Upgrade path: an encrypted "LargeSecureStore" adapter if at-rest encryption is required. |

Decision rule: every dependency must justify itself. We avoided extra OAuth/styling
libraries by using the OAuth web flow (expo-web-browser + expo-linking) and StyleSheet.

## How to run

```bash
npm install
cp .env.example .env          # fill EXPO_PUBLIC_SUPABASE_URL + ANON_KEY
npm start                     # Expo dev server
npm run lint                  # ESLint (expo + prettier)
npm run typecheck             # tsc --noEmit
npm run format                # prettier --write
bash scripts/install-hooks.sh # install the pre-commit RLS audit (run once)
```

Local backend (requires Docker running):

```bash
supabase start                # Postgres + Auth + Studio + Edge runtime
supabase db reset             # apply migrations + seed
supabase functions serve      # run Edge Functions locally
```

> Maps and geolocation are native modules — they need an Expo **dev build**
> (`npx expo prebuild` + native run, or EAS dev build), not Expo Go.

## Ports (local Supabase)

| Service                        | Port  |
| ------------------------------ | ----- |
| API (PostgREST/Auth/Functions) | 54321 |
| Postgres                       | 54322 |
| Studio                         | 54323 |
| Inbucket (email testing)       | 54324 |

## Folder structure

```
src/
  app/
    (tabs)/       Home, Favorites, Profile tabs
    cafe/[id].tsx Cafe detail — hero photo, mini-map, reviews
    onboarding.tsx  3-slide first-run flow (AsyncStorage flag)
    login.tsx     Email/senha + Google OAuth
    register.tsx
    profile/
      reviews.tsx   Full "my reviews" list
    _layout.tsx   Providers + auth/onboarding gate
  components/     Shared UI — themed-text, themed-view, filter-sheet,
                  search-bar, star-picker, snackbar-provider, cafe-skeleton
  features/
    auth/         auth-context (session, signIn, signOut)
    cafes/        use-nearby-cafes, use-favorites, use-favorite-cafes, use-location, types
    profile/      use-profile (display name, avatar upload)
    reviews/      use-reviews, use-submit-review, use-my-reviews, types
  hooks/          use-theme, use-color-scheme
  lib/            env, supabase client
  theme/          Design tokens (colors, spacing, type, radius, shadow)
supabase/
  config.toml     Local stack + auth provider config
  migrations/     Versioned SQL — 7 migrations (RLS + policy in the same file)
  functions/      Edge Functions (Deno):
                    nearby-cafes  — Places proxy, cache-first, JWT-gated
                    cafe-photo    — Places photo proxy, JWT-gated
                    _shared/      — cors, places helpers
  seed_dev.sql    15 SP cafes + cache entries for dev without Places API key
scripts/
  audit-rls.sh    Enforces "RLS + policy in the same migration"
  git-hooks/      pre-commit runs the RLS audit on staged migrations
```

## Security decisions

- **Places API key never reaches the client.** It lives as a Supabase Edge Function
  secret; the app calls the `nearby-cafes` function, which calls Google server-side.
- **Client only gets public Supabase vars** (`EXPO_PUBLIC_SUPABASE_URL`, anon key).
  The anon key is safe to ship because every table is protected by RLS.
- **RLS on every public table, with policies in the same migration.** Enforced by
  `scripts/audit-rls.sh` + a pre-commit hook — discipline alone is not trusted.
- **Owner-scoped data**: `profiles`, `favorites`, and `reviews` (write) are scoped to
  `auth.uid()`. Reviews are readable by all authenticated users. Cache tables are
  written only by the service role.
- **Edge Function requires a user JWT** (`verify_jwt = true`) — only signed-in users
  can trigger paid Places lookups.
- **PKCE OAuth flow**, foreground-only token refresh, no secrets in git
  (`.env` ignored, `.env.example` tracked).

## Cost model

Google Places API (New) bills per request; **caching is the cost control, not an
optimization.** Ballpark (verify current pricing — it changes):

- Nearby Search ≈ a few US cents per request.
- Place Details ≈ a few US cents per request.

Controls in place:

- `nearby-cafes` caches results per ~1.1km geo cell for 24h → repeat searches in an
  area cost **zero** API calls.
- `cafes` table stores normalized cafe records, reused across searches and the detail
  screen.
- The function clamps radius (≤ 50km). Different radius values are separate cache
  entries (radius is part of the cell key).
- `cafe-photo` proxies photo requests with 24h `Cache-Control` — photos are not stored
  in Supabase Storage; they are fetched on demand and cached by the HTTP layer.

A user browsing the same neighborhood repeatedly hits cache, not the paid API.
