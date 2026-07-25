# 📋 UI Rebuild Execution Checklist (`task.md`)

This checklist tracks the screen-by-screen frontend redesign to match [`docs/ui-screens-spec.md`](./docs/ui-screens-spec.md) and [`docs/design-system.md`](./docs/design-system.md).

---

## 🎨 Phase 1: Foundation & Shared UI Components
- [x] **1.1 Design Tokens (`src/index.css`)**
  - Light mode variables, emerald primary, Inter font, radius/shadow tokens
- [x] **1.2 Atomic UI Primitives (`src/components/ui/`)**
  - `<ProgressBar>`, `<ProgressRing>`, `<SegmentedControl>`
- [x] **1.3 Shell Layout (`src/components/layout/`)**
  - `<AppHeader>` — flexible left/center/right slot composition with merged profile avatar + hamburger badge button
  - `<BottomNav>` — 5-tab floating glass nav bar with center `(+)` FAB

---

## 📱 Phase 2: Screen-by-Screen UI Rebuild

- [x] **2.1 Main Dashboard (`/dashboard` — Screen 1 UI Update)**
  - Calorie Hero Card: Progress bar with Taken (consumed), Target (goal), and Maintenance (TDEE) calorie values
  - Interactive Water Tracker: Responsive 1-row layout with clear SVG glass cup icons (fitting all 8–10 glasses dynamically in 1 single row on all mobile screen sizes) + tap to log +250ml to DB
  - 2x2 Macro Grid: Added distinct nutrient icons (🥩 Protein, 🍞 Carbs, 🥑 Fat, 🌿 Fiber) for enhanced scanability
  - Horizontal Health System Scores summary row
- [x] **2.2 Today's Meals (`/meals` — Screen 2)**
- [x] **2.3 Health Systems (`/health` — Screen 3)**
- [x] **2.4 Nutrition Targets (`/targets` — Screen 4)**
- [x] **2.5 Micronutrients Detail (`/micronutrients` — Screen 5)**
- [x] **2.6 Meal Plan Generator (`/meal-plan` — Screen 6)**
- [x] **2.7 Add Meal / Food Logger (`/log-food` — Screen 7)**
- [x] **2.8 Insights (`/insights` — Screen 8)**
- [x] **2.9 Reports (`/reports` — Screen 9)**

---

## 🔄 Phase 3: Profile & Navigation Restructuring
- [x] Screen 9 renamed from "Profile & Settings" → "Reports (`/reports`)"
- [x] Added Profile Drawer (slide-in panel via merged top-left avatar + menu icon)
- [x] Header & BottomNav updated accordingly

---

## 🔒 Phase 4: Verification & Backend Integrity
- [x] `tsc --noEmit` — zero TypeScript errors
- [x] `oxlint src/` — zero linter errors
- [x] Calorie & Water tracking backend API persistence verified
