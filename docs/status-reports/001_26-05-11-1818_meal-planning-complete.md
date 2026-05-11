# Status Report: Snacksby

**Report:** 001
**Date:** 2026-05-11 18:18
**Project:** Snacksby — collaborative meal planning PWA

---

## What Happened

Four of five MVP milestones are now complete. This session finished Milestone 4 (Meal Planning) — the weekly calendar that lets a household assign dinners to each day of the week. With the core data layer (auth, recipes, households) already solid, the meal plan feature landed cleanly and rounds out everything needed before the shopping list work begins.

---

## Shipped

**Weekly meal planning calendar** — a 7-day grid showing Mon–Sun. Household members can browse recipes and assign one dinner per day. The selected week is stored in the URL (`?week=2026-05-11`) so the back button works and the link can be shared.

**Recipe picker** — a search modal inside the calendar that shows a member's own recipes and publicly visible ones via tabs. Clicking a recipe assigns it to the day; clicking the pencil icon swaps it out.

**Role-gated editing throughout** — Leaders and Contributors can assign, change, and remove meals. Members (read-only) see the plan but get no edit controls. This rule now applies consistently across recipes, household settings, and the calendar.

**Responsive calendar layout** — on mobile the calendar stacks vertically (one day per row) for easy scrolling; on larger screens it shows all 7 days side by side. Edit buttons on desktop appear only on hover to avoid clutter.

**Container width fix** — the global page container was too narrow for a 7-column calendar. The main layout was widened; all other pages (recipes, settings, shopping list) had their own narrower content width restored so they didn't spread awkwardly.

---

## Currently Working On

Nothing in progress. M4 is complete and committed. M5 has two unblocked starting points ready to pick up.

---

## Up Next

**Shopping list GraphQL layer** (5SH.1) — write the database queries and mutations for shopping list items. This is the first task in M5 and unblocks everything else in the milestone.

**PWA manifest** (5PWA.1) — add the web app manifest so the app can be installed to a home screen. No dependencies; can run in parallel with the shopping list work.

**Connect shopping list to DB** (5SH.2) — replace the current local-state prototype with real persistence. Depends on 5SH.1.

---

## Worth Remembering

**URL as state for week navigation** — the active week lives in the URL as a query parameter, not in React state. This means the back button works, the link is shareable, and there's no state drift between navigation. It required splitting the page into two components (`PlanPage` shell + `PlanContent`) because Next.js's `useSearchParams` hook needs a `<Suspense>` boundary around it.

**Assign vs. reassign** — when saving a meal slot we always know whether it's empty or occupied (from the query result), so two separate mutations (INSERT vs. UPDATE by ID) are cleaner than a single upsert. This avoids silent data surprises if the unique constraint fires unexpectedly.

**Unique constraint is a database constraint, not a permissions rule** — a question arose during planning about whether "one meal per slot" should be enforced as a Row-Level Security policy. It shouldn't: RLS controls *who* can write, not *what values* are valid. The uniqueness guarantee belongs on the table (`UNIQUE(household_id, date, meal_type)`).

**Container width trade-off** — `max-w-2xl` (the previous global content width) is too narrow for a 7-column grid. Rather than making the calendar scroll horizontally, the global layout was widened to `max-w-7xl` and the `max-w-2xl` constraint was pushed down into each individual non-calendar page. More repetition in exchange for a better calendar experience.

---

## Blockers / Risks

None currently.

---

## Metrics

| Milestone | Status | Tasks | Progress |
| --- | --- | --- | --- |
| M1: Foundation | Done | 17 / 17 | 100% |
| M2: Recipes | Done | 6 / 6 | 100% |
| M3: Households & Roles | Done | 8 / 8 | 100% |
| M4: Meal Planning | Done | 6 / 6 | 100% |
| M5: Shopping List & PWA | Not started | 0 / 11 | 0% |

---

**Next Report Due:** After M5 shopping list DB connection (5SH.2) is live, or when PWA manifest is added — whichever comes first.
