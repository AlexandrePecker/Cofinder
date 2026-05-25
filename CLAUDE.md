@AGENTS.md

# Cofinder — project context

Mobile app to discover **well-rated cafes near the user's location**.
Portfolio / personal project. No AI agent. Built carefully, quality over speed.

See `ARCHITECTURE.md` for the full stack rationale and `MEMORY.md` for current state.

## Locked decisions (do not relitigate without reason)

- **Expo SDK 56 + Expo Router + TypeScript strict.** Read the versioned Expo docs
  (see AGENTS.md) before using SDK APIs — SDK 56 changed a lot.
- **Supabase** for auth + DB. **Google Places API (New)** for cafe data.
- **Places API key is server-side only**, proxied through the `nearby-cafes` Edge
  Function. The client must never hold it. Adding a client-side Places call is a bug.
- **Cache-first for Places.** Any new Places usage must go through the cache layer;
  cost is a design constraint.
- **RLS on every public table, with the policy in the same migration as the table.**
  The pre-commit hook (`scripts/audit-rls.sh`) enforces this — do not bypass it.
- **Styling = StyleSheet + tokens from `src/theme`.** No Tailwind/NativeWind; no
  hardcoded colors/spacing — use the tokens.

## Conventions

- Path alias `@/*` → `src/*`.
- Routes live in `src/app` and stay thin; logic lives in `src/features/*`.
- Run `npm run lint` + `npm run typecheck` before committing.
- Commits: Conventional Commits. Migrations: `supabase migration new <name>`, with
  RLS + policy in the same file.
- Deno Edge Functions (`supabase/functions`) are excluded from the Expo tsconfig/ESLint.

## Glossary

- **cafe / place** — a cafe from Google Places, keyed by `place_id`.
- **cell / cell_key** — a coarse (~1.1km) geo bucket used to cache nearby searches.
- **cache tables** — `cafes` (cafe details) and `places_search_cache` (search results
  per cell); written only by the Edge Function's service role.
