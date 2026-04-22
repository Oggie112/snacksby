---
description: MVP roadmap for Snacksby — collaborative meal planning PWA
---

# Snacksby: MVP Roadmap

|           | Status                                    | Next Up                        | Blocked           |
| --------- | ----------------------------------------- | ------------------------------ | ----------------- |
| **INF**   | Done                                      | —                              | —                 |
| **NAV**   | Done                                      | —                              | —                 |
| **SET**   | Stub only                                 | Account + household sections   | `3HH.1`           |
| **DB**    | Done — tables, RLS, GraphQL verified      | —                              | —                 |
| **REC**   | Wireframe only (mock data, at `/recipes`) | GraphQL queries                | —                 |
| **HH/RL** | Partial — role enum done                  | Household creation flow        | —                 |
| **PL**    | Stub only                                 | Weekly calendar view           | `2REC.*`, `3HH.*` |
| **SH**    | Wireframe only (local state)              | DB persistence                 | `4PL.2`           |
| **PWA**   | Not started                               | PWA manifest                   | `5SH.2`, `2REC.2` |

---

## Contents

- [Milestones](#milestones)
  - [Milestone 1: Foundation](#m1)
  - [Milestone 2: Recipes](#m2)
  - [Milestone 3: Households & Roles](#m3)
  - [Milestone 4: Meal Planning](#m4)
  - [Milestone 5: Shopping List & PWA](#m5)
- [Progress Map](#map)
- [Beyond MVP](#post-mvp)

---

## Milestones

<a name="m1"><h3>Milestone 1: Foundation</h3></a>

> [!IMPORTANT]
> **Goal:** Establish the technical base — Apollo wired and working, app navigation in place, Supabase DB schema designed and live, app identity updated.

<a name="m1-doing"><h4>In Progress (Milestone 1)</h4></a>

_(none)_

<a name="m1-todo"><h4>To Do (Milestone 1)</h4></a>

- [ ] 1SET.1. Settings page — account section (email, password) — **depends on 1NAV.3**
- [ ] 1SET.2. Settings page — household section (members, invite code, role-gated) — **depends on 3HH.1**

<a name="m1-blocked"><h4>Blocked (Milestone 1)</h4></a>

_(none)_

<a name="m1-done"><h4>Completed (Milestone 1)</h4></a>

- [x] 1INF.1. Scaffold Next.js app router with TypeScript (upgraded to Next.js 16 + React 19)
- [x] 1INF.2. Configure TailwindCSS + DaisyUI with custom pastel theme
- [x] 1INF.3. Supabase auth — login, signup, logout pages with server actions
- [x] 1INF.4. Auth middleware — protect routes, redirect unauthenticated users
- [x] 1INF.5. SessionProvider + server-side session fetch in root layout
- [x] 1INF.6. Configure Apollo Client with Supabase GraphQL auth link
- [x] 1INF.7. Wire `ApolloProvider` into root layout (fixed v4 import path; removed redundant `apikey` from authLink)
- [x] 1INF.8. Update app metadata — title template, description, emoji favicon placeholder
- [x] 1NAV.1. Build navigation component — bottom bar (mobile) / top bar (desktop)
- [x] 1NAV.2. Add nav routes: Home (dashboard), Recipes, Plan, Shopping List
- [x] 1NAV.3. Avatar/profile nav item — shows user initial, links to `/settings`
- [x] 1DB.1. Design DB schema (households, memberships, recipes, meal_plan, shopping_list_items)
- [x] 1DB.2. Create Supabase tables — role_type enum (Leader/Contributor/Member), all FK relationships
- [x] 1DB.3. RLS policies — per-table read/write rules enforcing household membership and role; one household per user enforced at insert
- [x] 1DB.4. GraphQL schema verified via introspection — all collections and relations confirmed

---

<a name="m2"><h3>Milestone 2: Recipes</h3></a>

> [!IMPORTANT]
> **Goal:** Full recipe CRUD — users can create, view, edit, and delete recipes stored in Supabase, connected via GraphQL.

<a name="m2-doing"><h4>In Progress (Milestone 2)</h4></a>

_(none)_

<a name="m2-todo"><h4>To Do (Milestone 2)</h4></a>

- [ ] 2REC.1. Write GraphQL query — fetch recipes list
- [ ] 2REC.2. Connect recipe browse page to live data (replace mock data) — **depends on 2REC.1**
- [ ] 2REC.3. Recipe detail page (title, servings, structured ingredients, method) — **depends on 2REC.2**
- [ ] 2REC.4. Add recipe form + GraphQL create mutation — **depends on 2REC.1**
- [ ] 2REC.5. Edit recipe form + GraphQL update mutation — **depends on 2REC.4**
- [ ] 2REC.6. Delete recipe with GraphQL mutation — **depends on 2REC.5**

<a name="m2-blocked"><h4>Blocked (Milestone 2)</h4></a>

_(none — fully unblocked)_

<a name="m2-done"><h4>Completed (Milestone 2)</h4></a>

_(none)_

---

<a name="m3"><h3>Milestone 3: Households & Roles</h3></a>

> [!IMPORTANT]
> **Goal:** Users can create or join a household, invite others via a code, and have role-based permissions (Leader / Contributor / Member) enforced throughout the app.

<a name="m3-doing"><h4>In Progress (Milestone 3)</h4></a>

_(none)_

<a name="m3-todo"><h4>To Do (Milestone 3)</h4></a>

- [ ] 3HH.1. Create household flow (name, create, redirect to plan)
- [ ] 3HH.2. Generate and store unique invite code on household creation — **depends on 3HH.1** _(column exists; generation logic needed)_
- [ ] 3HH.3. Join household via invite code — **depends on 3HH.2**
- [ ] 3HH.4. Household settings page (name, member list, leave/remove member) — **depends on 3HH.1**
- [ ] 3RL.2. Role-based UI guards (hide edit/delete for Member role) — **depends on 3HH.1**
- [ ] 3RL.3. Assign role when inviting or accepting a member — **depends on 3HH.3**

<a name="m3-blocked"><h4>Blocked (Milestone 3)</h4></a>

_(none — fully unblocked)_

<a name="m3-done"><h4>Completed (Milestone 3)</h4></a>

- [x] 3RL.1. Role enum in DB (Leader / Contributor / Member) — created as `role_type` in Supabase

---

<a name="m4"><h3>Milestone 4: Meal Planning</h3></a>

> [!IMPORTANT]
> **Goal:** Users can assign recipes to days in a weekly calendar view and share the plan across their household.

<a name="m4-doing"><h4>In Progress (Milestone 4)</h4></a>

_(none)_

<a name="m4-todo"><h4>To Do (Milestone 4)</h4></a>

- [ ] 4PL.1. Weekly calendar component (7-day grid, current week default)
- [ ] 4PL.2. GraphQL query — fetch meal plan for a given week — **depends on 3HH.1**
- [ ] 4PL.3. Assign recipe to a day slot (mutation + UI) — **depends on 4PL.1, 4PL.2, 2REC.2**
- [ ] 4PL.4. Remove meal from a day slot — **depends on 4PL.3**
- [ ] 4PL.5. Navigate between weeks (previous / next) — **depends on 4PL.1**
- [ ] 4PL.6. Scope plan to household (shared view for all members) — **depends on 3HH.1, 4PL.2**

<a name="m4-blocked"><h4>Blocked (Milestone 4)</h4></a>

- `4PL.2` and beyond blocked on `3HH.1` (household creation) and `2REC.2` (live recipe data)
- `4PL.1` and `4PL.5` are unblocked (UI only)

<a name="m4-done"><h4>Completed (Milestone 4)</h4></a>

_(none)_

---

<a name="m5"><h3>Milestone 5: Shopping List & PWA</h3></a>

> [!IMPORTANT]
> **Goal:** Shopping list persisted to DB, ingredients auto-merged from the current meal plan, and the app installable as an offline-capable PWA.

<a name="m5-doing"><h4>In Progress (Milestone 5)</h4></a>

_(none)_

<a name="m5-todo"><h4>To Do (Milestone 5)</h4></a>

- [ ] 5SH.1. GraphQL queries + mutations for shopping list items
- [ ] 5SH.2. Connect shopping list page to DB (replace local state) — **depends on 5SH.1**
- [ ] 5SH.3. Merge ingredients from current week's meal plan into list — **depends on 5SH.1, 4PL.2**
- [ ] 5SH.4. Categorise items (produce, dairy, meat, etc.) — **depends on 5SH.2**
- [ ] 5SH.5. Tick/untick items (done state persisted) — **depends on 5SH.2**
- [ ] 5SH.6. Add custom items to list — **depends on 5SH.2**
- [ ] 5SH.7. Remove items from list — **depends on 5SH.2**
- [ ] 5PWA.1. Add PWA manifest (name, icons, theme colour, display mode)
- [ ] 5PWA.2. Service worker — cache recipes and shopping list for offline use — **depends on 5SH.2, 2REC.2**
- [ ] 5PWA.3. Offline state indicator in UI — **depends on 5PWA.2**
- [ ] 5PWA.4. Auto-sync queued changes on reconnect — **depends on 5PWA.2**

<a name="m5-blocked"><h4>Blocked (Milestone 5)</h4></a>

- `5SH.1` is unblocked (DB is ready)
- `5SH.3` and `5PWA.2` blocked on M4 and M2 completion respectively

<a name="m5-done"><h4>Completed (Milestone 5)</h4></a>

_(none)_

---

<a name="map"><h2>Progress Map</h2></a>

```mermaid
---
title: Snacksby MVP — Full Dependency Graph
---
graph TD

%% ─── Milestone nodes ────────────────────────────────────────────────────────
M1["`**Milestone 1**<br/>Foundation`"]:::mile
M2["`**Milestone 2**<br/>Recipes`"]:::mile
M3["`**Milestone 3**<br/>Households & Roles`"]:::mile
M4["`**Milestone 4**<br/>Meal Planning`"]:::mile
M5["`**Milestone 5**<br/>Shopping List & PWA`"]:::mile

%% ─── Milestone 1: Foundation (all done) ─────────────────────────────────────
"1INF.1"["`*1INF.1*<br/>**INF**<br/>Next.js scaffold`"]:::done
"1INF.2"["`*1INF.2*<br/>**INF**<br/>TailwindCSS + DaisyUI`"]:::done
"1INF.3"["`*1INF.3*<br/>**INF**<br/>Supabase auth`"]:::done
"1INF.4"["`*1INF.4*<br/>**INF**<br/>Auth middleware`"]:::done
"1INF.5"["`*1INF.5*<br/>**INF**<br/>SessionProvider`"]:::done
"1INF.6"["`*1INF.6*<br/>**INF**<br/>Apollo Client config`"]:::done
"1INF.7"["`*1INF.7*<br/>**INF**<br/>Wire ApolloProvider`"]:::done
"1INF.8"["`*1INF.8*<br/>**INF**<br/>App metadata`"]:::done
"1NAV.1"["`*1NAV.1*<br/>**NAV**<br/>Nav component`"]:::done
"1NAV.2"["`*1NAV.2*<br/>**NAV**<br/>Nav routes`"]:::done
"1NAV.3"["`*1NAV.3*<br/>**NAV**<br/>Avatar / profile`"]:::done
"1DB.1"["`*1DB.1*<br/>**DB**<br/>Design schema`"]:::done
"1DB.2"["`*1DB.2*<br/>**DB**<br/>Create tables`"]:::done
"1DB.3"["`*1DB.3*<br/>**DB**<br/>RLS policies`"]:::done
"1DB.4"["`*1DB.4*<br/>**DB**<br/>Verify GraphQL`"]:::done

%% ─── Milestone 2: Recipes ────────────────────────────────────────────────────
"2REC.1"["`*2REC.1*<br/>**REC**<br/>Query recipes`"]:::open
"2REC.2"["`*2REC.2*<br/>**REC**<br/>Connect browse page`"]:::blocked
"2REC.3"["`*2REC.3*<br/>**REC**<br/>Detail page`"]:::blocked
"2REC.4"["`*2REC.4*<br/>**REC**<br/>Add recipe`"]:::blocked
"2REC.5"["`*2REC.5*<br/>**REC**<br/>Edit recipe`"]:::blocked
"2REC.6"["`*2REC.6*<br/>**REC**<br/>Delete recipe`"]:::blocked

"2REC.1" --> "2REC.2"
"2REC.1" --> "2REC.4"
"2REC.2" --> "2REC.3"
"2REC.4" --> "2REC.5"
"2REC.5" --> "2REC.6"

%% ─── Milestone 3: Households & Roles ────────────────────────────────────────
"3RL.1"["`*3RL.1*<br/>**RL**<br/>Role enum in DB`"]:::done
"3HH.1"["`*3HH.1*<br/>**HH**<br/>Create household`"]:::open
"3HH.2"["`*3HH.2*<br/>**HH**<br/>Invite code`"]:::blocked
"3HH.3"["`*3HH.3*<br/>**HH**<br/>Join via code`"]:::blocked
"3HH.4"["`*3HH.4*<br/>**HH**<br/>Household settings`"]:::blocked
"3RL.2"["`*3RL.2*<br/>**RL**<br/>UI role guards`"]:::blocked
"3RL.3"["`*3RL.3*<br/>**RL**<br/>Assign role on invite`"]:::blocked

"3HH.1" --> "3HH.2"
"3HH.1" --> "3HH.4"
"3HH.1" --> "3RL.2"
"3HH.2" --> "3HH.3"
"3HH.3" --> "3RL.3"

%% ─── Milestone 4: Meal Planning ─────────────────────────────────────────────
"4PL.1"["`*4PL.1*<br/>**PL**<br/>Week calendar UI`"]:::open
"4PL.2"["`*4PL.2*<br/>**PL**<br/>Query week plan`"]:::blocked
"4PL.3"["`*4PL.3*<br/>**PL**<br/>Assign recipe to day`"]:::blocked
"4PL.4"["`*4PL.4*<br/>**PL**<br/>Remove meal`"]:::blocked
"4PL.5"["`*4PL.5*<br/>**PL**<br/>Week navigation`"]:::blocked
"4PL.6"["`*4PL.6*<br/>**PL**<br/>Household plan scope`"]:::blocked

"3HH.1" --> "4PL.2"
"4PL.1" --> "4PL.3"
"4PL.1" --> "4PL.5"
"4PL.2" --> "4PL.3"
"4PL.2" --> "4PL.6"
"2REC.2" --> "4PL.3"
"4PL.3" --> "4PL.4"
"3HH.1" --> "4PL.6"

%% ─── Milestone 5: Shopping List & PWA ───────────────────────────────────────
"5SH.1"["`*5SH.1*<br/>**SH**<br/>List queries & mutations`"]:::open
"5SH.2"["`*5SH.2*<br/>**SH**<br/>Connect list to DB`"]:::blocked
"5SH.3"["`*5SH.3*<br/>**SH**<br/>Merge from meal plan`"]:::blocked
"5SH.4"["`*5SH.4*<br/>**SH**<br/>Categorise items`"]:::blocked
"5SH.5"["`*5SH.5*<br/>**SH**<br/>Tick/untick items`"]:::blocked
"5SH.6"["`*5SH.6*<br/>**SH**<br/>Add custom items`"]:::blocked
"5SH.7"["`*5SH.7*<br/>**SH**<br/>Remove items`"]:::blocked
"5PWA.1"["`*5PWA.1*<br/>**PWA**<br/>PWA manifest`"]:::open
"5PWA.2"["`*5PWA.2*<br/>**PWA**<br/>Service worker`"]:::blocked
"5PWA.3"["`*5PWA.3*<br/>**PWA**<br/>Offline indicator`"]:::blocked
"5PWA.4"["`*5PWA.4*<br/>**PWA**<br/>Auto-sync`"]:::blocked

"5SH.1" --> "5SH.2"
"5SH.1" --> "5SH.3"
"4PL.2" --> "5SH.3"
"5SH.2" --> "5SH.4"
"5SH.2" --> "5SH.5"
"5SH.2" --> "5SH.6"
"5SH.2" --> "5SH.7"
"5SH.2" --> "5PWA.2"
"2REC.2" --> "5PWA.2"
"5PWA.2" --> "5PWA.3"
"5PWA.2" --> "5PWA.4"

classDef default,blocked fill:#f9c6e0,stroke:#c084a0,color:#3b1f2b
classDef open fill:#fef08a,stroke:#ca8a04,color:#3b2400
classDef mile fill:#a5f3fc,stroke:#0891b2,color:#0c2d34
classDef done fill:#bbf7d0,stroke:#16a34a,color:#14532d
```

---

<a name="post-mvp"><h2>Beyond MVP</h2></a>

Features deliberately deferred from the MVP:

- **AI recipe suggestions** — "give me X recipes" generation via OpenAI + LangChain/LangGraph (first post-MVP priority)
- **Portion scaling** — adjust servings and auto-scale ingredient quantities
- **Barcode scanning** — add items to shopping list via camera
- **Voice assistant integration** — hands-free list management
- **External calendar sync** — push meal plan to Google Calendar / iCal
- **Recipe discovery** — browse or import public recipes

---

_Last updated: 2026-04-22_
