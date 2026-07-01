# Work Record: AI Assistant Feature — Complete Build

**Date:** 2026-07-01
**Time:** 11:58 UTC
**Focus:** AI chat assistant — full build from key storage through Phase 7 hardening and refactoring
**Outcome:** Phases 0–7 complete; widget refactored; 10 high-severity CVEs patched; manual test pass in progress

---

## Summary

Built the full AI assistant feature across two sessions on the `ai-tools` branch — BYO key storage with AES-256-GCM encryption, a streaming Anthropic chat route with role-gated auth, six assistant tools (three read, three write-propose), and a floating chat widget with a propose-then-confirm pattern. Phase 7 hardening fixed a schema mismatch bug between the AI SDK's `UIMessage[]` and `ModelMessage[]` formats, added key status gating, provider error handling, and markdown rendering for recipe output. The widget was then refactored into three focused files. Next.js bumped from 16.2.1 → 16.2.9 clearing 10 high-severity CVEs.

---

## Work Completed

### AI-01 — Phase 0+1: BYO Key Storage Foundation ✅

**Status:** Completed (committed `8e74079`)
**Context:** Security-critical first step — no key ever touches the client; all reads go via service-role after membership verification.

**What was done:**

- Migration: `household_ai_keys` table (`ciphertext`, `iv`, `auth_tag`, `key_last4`) with Leader-only RLS policies
- `src/lib/ai/crypto.ts`: AES-256-GCM encrypt/decrypt using `AI_KEY_ENCRYPTION_SECRET` env var
- Server actions in `settings/household/actions.ts`: `saveAiKey` (validates against Anthropic before storing), `removeAiKey`, `getAiKeyStatus`
- Leader-only UI section in household settings showing key status (last 4 chars) with set/replace/remove flows

**Key learnings:**
- Two-client Supabase pattern: user-JWT client for all data tools, admin/service-role client *only* for key retrieval after membership check
- Key blob (ciphertext, iv, auth_tag) never serialised to client — status check only returns `{ set: boolean, last4: string | null }`

---

### AI-02 — Phase 2: Streaming Chat Route ✅

**Status:** Completed (committed `576e997`)
**Context:** The secure pipeline from request to stream — auth → role → key → LLM.

**What was done:**

`POST /api/assistant/chat` pipeline:
1. Auth via Supabase session cookie
2. Household membership check — 403 if no household
3. Role check — Members receive 403 with clear message
4. Admin client fetches + decrypts API key — 404 if unset
5. `streamText` with `claude-sonnet-4-6`, `webSearch_20260209` (max 3 uses), `stopWhen: stepCountIs(5)`, `maxOutputTokens: 2048`
6. Returns `toUIMessageStreamResponse()`

---

### AI-03 — Phases 3–5: Tools + Recipe Schema ✅

**Status:** Completed (committed `0f4a961`)
**Context:** Six tools via `createAssistantTools` factory — all read tools use the user-JWT Supabase client for RLS enforcement.

**What was done:**

Read tools (all roles): `searchRecipes`, `getRecipe`, `getMealPlan`

Write-propose tools (Leader/Contributor only): `proposeAddToPlan`, `proposeRemoveFromPlan`, `proposeCreateRecipe` — each returns a structured `AssistantProposal` discriminated union payload. Nothing writes to the DB.

`src/lib/ai/recipe-schema.ts`: Zod schema mirroring the DB recipe shape — typed ingredients (`{name, amount, unit}` with `Unit` enum), method steps (`{step, instruction}`), safe defaults for visibility and tags.

---

### AI-04 — Phase 6: Widget with Propose-Then-Confirm ✅

**Status:** Completed (committed `bbf2ef2`)
**Context:** Full chat UI — floating button, panel, message rendering, and confirmation cards that fire Apollo mutations under the user's session.

**What was done:**

- `AssistantWidget` using `useChat` from `@ai-sdk/react` with `DefaultChatTransport`
- Renders only for Leader/Contributor (checked via `useHouseholdRole`)
- `ProposalCard` renders for `isToolUIPart` parts with `tool-propose*` type and `output-available` state
- On confirm: fires `assignMeal`, `removeMeal`, or `createRecipe` Apollo mutations
- Dismiss tracks `dismissedIds` in local state — card disappears, no mutation
- Done state tracks `doneIds` — card flips to "Done ✓" alert

---

### AI-05 — Phase 7 Hardening ✅

