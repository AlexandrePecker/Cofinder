# Cofinder — Arquitetura

App mobile para descobrir cafés bem avaliados próximos ao usuário.
Projeto de portfólio / pessoal. Sem agente de IA.

## Stack e justificativas

| Camada           | Escolha                                              | Por quê                                                                                                                                                     |
| ---------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime mobile   | **Expo SDK 56 + React Native + TypeScript (strict)** | Uma base de código para iOS + Android; geolocalização, mapas e auth são nativos. TypeScript strict captura erros antes de entrar em produção.               |
| Navegação        | **Expo Router** (file-based)                         | Rotas type-safe, deep linking nativo (necessário para o callback OAuth).                                                                                    |
| Auth + banco     | **Supabase** (Postgres + Auth + RLS)                 | Google OAuth gerenciado, Postgres com Row Level Security, tier gratuito generoso. Sem servidor para manter.                                                 |
| Dados de cafés   | **Google Places API (New)**                          | Melhor cobertura de avaliações/fotos — o núcleo do "bem avaliado". Pago, portanto **cacheado** (ver Custo).                                                 |
| Acesso aos dados | **Supabase Edge Function** (Deno)                    | Mantém a chave da Places API no servidor; o cliente nunca a vê. É onde o cache vive.                                                                        |
| Estado servidor  | **TanStack Query**                                   | Cache client-side, retentativas, awareness offline para listas de cafés e dados do usuário.                                                                 |
| Mapas            | **react-native-maps**                                | Componente de mapa RN maduro (provider Google). Módulo nativo → exige dev build.                                                                            |
| Estilização      | **StyleSheet + design tokens**                       | Sem Tailwind/NativeWind. Tokens centralizam cores/espaçamento/tipografia; previsível e sem dependências extras.                                             |
| Sessão           | **AsyncStorage**                                     | Padrão documentado do Supabase para Expo; confiável para payloads de sessão. Caminho de upgrade: adapter "LargeSecureStore" se criptografia em repouso for necessária. |

Regra de decisão: toda dependência precisa se justificar. Evitamos bibliotecas extras de OAuth/estilização usando o fluxo web OAuth (expo-web-browser + expo-linking) e StyleSheet.

## Como rodar

```bash
npm install
cp .env.example .env          # preencher EXPO_PUBLIC_SUPABASE_URL + ANON_KEY
npm start                     # servidor Expo
npm run lint                  # ESLint (expo + prettier)
npm run typecheck             # tsc --noEmit
npm run format                # prettier --write
bash scripts/install-hooks.sh # instalar o hook de auditoria RLS no pre-commit (rodar uma vez)
```

Backend local (requer Docker rodando):

```bash
supabase start                # Postgres + Auth + Studio + Edge runtime
supabase db reset             # aplica migrations + seed
supabase functions serve      # roda Edge Functions localmente
```

> Mapas e geolocalização são módulos nativos — precisam de um **dev build** do Expo
> (`npx expo prebuild` + run nativo, ou EAS dev build), não funcionam no Expo Go.

## Portas (Supabase local)

| Serviço                        | Porta |
| ------------------------------ | ----- |
| API (PostgREST/Auth/Functions) | 54321 |
| Postgres                       | 54322 |
| Studio                         | 54323 |
| Inbucket (testes de e-mail)    | 54324 |

## Estrutura de pastas

```
src/
  app/
    (tabs)/       Tabs Home, Favoritos, Perfil
    cafe/[id].tsx Detalhe do café — foto principal, mini-mapa, avaliações
    onboarding.tsx  Fluxo de primeira execução com 3 slides (flag AsyncStorage)
    login.tsx     E-mail/senha + Google OAuth
    register.tsx
    profile/
      reviews.tsx   Lista completa de "minhas avaliações"
    _layout.tsx   Providers + gate de auth/onboarding
  components/     UI compartilhada — themed-text, themed-view, filter-sheet,
                  search-bar, star-picker, snackbar-provider, cafe-skeleton
  features/
    auth/         auth-context (session, signIn, signOut)
    cafes/        use-nearby-cafes, use-favorites, use-favorite-cafes, use-location, types
    profile/      use-profile (nome de exibição, upload de avatar)
    reviews/      use-reviews, use-submit-review, use-my-reviews, types
  hooks/          use-theme, use-color-scheme
  lib/            env, cliente supabase
  theme/          Design tokens (cores, espaçamento, tipografia, radius, sombra)
supabase/
  config.toml     Configuração do stack local + providers de auth
  migrations/     SQL versionado — 7 migrations (RLS + policy no mesmo arquivo)
  functions/      Edge Functions (Deno):
                    nearby-cafes  — proxy Places, cache-first, JWT-gated
                    cafe-photo    — proxy de fotos Places, JWT-gated
                    _shared/      — cors, helpers Places
  seed_dev.sql    15 cafés SP + entradas de cache para dev sem chave Places API
scripts/
  audit-rls.sh    Garante "RLS + policy na mesma migration"
  git-hooks/      pre-commit roda a auditoria RLS nas migrations staged
```

## Decisões de segurança

- **Chave da Places API nunca chega ao cliente.** Vive como segredo da Edge Function do Supabase;
  o app chama a função `nearby-cafes`, que chama o Google server-side.
- **Cliente recebe apenas vars públicas do Supabase** (`EXPO_PUBLIC_SUPABASE_URL`, anon key).
  A anon key é segura para distribuir porque toda tabela é protegida por RLS.
- **RLS em toda tabela pública, com policies na mesma migration.** Garantido por
  `scripts/audit-rls.sh` + hook de pre-commit — disciplina sozinha não é suficiente.
- **Dados com escopo por dono**: `profiles`, `favorites` e `reviews` (escrita) são escopados a
  `auth.uid()`. Reviews são legíveis por todos os usuários autenticados. Tabelas de cache só
  são escritas pelo service role.
- **Edge Function exige JWT do usuário** (`verify_jwt = true`) — somente usuários logados
  podem disparar chamadas pagas à Places API.
- **Fluxo OAuth PKCE**, refresh de token somente em foreground, nenhum segredo no git
  (`.env` ignorado, `.env.example` rastreado).

## Modelo de custo

A Google Places API (New) cobra por requisição; **o cache é o controle de custo, não uma
otimização.** Estimativa (verificar preço atual — muda com frequência):

- Nearby Search ≈ alguns centavos de dólar por requisição.
- Place Details ≈ alguns centavos de dólar por requisição.

Controles implementados:

- `nearby-cafes` cacheia resultados por célula geográfica de ~1,1km por 24h → buscas repetidas
  na mesma área custam **zero** chamadas à API.
- Tabela `cafes` armazena registros normalizados de cafés, reutilizados entre buscas e a tela
  de detalhe.
- A função limita o raio (≤ 50km). Raios diferentes são entradas de cache separadas (raio faz
  parte da chave da célula).
- `cafe-photo` faz proxy de fotos com `Cache-Control` de 24h — fotos não ficam armazenadas
  no Supabase Storage; são buscadas sob demanda e cacheadas pela camada HTTP.

Um usuário navegando no mesmo bairro repetidamente acerta o cache, não a API paga.
