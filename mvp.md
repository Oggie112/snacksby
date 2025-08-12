# Snacksby MVP Quick Reference

## **Core Goal**
Collaborative meal planning & unified shopping list for households — simple, offline-capable, mobile-first.

---

## **Must-Have Features**
1. **User Accounts**
   - Supabase auth (email/password)
   - Household creation & join via invite link/code
   - Roles:
     - **Leader**: full control
     - **Contributor**: add/edit recipes, set plans
     - **Member**: view-only

2. **Recipe Management**
   - Add/edit/delete recipes
   - Fields: title, servings, ingredients, method
   - No portion scaling (user handles manually)

3. **Meal Planning**
   - Manual selection OR “give me X recipes” suggestion
   - Assign meals to days (calendar/week view)
   - Regenerate/replace individual meals before confirming

4. **Shopping List**
   - Merge recipe ingredients into one list
   - Categorised items
   - Tick items offline
   - Add custom items

5. **Offline Mode**
   - Cached recipes & shopping list
   - Auto-sync on reconnect

---

## **Technical Stack**
- **Frontend**: TypeScript, React, TailwindCSS + DaisyUI
- **Backend**: Supabase (Postgres)
- **API**: GraphQL
- **Deployment**: Vercel, Render, or AWS (free tier)
- **PWA**: Installable, offline-first

---

## **Constraints**
- Budget: £0/month, free tiers only
- Platforms: Mobile PWA, desktop browser
- No ratings, social feed, or AI for MVP
- AI (OpenAI + LangChain/LangGraph) is post-MVP
- Roles enforced per household

---

## **Flow Overview**
1. **Login** → **Create/Join Household**
2. **Add Recipes** (Leader/Contributor)
3. **Generate Plan** (manual or suggestion)
4. **Assign Meals to Days**
5. **View Shopping List** (merged + categorised)
6. **Shop Offline** (tick items, add customs)

---

## **Post-MVP Ideas**
- AI recipe search (“spicy chicken” → results)
- Voice assistant integration
- Barcode scanning
- External calendar sync
- Portion scaling

---
