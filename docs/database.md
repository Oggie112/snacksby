# Database

Managed via Supabase (Postgres). Schema created and maintained in the Supabase dashboard.

---

## Schema

### `profiles`
Extends Supabase auth users with display info. `id` matches `auth.users.id`.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, matches auth user |
| `full_name` | `text` | |
| `avatar_url` | `text` | Nullable — placeholder until upload feature built |
| `created_at` | `timestamptz` | |

---

### `households`
A household is the top-level grouping for all shared data.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `name` | `text` | |
| `created_by` | `uuid` | FK → `profiles.id` |
| `invite_code` | `text` | Unique code for joining |
| `created_at` | `timestamptz` | |

---

### `household_members`
Junction table. Composite PK on `(household_id, user_id)` — enforces one membership per user per household.

| Column | Type | Notes |
|---|---|---|
| `household_id` | `uuid` | FK → `households.id` |
| `user_id` | `uuid` | FK → `profiles.id` |
| `role` | `role_type` | Enum: `Leader`, `Contributor`, `Member` |

**Role permissions:**
- **Leader** — full access; manage members, household settings, recipes, meal plan
- **Contributor** — create/edit recipes and meal plan; no member management
- **Member** — read-only on recipes and meal plan; full access to shopping list

---

### `recipes`
Scoped to a household. `ingredients` and `procedure` stored as JSON for flexibility.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `household_id` | `uuid` | FK → `households.id` |
| `title` | `text` | |
| `description` | `text` | Nullable |
| `servings` | `int` | Nullable |
| `prep_time` | `int` | Minutes, nullable |
| `cook_time` | `int` | Minutes, nullable |
| `ingredients` | `json` | Unstructured for MVP |
| `procedure` | `json` | Unstructured for MVP |
| `tags` | `text[]` | |
| `created_at` | `timestamptz` | |

---

### `meal_plan`
One row per recipe assigned to a day slot.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `household_id` | `uuid` | FK → `households.id` |
| `recipe_id` | `uuid` | FK → `recipes.id` |
| `date` | `date` | |
| `meal_type` | `meal_type` | Enum: `breakfast`, `lunch`, `dinner` |
| `created_at` | `timestamptz` | |

---

### `shopping_list_items`
Shared list scoped to a household. All members have full read/write access.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `household_id` | `uuid` | FK → `households.id` |
| `name` | `text` | |
| `category` | `text` | Nullable |
| `quantity` | `text` | Nullable |
| `checked` | `bool` | |
| `created_at` | `timestamptz` | |

---

## Row Level Security

RLS is enabled on all tables. Policies are enforced automatically by Supabase on every query — rows that fail a policy are silently filtered from reads; writes return an error.

### Core pattern
Most policies subquery `household_members` to verify the current user (`auth.uid()`) belongs to the relevant household, with role checks layered on top where needed.

### Policy summary

| Table | Operation | Who |
|---|---|---|
| `profiles` | Select, Update | Own row only |
| `households` | Select | Any household member |
| `households` | Insert | Authenticated user (must set `created_by = auth.uid()`) |
| `households` | Update, Delete | Leader only |
| `household_members` | Select | Members of the same household |
| `household_members` | Insert | Self-join (one household per user) or Leader adding another |
| `household_members` | Delete | Leader (remove others) or self (leave) |
| `recipes` | Select | Any household member |
| `recipes` | Insert, Update, Delete | Leader or Contributor |
| `meal_plan` | Select | Any household member |
| `meal_plan` | Insert, Update, Delete | Leader or Contributor |
| `shopping_list_items` | All | Any household member |

### One household per user
Enforced at the RLS insert policy level on `household_members` — a user cannot insert a row for themselves if they already appear in the table anywhere.
