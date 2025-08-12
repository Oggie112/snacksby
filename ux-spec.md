# UX/UI Design Specification — Snacksby

## 2. User Journey

### 2.1 User Journey Maps
**Persona: Household Leader**
- **Initial Interaction:**  
  Opens app → sees weekly meal plan overview.
- **Core Flows:**  
  Add recipes → Generate shopping list → Assign meals to days → Share with household.
- **Key Touchpoints:**  
  Recipe search, shopping list ticking, weekly plan generation.
- **Emotional Journey:**  
  Calm (clear plan) → Engaged (choosing meals) → Satisfied (list complete).

**Persona: Contributor**
- **Initial Interaction:**  
  Opens app → sees current plan and shopping list.
- **Core Flows:**  
  Suggest meals, tick items, mark tasks complete.

**Persona: Member**
- **Initial Interaction:**  
  Opens app → checks plan for the day.
- **Core Flows:**  
  View recipes, tick off shopping list items.

---

### 2.2 User Scenarios
- **Primary:** Household leader creates a weekly meal plan and shopping list shared across all members.
- **Edge Case:** Offline access to recipes and shopping list during store trip.
- **Exceptional Interaction:** AI-assisted meal plan generation when online.

---

## 3. Design Principles

### 3.1 Design Philosophy
- **Approach:** Simple, joyful, and intuitive.
- **Visual Style:** Pastel and warm colors with friendly Shiba Inu mascot elements.
- **Brand Alignment:** Calm yet playful, reducing stress around meal planning.

### 3.2 Accessibility Considerations
- WCAG AA compliance for all text/background combos.
- High-contrast mode support in future iterations.
- All UI elements navigable via keyboard.

---

## 4. Interface Design

### 4.1 Information Architecture
- **Navigation Structure:**
  - **Mobile:** Bottom nav bar (Home, Recipes, Plan, Shopping List).
  - **Desktop:** Top nav bar with same sections.
- **Content Hierarchy:**  
  Plan first, recipes second, shopping last in hierarchy of importance.

### 4.2 Interaction Patterns
- Tap/click to tick off shopping list items.
- Swipe/drag to reorder meals (mobile).
- Micro-interactions for adding/removing recipes.

### 4.3 Layout Guidelines
- **Grid:** 8px baseline grid.
- **Spacing:** Minimum 16px padding between components.
- **Responsive:** Three breakpoints — mobile (<640px), tablet (641–1024px), desktop (>1025px).

---

## 5. Visual Design System

### 5.1 Color Palette
| Role        | Color Name   | Hex       | Usage |
|-------------|--------------|-----------|-------|
| Primary     | Pastel coral | `#F6A6A1` | Key brand accents, buttons, borders |
| Secondary   | Warm beige   | `#D8BFA6` | Card backgrounds, Shiba Inu fur |
| Accent      | Soft mint    | `#A3D2CA` | Highlights, tags, small decorative elements |
| Neutral     | Creamy white | `#FFF8F0` | App background, white space |
| Text        | Dark brown   | `#4A3F35` | All text, icon outlines, mascot details |

**Usage Rules:**
- Primary & Secondary = ~60/30 ratio.
- Accent sparingly for attention.
- Maintain WCAG AA contrast.

### 5.2 Typography
- **Font Family:** “Inter” for all UI text.
- **Headings:** Bold, coral or brown.
- **Body Text:** Regular, dark brown, min 16px size.

### 5.3 Icon and Imagery Style
- Rounded, soft corners.
- Mascot illustrations use beige + coral, outlined in dark brown.

---

## 6. Interaction Design

### 6.1 User Input
- Forms minimal, one action per screen when possible.
- Real-time input validation.

### 6.2 Feedback Mechanisms
- Coral spinner for loading.
- Mint success toast.
- Coral error toast.

---

## 7. Responsive Design

### 7.1 Device Considerations
- **Mobile:** Primary target for daily use.
- **Desktop:** For initial meal plan creation and recipe editing.

### 7.2 Adaptive Layouts
- Nav placement changes with viewport size.
- Shopping list remains in simplified format across devices.

---

## 9. Usability Testing

### 9.1 Testing Approach
- Informal self-testing and peer feedback.
- Focus on clarity, speed, and ease of navigation.

### 9.2 Initial Findings
- Pending post-wireframe.
