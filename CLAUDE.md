@AGENTS.md

# Cofinder — contexto do projeto

App mobile para descobrir **cafés bem avaliados próximos ao usuário**.
Projeto de portfólio / pessoal. Sem agente de IA. Construído com cuidado, qualidade acima de velocidade.

Ver `ARCHITECTURE.md` para a justificativa completa da stack e `MEMORY.md` para o estado atual.

## Decisões imutáveis (não reabrir sem motivo)

- **Expo SDK 56 + Expo Router + TypeScript strict.** Ler a documentação versionada do Expo
  (ver AGENTS.md) antes de usar APIs do SDK — o SDK 56 mudou bastante.
- **Supabase** para auth + DB. **Google Places API (New)** para dados de cafés.
- **Chave da Places API é server-side only**, proxiada pela Edge Function `nearby-cafes`.
  O cliente nunca pode tê-la. Adicionar chamada client-side à Places é um bug.
- **Cache-first para Places.** Qualquer novo uso da Places deve passar pela camada de cache;
  custo é uma restrição de design.
- **RLS em toda tabela pública, com a policy na mesma migration que a tabela.**
  O hook de pre-commit (`scripts/audit-rls.sh`) garante isso — não contornar.
- **Estilização = StyleSheet + tokens de `src/theme`.** Sem Tailwind/NativeWind; sem
  cores/espaçamentos hardcoded — usar os tokens.

## Convenções

- Path alias `@/*` → `src/*`.
- Rotas ficam em `src/app` e permanecem finas; lógica fica em `src/features/*`.
- Rodar `npm run lint` + `npm run typecheck` antes de commitar.
- Commits: Conventional Commits. Migrations: `supabase migration new <name>`, com
  RLS + policy no mesmo arquivo.
- Edge Functions Deno (`supabase/functions`) são excluídas do tsconfig/ESLint do Expo.

## Glossário

- **cafe / place** — um café do Google Places, identificado por `place_id`.
- **cell / cell_key** — bucket geográfico grosseiro (~1,1km) usado para cachear buscas próximas.
- **tabelas de cache** — `cafes` (detalhes do café) e `places_search_cache` (resultados de busca
  por célula); escritas apenas pelo service role da Edge Function.
