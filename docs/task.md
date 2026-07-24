# 📋 UI Rebuild Execution Checklist (`task.md`)

This checklist tracks the screen-by-screen frontend redesign to match [`docs/ui-screens-spec.md`](./docs/ui-screens-spec.md) and [`docs/design-system.md`](./docs/design-system.md).

---

## 🎨 Phase 1: Foundation & Shared UI Components
- [ ] **1.1 Design Tokens (`src/index.css`)**
  - Dark mode variables (`--bg-app: #0B0F14`, `--bg-card: #141A22`, `--color-emerald: #10B981`, etc.)
  - Light mode support variables
  - Typography rules (Inter font, tabular figures)
  - Rounded corners (`20px`) and shadow tokens
- [ ] **1.2 Atomic UI Primitives (`src/components/ui/`)**
  - `<Card>` & `<CardHeader>` (Soft rounded surface containers)
  - `<Button>` (Primary green, secondary ghost, floating action)
  - `<ProgressBar>` (Dual-layer animated progress bar)
  - `<ProgressRing>` (SVG circular score/macro gauge)
  - `<Badge>` (Priority, completion status, membership badges)
  - `<SegmentedControl>` (Tab switchers for Macros/Micros, Days)
- [ ] **1.3 Shell Layout (`src/components/layout/`)**
  - `<AppHeader>` (Hamburger menu, greeting title, bell icon)
  - `<BottomNav>` (5-Tab floating glass nav bar with center `(+)` button)

---

## 📱 Phase 2: Screen-by-Screen UI Rebuild

- [ ] **2.1 Main Dashboard (`/` — Screen 1)**
  - Greeting header + notification badge
  - Hero Nutrition Score Card (`92 Excellent` + animated ring)
  - 2x3 Today's Progress grid (Calories, Protein, Carbs, Fat, Fiber, Water)
  - Horizontal Health System Scores summary row
  - Integration with `NutritionContext` daily log

- [ ] **2.2 Today's Meals (`/meals` — Screen 2)**
  - Header date picker + category pills (`Breakfast`, `Lunch`, `Dinner`, `Snacks`)
  - Featured meal item card with photo, `Completed ✓` badge, macro pill
  - Vertical Meal Timeline list with slot status and `(+)` add actions
  - AI Recommendation alert card

- [ ] **2.3 Health Systems (`/health` — Screen 3)**
  - Category filter tabs (`All`, `Needs Attention`, `Strong`)
  - 10 System progress rows with color-coded status bars (Brain, Immunity, Heart, Bones, Muscle, Skin, Hair, Eye, Blood, Thyroid)
  - Bottom Overall Health Score card (`78% Good` + ring)

- [ ] **2.4 Nutrition Targets (`/targets` — Screen 4)**
  - Macro / Micronutrients segmented toggle
  - Center Donut chart for 2,200 kcal daily target breakdown (Protein 26%, Carbs 50%, Fat 24%)
  - Fiber & Water target recommendation cards

- [ ] **2.5 Micronutrients Detail (`/micronutrients` — Screen 5)**
  - Vitamins / Minerals tabs
  - Detailed nutrient progress list with exact target fractions (e.g., `850 / 900 µg`)
  - View all micronutrients CTA button

- [ ] **2.6 Meal Plan Generator (`/meal-plan` — Screen 6)**
  - High Protein Plan banner summary
  - Food thumbnail carousel
  - Meal slots breakdown list
  - `"Generate New Plan"` sticky action button

- [ ] **2.7 Add Meal / Food Logger (`/log-food` — Screen 7)**
  - Food search input + category pills (`All`, `My Foods`, `Recipes`, `Scan`)
  - Quick Add list items with `(+)` single-click log actions
  - `"Create Custom Meal"` CTA button

- [ ] **2.8 Insights (`/insights` — Screen 8)**
  - Timeframe selector (`Today`, `Weekly`, `Monthly`)
  - Hero Nutrient Insight advice card
  - Weekly trend bar chart (`1,850 kcal avg`)
  - Top consumed foods ranking list

- [ ] **2.9 Profile & Settings (`/profile` — Screen 9)**
  - User avatar header card + Pro membership badge
  - Settings navigation list items

---

## 🔒 Phase 3: Verification & Backend Integrity Test
- [ ] Verify zero regressions in BMR/TDEE calculation formulas
- [ ] Verify zero regressions in REST API calls & MongoDB persistence
- [ ] Validate mobile responsiveness across 375px, 390px, 414px breakpoints
