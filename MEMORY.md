# Cofinder — memória viva

Resumo do estado do projeto. Manter abaixo de ~200 linhas; mover detalhes para `docs/topics/*` se crescer.
Ver `CLAUDE.md` (decisões imutáveis) e `ARCHITECTURE.md` (justificativas completas).

## Estado atual (2026-05-26)

App feature-complete (v2). Todas as migrations deployadas. Edge Functions no ar.

### O que funciona end-to-end
- Onboarding → auth e-mail/senha → home com cafés (20km padrão)
- Bottom sheet de filtros (raio 1–50km, avaliação, preço, ordenação)
- Busca por nome
- Detalhe do café: foto principal (Edge Function `cafe-photo`), mini-mapa, avaliações
- Favoritos: toggle + lista
- Avaliações: nota + comentário, salvo no DB, exibido no detalhe do café + perfil
- Perfil: nome de exibição, avatar, estatísticas (contagem de avaliações + média), lista de avaliações

### Migrations deployadas (7 total)
- `profiles`, `cafes_cache`, `favorites`, `avatars_storage`, `profiles_constraints`,
  `reviews`, `reviews_comment_length`

### Edge Functions deployadas
- `nearby-cafes` — proxy Places, cache-first por célula geo, JWT-gated, MAX_RADIUS 50km
- `cafe-photo` — proxy de fotos Places, JWT-gated, Cache-Control 24h

### Seed de desenvolvimento
`supabase/seed_dev.sql` — 15 cafés SP + cache para 5 buckets de raio. Rodar no SQL Editor
para testar sem chave da Places API.

## Backlog

- Placeholder de foto quando `photo_ref` é null (hero mostra view vazia)
- Animação de dots no onboarding (salto instantâneo, sem Animated)
- Regenerar client secret do Google OAuth (exposto em histórico antigo de chat)
- Componente `FilterBar` em `filter-bar.tsx` é código morto — só exporta tipos
- `npm audit fix` — 11 moderadas (uuid via xcode/expo-splash-screen, só build tooling)

## Gotchas / decisões que valem lembrar

- **Mapas + localização exigem dev build** — Expo Go não roda.
- **Chave da Places é server-side only.** Nunca chamar Places do cliente; passar pela
  Edge Function `nearby-cafes`.
- **MAX_RADIUS é 50km** (era 20km). A chave da célula inclui raio, então raios diferentes
  são entradas de cache separadas.
- **SecureStore tem limite de ~2KB** que quebra sessões do Supabase → usamos AsyncStorage.
  Caminho de upgrade criptografado é um adapter "LargeSecureStore" se necessário.
- **Google sign-in local** precisa de `[auth.external.google] enabled = true` no config.toml
  mais vars `SUPABASE_AUTH_EXTERNAL_GOOGLE_*` (desabilitado por padrão para que
  `supabase start` funcione sem credenciais).
- Edge Functions Deno são excluídas do tsconfig + ESLint do Expo (runtime diferente).
- Hook de pre-commit só audita quando arquivos de `supabase/migrations/` estão staged.
- `supabase.upsert()` pode silenciosamente ter sucesso (sem erro) mas não salvar nada quando
  RLS bloqueia. Sempre encadear `.select()` e checar `data.length > 0` em mutations que
  precisam persistir.
