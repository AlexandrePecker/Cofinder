# Cofinder

App mobile para descobrir cafés bem avaliados perto de você.

Projeto de portfólio — Expo SDK 56 + Supabase + Google Places API.

## Stack

| Camada | Tecnologia |
|---|---|
| Mobile | Expo SDK 56 + React Native + TypeScript strict |
| Navegação | Expo Router (file-based, type-safe) |
| Auth + DB | Supabase (Postgres + Auth + RLS) |
| Dados de cafés | Google Places API (New) — somente server-side |
| Estado servidor | TanStack Query |
| Mapas | react-native-maps |
| Estilização | StyleSheet + design tokens (`src/theme`) |

## Funcionalidades

- Onboarding (3 slides, exibido uma vez via AsyncStorage)
- Auth: e-mail/senha + Google OAuth (PKCE)
- Home: cafés próximos com raio configurável (1–50km)
- Filtros: avaliação, preço, ordenação — bottom sheet
- Busca por nome (client-side)
- Detalhe do café: foto principal, mini-mapa, avaliações
- Favoritos: toggle + lista dedicada
- Avaliações: nota (1–5★) + comentário, edição, lista da comunidade
- Perfil: nome, upload de avatar, estatísticas, lista de avaliações

## Configuração

```bash
npm install
cp .env.example .env   # preencher EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY
bash scripts/install-hooks.sh   # hook de auditoria RLS no pre-commit (rodar uma vez)
```

Mapas e geolocalização exigem **dev build** (não funciona no Expo Go):

```bash
npx expo run:ios    # ou: eas build --profile development
```

Backend Supabase local:

```bash
supabase start               # Postgres + Auth + Studio + Edge runtime
supabase db reset            # aplica migrations + seed
supabase functions serve     # roda Edge Functions localmente
```

Para testar sem chave da Google Places API, rode `supabase/seed_dev.sql` no
SQL Editor do Supabase — insere 15 cafés de São Paulo com entradas de cache pré-aquecidas.

## Desenvolvimento

```bash
npm start          # servidor Expo
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run format     # Prettier
```

## Arquitetura

Veja [`ARCHITECTURE.md`](ARCHITECTURE.md) para as decisões de design.

A chave da Places API nunca chega ao cliente — fica como segredo da Edge Function do Supabase.
Todas as buscas de cafés passam pela Edge Function `nearby-cafes`, que cacheia os resultados
por célula geográfica de ~1,1km por 24h.

## Segurança

- RLS em todas as tabelas públicas; verificado por `scripts/audit-rls.sh` + hook de pre-commit
- Variáveis `EXPO_PUBLIC_*` são seguras para o cliente (protegidas por RLS)
- Chave da Places API e service role ficam somente no servidor
- `.env` está no gitignore; `.env.example` documenta as variáveis necessárias
