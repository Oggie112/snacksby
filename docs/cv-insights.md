# CV Insights

> Career capital extracted from real project work. Updated periodically at project milestones.

---

## Snacksby — MVP Complete — 2026-06-02

> A collaborative meal-planning PWA for couples and families — full-stack solo build from DB schema to production-ready offline-capable app, spanning 5 milestones over several months.

### Headline Bullet Points
*Ready to paste onto a CV or LinkedIn. Quantify where possible.*

- Architected and delivered a full-stack collaborative web application end-to-end using Next.js 16, React 19, TypeScript, Supabase, and Apollo Client v4
- Designed a relational database schema with Row-Level Security policies enforcing multi-tenant household membership and a three-tier role system (Leader / Contributor / Member)
- Implemented a production-grade PWA with offline-first architecture — Serwist service worker, Apollo cache persistence to IndexedDB, auto-sync on reconnect, and a precached fallback page
- Integrated Supabase's pg_graphql layer as the API surface, writing Apollo queries and mutations across five feature domains (recipes, households, meal planning, shopping list, auth)
- Built a role-based access control system enforced at both the database layer (RLS) and UI layer — role guards conditionally render edit/delete controls based on the authenticated user's household role
- Delivered a complete invite and onboarding flow using the Web Share API, short-lived cookies, and server-side middleware to persist household context through auth redirects
- Completed a systematic accessibility audit — added jsx-a11y ESLint plugin, corrected ARIA tab patterns, labelled all interactive elements, and flagged `aria-hidden` on decorative assets
- Migrated ingredient storage from free-text strings to a structured schema (`{ amount, unit, name }`) enabling unit-aware quantity merging when importing recipes into the shopping list
- Configured Supabase cron jobs to auto-delete meal plan entries older than 60 days, preventing unbounded table growth without application-layer intervention

### Skills & Technologies Demonstrated

**Languages / Frameworks**: TypeScript, React 19, Next.js 16 (App Router), GraphQL  
**Data & API**: Supabase (PostgreSQL, RLS, pg_graphql, Auth, Edge Functions, cron), Apollo Client v4, apollo3-cache-persist, IndexedDB (idb-keyval)  
**PWA / Offline**: Serwist, service workers, cache strategies, Background Sync, offline UI patterns  
**Styling**: TailwindCSS, DaisyUI, responsive design, mobile-first CSS snap scroll  
**Tooling**: ESLint (jsx-a11y, TypeScript rules), Prettier, Conventional Commits, GitHub Actions  
**Concepts & Patterns**: RBAC, multi-tenancy, URL-as-state, optimistic UI, RLS policy design, structured data migration, PWA precaching

### Talking Points for Interviews

- **End-to-end ownership on a real-world data model**: Designed the database schema from scratch — including households, memberships, roles, recipes, meal plan, and shopping list — with correct foreign key relationships and Row-Level Security policies. Had to reason carefully about what belongs in RLS vs. application code vs. database constraints (e.g. uniqueness of meal slots is a `UNIQUE` constraint, not an RLS rule).

- **Offline-first PWA from first principles**: Implemented full offline support without a pre-built abstraction — Serwist service worker with precaching, Apollo cache persisted to IndexedDB (10MB cap), a reconnect listener that refetches live data when the browser comes back online, and a precached `/~offline` fallback page. Had to evaluate the trade-off between an offline mutation queue vs. disabling writes while offline, documenting the reasoning in the roadmap.

- **Collaborative invite flow with session continuity**: Built a smart invite link system where unauthenticated recipients click a share link, get redirected through signup/login, and automatically rejoin the correct household post-auth — using an httpOnly cookie to carry the pending invite through the auth redirect chain. Handled both paths (authenticated one-tap confirm, unauthenticated full onboarding) with a single `/join` page.

- **Accessibility as a quality bar, not an afterthought**: Added `eslint-plugin-jsx-a11y` to the lint pipeline and completed a systematic ARIA audit — correcting tab panel patterns, labelling form controls, and ensuring keyboard navigation works across the nav and modals. Treated a11y violations as lint errors, not warnings.

- **Pragmatic schema migration mid-project**: Replaced free-text ingredient quantities with a structured `{ amount, unit, name }` object mid-build without a formal migration — updated the recipe create/edit forms, the display components, and the shopping list import logic in one cohesive change. The structured schema now enables unit-aware merging (e.g. 500g + 200g = 700g).

### Portfolio / Evidence

- GitHub repo with full commit history and Conventional Commits log
- Live Vercel deployment (planned)
- Documented MVP roadmap with all 5 milestones completed — 43 / 43 tasks done
- Architecture Decision Record (`docs/adr.md`)
- Status report documenting shipped features and engineering decisions (`docs/status-reports/`)
- Working PWA: installable to home screen, functions offline, syncs on reconnect

---
