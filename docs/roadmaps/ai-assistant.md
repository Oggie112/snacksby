# AI Assistant — Build Plan

Ref: ADR-002. Stack: Vercel AI SDK + Anthropic Claude, BYO key, home-only widget.

## Phase 0 — Setup
- Add deps: `ai`, `@ai-sdk/anthropic`, `zod`.
- New env: `AI_KEY_ENCRYPTION_SECRET` (32-byte, base64). Local + Vercel.
- Append ADR-002.

## Phase 1 — BYO key storage (security-critical, do first)
- Migration: table `household_ai_keys` (household_id PK/FK, ciphertext, iv,
  auth_tag, key_last4, created_by, updated_at).
- RLS: select/insert/update/delete Leader-only; key blob never exposed to client
  (server reads it via service role after membership check).
- `src/lib/ai/crypto.ts`: AES-256-GCM encrypt/decrypt helpers.
- Settings → Household: Leader-only "AI assistant key" section
  (set / replace / remove, shows last4). Validate key with one cheap test call
  on save.

## Phase 2 — Chat route
- `src/app/api/assistant/chat/route.ts` (POST, streaming).
- Steps: auth via Supabase session → user/household/role; fetch+decrypt key
  (404-style message if unset); build user-JWT Supabase client; `streamText`
  with Claude + system prompt (incl. role) + tools + web search.
- `maxSteps` + token guards.

## Phase 3 — Read tools (RLS via user JWT)
- `searchRecipes({query, mealType, ingredient})` → GET_MY_RECIPES / public.
- `getRecipe({id})` → GET_RECIPE.
- `getMealPlan({startDate, endDate})` → existing meal-plan query.

## Phase 4 — Write tools (propose → confirm)
- `proposeAddToPlan`, `proposeRemoveFromPlan`, `proposeCreateRecipe` — return
  structured payloads, do not execute.
- Confirmation cards in the widget; on confirm, fire existing Apollo mutations
  (CREATE_RECIPE, add/remove meal-plan) under user session.

## Phase 5 — Web search + recipe formatting
- Enable Anthropic web search tool.
- `src/lib/ai/recipe-schema.ts`: Zod schema mirroring RecipeDetail
  (ingredients {name, amount, unit}, method {step, instruction}, unit ∈ Unit).
- `generateObject` coerces a found recipe into the schema; on failure, ask
  rather than invent. Output feeds proposeCreateRecipe.

## Phase 6 — Widget
- `src/components/assistant/assistant-widget.tsx` using `useChat`.
- Mount on home page only; render only for Leader/Contributor.
- Render confirm cards for proposals; surface "no key set" + "read-only" states.

## Phase 7 — Hardening
- Error states (bad/expired key, provider error, rate limit).
- Verify role gating end-to-end (Member sees nothing; RLS rejects writes).
- Manual test pass of each tool path.

## Breaking-change flags
- ⚠️ New env var `AI_KEY_ENCRYPTION_SECRET` (deploy config change).
- ⚠️ New DB table + RLS policies (schema change).
- New runtime deps.

## Open / deferred
- Conversation persistence — deferred (ephemeral v1).
- Shopping-list tools — deferred; would re-enable Member access (their writeable surface).
- Per-request usage metering/quotas — consider once usage is observable.
