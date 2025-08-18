# Snacksby Functional Specification

## **1. Introduction**

### **1.1 Document Purpose**

This document defines the functional requirements, technical scope, and design constraints for **Snacksby**, a collaborative meal planning and shopping application. The goal is to clarify the MVP feature set, prioritise future enhancements, and provide a clear development reference.

### **1.2 Product Scope**

Snacksby is a mobile-first, offline-capable PWA that allows households to:

- Store favourite recipes.
- Quickly generate meal plans.
- Merge ingredients into a unified, categorised shopping list.
- Share plans, lists, and recipes across multiple members.

The MVP focuses on **meal planning and shopping list management** with basic collaboration. Post-MVP will explore AI-assisted recipe suggestions, voice assistant integration, and broader recipe discovery.

### **1.3 Definitions, Acronyms, and Abbreviations**

- **PWA**: Progressive Web App.
- **MVP**: Minimum Viable Product.
- **Household**: A group of users sharing recipes, plans, and shopping lists.
- **Leader**: Primary admin for a household.
- **Contributor**: Can add and plan recipes but not manage members.
- **Member**: Can view recipes, plans, and lists, but cannot edit.
- **GraphQL**: API query language and runtime for handling data between client and server.
- **Supabase**: Backend-as-a-service providing authentication and database hosting.
- **LangChain/LangGraph**: AI orchestration frameworks.

### **1.4 References**

- [Supabase Documentation](https://supabase.com/docs)
- [GraphQL Specification](https://spec.graphql.org/)
- [PWA Guidelines – Google](https://web.dev/progressive-web-apps/)
- [Tailwind CSS](https://tailwindcss.com/)

### **1.5 Document Overview**

This specification is structured into:

1. Product overview and scope.
2. Detailed functional requirements.
3. Quality, compliance, and design considerations.
4. Testing and verification plan.

---

## **2. Product Overview**

### **2.1 Product Perspective**

- **New product**, inspired by Sorted Food’s “Sidekick” app and personal need for collaborative meal planning.
- Operates in household collaboration space.
- Works offline once plans are generated, syncing when online.

### **2.2 Product Functions**

- Store and manage recipes (title, ingredients, method, servings).
- Generate meal plans with selected recipes.
- Merge ingredient lists into a unified shopping list.
- Categorise shopping items.
- Share updates across household members.
- Offline access to cached recipes and shopping lists.

### **2.3 Product Constraints**

- Budget: £0/month, must use free tiers.
- Hosting: Vercel, Render, or AWS free tier.
- GraphQL API required.
- Offline-first for lists and recipes; online required for plan generation/editing.
- No ratings or social feed for MVP.

### **2.4 User Characteristics**

- **Target Users**: Couples, families, occasionally roommates.
- **Skill Level**: Basic smartphone and browser skills.
- **Usage Frequency**: 1–3 times weekly.
- **Devices**: Android, desktop browsers (PWA capable).

### **2.5 Assumptions and Dependencies**

- Internet available for plan creation and recipe syncing.
- PWA features supported by device/browser.
- Supabase for auth and possibly DB.
- GraphQL backend.
- Future AI requires internet connection.
- Accounts inactive for 12 months flagged for deletion.

### **2.6 Apportioning of Requirements**

- **Must-have**: Recipe storage, plan creation, shared shopping list, offline recipe/list access, household roles.
- **Should-have**: Categorised shopping list, custom item addition.
- **Could-have**: AI recipe search, voice assistant commands.
- **Won’t-have (MVP)**: Social media sharing, barcode scanning, portion scaling.

---

## **3. Requirements**

### **3.1 External Interfaces**

#### **3.1.1 User Interfaces**

- Mobile PWA & desktop web.
- Touch, mouse, and keyboard interaction.
- Navigation: bottom nav (mobile), top nav (desktop).
- Simplified shopping list as primary display style.

#### **3.1.2 Hardware Interfaces**

- None for MVP.
- Potential: barcode scanner (post-MVP).

#### **3.1.3 Software Interfaces**

- **Auth**: Supabase (email/password).
- **Database**: Supabase Postgres
- **API**: GraphQL for queries/mutations/subscriptions.
- **AI**: OpenAI API + LangChain/LangGraph (post-MVP).
- **Hosting**: Render, Vercel, or AWS.
- **Data Exchange**: JSON via GraphQL.

---

### **3.2 Functional Requirements**

**Feature Set**:

1. **User Management**: Signup, login, household creation, member invite via link/code.
2. **Roles**:
   - Leader: full permissions.
   - Contributor: add/edit recipes, set plans.
   - Member: view-only.
3. **Recipe Management**:
   - Add, edit, delete.
   - Metadata: title, servings, ingredients, method.
4. **Meal Planning**:
   - Generate plan manually or via “X recipes” suggestion.
   - Assign meals to days in calendar view.
5. **Shopping List**:
   - Merge recipe ingredients into one list.
   - Categorise items.
   - Tick off items offline.
   - Add custom items.
6. **Offline Mode**:
   - Cached recipes and shopping list.
   - Auto-sync on reconnect.

---

### **3.3 Quality of Service**

#### **3.3.1 Performance**

- Under 200ms GraphQL query response time for cached data.
- Handle up to 50 households with 10 members each on free-tier backend.

#### **3.3.2 Security**

- JWT-based auth via Supabase.
- All requests over HTTPS.
- No storage of plaintext passwords.

#### **3.3.3 Reliability**

- Minimal downtime acceptable on free tiers.
- Graceful handling of offline states.

#### **3.3.4 Availability**

- 24/7 access subject to free-tier host uptime.
- Offline use for core functions.

---

### **3.4 Compliance**

- GDPR/CCPA principles by default.
- User data limited to essential PII.
- 12-month inactivity policy + 30-day warning before deletion.

---

### **3.5 Design & Implementation**

- **Tech Stack**: TypeScript, React, TailwindCSS (DaisyUI), GraphQL, Supabase, PWA.
- **Architecture**: Modular, component-driven, offline-first caching with service worker.
- **Distribution**: Web URL, installable as PWA.
- **Maintainability**: Version control (GitHub), modular GraphQL queries/mutations.
- **Reusability**: Shared UI and GraphQL modules.
- **Cost**: Free tier only.
- **Timeline**: 2–3 months part-time.

---

## **4. Verification**

- **Unit Tests**: Core logic for list merging, plan generation.
- **Manual Testing**: Mobile & desktop browsers, offline simulation.
- **Acceptance**: Household setup, role-based permissions, offline access.