**Status:** Completed (uncommitted)
**Context:** Fixing a runtime schema mismatch and making the widget robust against all error states.

**What was done:**

**Bug fix — `AI_InvalidPromptError: messages do not match ModelMessage[] schema`**

The route was passing raw `UIMessage[]` (with `parts`, `id` fields) from `body.messages` directly to `streamText`. The AI SDK's `streamText` expects `ModelMessage[]` (`content`, `role` format). Fix: `await convertToModelMessages(body.messages)`.

Secondary bug: `convertToModelMessages` is async — was not being awaited, so `messages` was a `Promise` object that serialised to `{}`. Fix: add `await`.

```ts
// Before
messages = body.messages

// After
messages = await convertToModelMessages(body.messages)
```

**Key status check on panel open**

Added `keyStatus` state (`'idle' | 'checking' | 'set' | 'unset'`) with an effect that calls `getAiKeyStatus` on first panel open. Panel body conditionally renders: spinner → "No API key" prompt with Settings link → chat. Guards on `keyStatus !== 'idle'` to cache the check for the session.

**Provider error handling in route**

Wrapped `streamText` in try/catch — maps auth/key errors → 422, rate limits → 429, anything else → 502.

**Client-side `getFriendlyError`**

Maps `error.message` strings from `useChat` to readable copy: invalid/expired key, rate limit, member access, generic fallback.

**Markdown rendering**

Installed `react-markdown`. Assistant messages render through `<ReactMarkdown components={markdownComponents}>` with Tailwind-styled `p`, `ul`, `ol`, `li`, `strong`, `h2`, `h3` renderers. User messages remain plain `<span>`. System prompt updated to instruct the model to format recipes with bold name, bullet ingredients, numbered method — never pipes or raw field names.

**Logo on floating button**

Replaced sparkle SVG with app logo image when panel is closed; X icon when open.

---

### AI-06 — Widget Refactoring ✅

**Status:** Completed (uncommitted)
**Context:** 400-line file was mixing state management, mutations, handlers, and rendering. Split into three focused files.

**What was done:**

| File | Lines | Responsibility |
|---|---|---|
| `proposal-card.tsx` | 50 | Confirmation card UI only |
| `use-assistant.ts` | 100 | All state, mutations, effects, handlers |
| `assistant-widget.tsx` | ~190 | `markdownComponents`, `getFriendlyError`, pure rendering |

`useAssistant` hook owns: 6 state values, `useChat`, 3 Apollo mutations, scroll effect, key status effect, `handleSend`, `handleConfirm`, `handleDismiss`. The widget destructures and renders.

---

### AI-07 — Next.js Security Update ✅

**Status:** Completed (uncommitted)
**Context:** `npm audit` flagged 10 high-severity vulns in `next@16.2.1` — Server Components DoS, Middleware/Proxy bypasses, cache poisoning, XSS.

Bumped `next` and `eslint-config-next` from `16.2.1` → `16.2.9`. 10 high-severity CVEs cleared. One moderate remains (PostCSS XSS in `next/node_modules/postcss`) — "fix" would downgrade to Next.js 9, not viable; not exploitable in build-time CSS processing context.

---

## Roadmap & Progress Updates

### Phases Completed
- **Phase 0+1:** BYO key storage foundation
- **Phase 2:** Streaming chat route
- **Phase 3–5:** Tools + recipe schema
- **Phase 6:** Chat widget
- **Phase 7:** Hardening (minus manual test pass)

### Deferred (unchanged)
- Conversation persistence — ephemeral for v1
- Shopping-list tools — would re-enable Member access
- Per-request usage metering

---

## Remaining AI Assistant Work

| Task | Status | Blocker |
|---|---|---|
| Manual test pass — all tool paths | In progress | None |
| Commit Phase 7 + refactor + security bump | Pending | Test pass completion |
| PR for `ai-tools` → `main` | Pending | Commit |

---

## Next Steps (Recommended)

1. **Manual test pass** — exercise all tool paths (searchRecipes, getRecipe, getMealPlan, proposeAddToPlan, proposeRemoveFromPlan, proposeCreateRecipe) plus error states (no key, Member role, rate limit)
2. **Commit hardening changes** — one commit for Phase 7 + refactor, one for security bump
3. **Open PR** — `ai-tools` → `main`

---

## Session Duration

Approximately 120 minutes across two sessions (Phase 7 hardening, Gemini investigation, UIMessage→ModelMessage bug fix, markdown rendering, widget refactoring, security audit).
