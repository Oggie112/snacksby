# Status Report: Snacksby

**Report:** 002
**Date:** 2026-06-18 14:30
**Project:** Snacksby — collaborative meal planning PWA

---

## What Happened

The MVP is complete. Since the last report, Milestone 5 (Shopping List & PWA) shipped in full — the app is now installable on a phone's home screen, works offline, and keeps data available without a connection. On top of that, a forgot-password flow was added, and a targeted security review found and fixed three vulnerabilities in the authentication system before any went live in production.

---

## Shipped

**Full shopping list** — items are now saved to the database rather than held in memory. Household members can tick items off, add their own, remove them, and import ingredients directly from the current week's meal plan. Items are automatically sorted into categories (produce, dairy, meat, etc.) to match a typical supermarket layout.

**PWA with offline support** — the app can be installed to a home screen on Android and iOS. A service worker caches pages and data so the app loads and stays usable with no signal. When the connection drops, a banner appears; when it returns, the app silently resyncs. If a page can't be loaded at all, a friendly fallback page is shown rather than a browser error.

**Forgot password and reset flow** — users can now recover their account from the login screen. Clicking "Forgot password" sends a reset link by email; following the link opens a form to set a new password. The confirmation email uses the correct site address rather than a development placeholder.

**Auth security hardening** — three vulnerabilities found in review and fixed before reaching production: (1) the post-login redirect could be hijacked to send users to an external site; (2) the password reset form could be submitted from any logged-in session, not just one that arrived via a reset link; (3) a missing environment variable would silently send reset emails to a local development address rather than failing visibly.

**Accessibility improvements** — keyboard navigation and screen reader support audited and fixed across core UI: ARIA tab patterns, missing labels, and focus management brought into line with web standards.

---

## Currently Working On

Nothing in progress. The MVP is fully shipped and the polish branch has been closed out.

---

## Up Next

The roadmap's post-MVP list is the source of truth, but the most logical next steps are:

**Build and testing pipeline** — there are no automated checks running on commits. Adding GitHub Actions to validate the build on every push would catch regressions early and is a prerequisite for deploying with confidence.

**Offline write handling** — the app reads and displays data offline, but currently cannot save changes (tick an item, add to the list) without a connection. The options are queuing writes to replay on reconnect, or disabling write controls while offline with a clear message; the latter is simpler and avoids sync conflicts.

**Lighthouse & accessibility audit** — the a11y fixes this session were targeted; a full Lighthouse pass would surface anything remaining and give a baseline score to track.

**Style health check** — now that all features are in, a visual pass across every page to catch spacing inconsistencies, misaligned components, and anything that looks unfinished.

---

## Worth Remembering

**AMR claims live in the JWT, not the Session type** — when checking whether a user arrived via a password reset link, the natural instinct is to read `session.amr`. The Supabase TypeScript types don't expose it there. The AMR (Authentication Methods Reference) array is inside the JWT access token itself and must be decoded manually: split on `.`, take the middle segment, base64-decode it, then JSON-parse. The `recovery` method entry is what confirms a reset-link session.

**Open redirect via `new URL(next, origin)`** — `new URL` only uses the second argument as a base when the first is a relative path. An absolute URL (`https://evil.com`) or protocol-relative one (`//evil.com`) passed as the first argument ignores the base entirely. The fix is to validate that `next` starts with `/` and does not start with `//` before constructing the redirect URL.

**Fail loudly on missing env vars** — the reset email redirectTo URL fell back to `http://localhost:3000` if `NEXT_PUBLIC_SITE_URL` was unset. Silent fallbacks in security-sensitive paths are worse than loud failures — a thrown error surfaces immediately in logs; a wrong redirect just quietly misbehaves.

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
| M5: Shopping List & PWA | Done | 11 / 11 | 100% |

---

**Next Report Due:** After the build/testing pipeline is in place, or when offline write handling is resolved — whichever comes first.
