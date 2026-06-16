# 🥪 Snacksby

**Snacksby** is a collaborative **meal planner and recipe organiser** built as a PWA with **Next.js**.  
Designed for couples and families who want a low-friction way to plan meals, save recipes, manage a shared shopping list, and access everything offline.

**Live:** [snacksby.vercel.app](https://snacksby.vercel.app)

---

## Tech Stack

- **Frontend:** Next.js 16 + React 19 + TypeScript
- **State / Data:** Apollo Client v4, apollo3-cache-persist (IndexedDB)
- **Backend / Auth / DB:** Supabase (PostgreSQL, RLS, pg_graphql, Auth)
- **API Layer:** GraphQL via Supabase pg_graphql
- **PWA / Offline:** Serwist (service worker, precaching, offline fallback)
- **Styling:** TailwindCSS + DaisyUI (custom pastel theme)
- **Linting / Formatting:** ESLint (jsx-a11y, TypeScript rules), Prettier
- **Deployment:** Vercel

---

## Features

- **Auth** — email/password signup and login, session-aware middleware protecting all routes
- **Recipes** — full CRUD; tag filtering with URL persistence; structured ingredient schema with unit tracking
- **Households** — create or join a household via invite link; role system (Leader / Contributor / Member) enforced at DB and UI levels
- **Meal planning** — weekly calendar with Breakfast / Lunch / Dinner / Snack slots; household-shared view; week navigation
- **Shopping list** — DB-persisted list with tick/untick, custom items, and one-tap import from the current week's meal plan; auto-categorised by food group
- **Home dashboard** — today/tomorrow meal slots, shopping list summary, time-based greeting
- **PWA** — installable to home screen; recipes and shopping list available offline; auto-syncs on reconnect

---

## Development

### Prerequisites

- Node.js v18+
- npm v9+

### Setup

```bash
npm install
npm run dev        # start dev server (http://localhost:3000)
npm run lint       # lint
npm run lint-fix   # lint + auto-fix
npm run format     # Prettier
npm run typecheck  # tsc --noEmit
```

---

## Testing

No automated tests currently. Critical paths are verified manually. Jest/Vitest + Cypress is on the post-MVP roadmap.

---

## Documentation

- [MVP Roadmap](roadmaps/mvp.md)
- [Architecture Decision Record](adr.md)
- [Standards & Practices](standards-spec.md)
- [UX / UI Guidelines](ux-spec.md)
- [Database Schema](database.md)
- [CV Insights](cv-insights.md)
