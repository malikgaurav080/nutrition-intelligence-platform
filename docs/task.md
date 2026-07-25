# 📋 UI Rebuild Execution Checklist (`task.md`)

This checklist tracks the screen-by-screen frontend redesign to match [`docs/ui-screens-spec.md`](./docs/ui-screens-spec.md) and [`docs/design-system.md`](./docs/design-system.md).

---

## 🎨 Phase 1: Foundation & Shared UI Components
- [x] **1.1 Design Tokens (`src/index.css`)**
  - Light mode variables, emerald primary, Inter font, radius/shadow tokens
- [x] **1.2 Atomic UI Primitives (`src/components/ui/`)**
  - `<ProgressBar>`, `<ProgressRing>`, `<SegmentedControl>`
- [x] **1.3 Shell Layout (`src/components/layout/`)**
  - `<AppHeader>` — flexible left/center/right slot composition
  - `<BottomNav>` — 5-tab floating glass nav bar with center `(+)` FAB

---

## 📱 Phase 2: Screen-by-Screen UI Rebuild (Completed)

- [x] **2.1 Main Dashboard (`/dashboard` — Screen 1)**
- [x] **2.2 Today's Meals (`/meals` — Screen 2)**
- [x] **2.3 Health Systems (`/health` — Screen 3)**
- [x] **2.4 Nutrition Targets (`/targets` — Screen 4)**
- [x] **2.5 Micronutrients Detail (`/micronutrients` — Screen 5)**
- [x] **2.6 Meal Plan Generator (`/meal-plan` — Screen 6)**
- [x] **2.7 Add Meal / Food Logger (`/log-food` — Screen 7)**
- [x] **2.8 Insights (`/insights` — Screen 8)**
- [x] **2.9 ~~Profile & Settings (`/profile` — Screen 9)~~** → _Replaced by Reports. Profile moved to top-right drawer._

---

## 🔄 Phase 3: Profile → Reports Restructuring (Current Sprint)

### 3.1 `docs/ui-screens-spec.md`
- [x] Screen 9 renamed from "Profile & Settings" → "Reports (`/reports`)"
- [x] Added Screen 10 spec: Profile Drawer (slide-in panel via top-right avatar)

### 3.2 `docs/task.md`
- [x] Updated task tracker to reflect Reports + Profile Drawer work

### 3.3 `src/pages/Reports.tsx` [NEW]
- [x] Create Reports screen (`/reports`)
  - Timeframe segmented toggle (Weekly / Monthly / All Time)
  - Summary stats row: Avg Calories, Best Score, Days Tracked
  - Macro trend bar chart (Protein/Carbs/Fat grouped bars)
  - Nutrition Score timeline chart (daily scores, today highlighted)
  - Health System breakdown card with average % per system
  - Micronutrient deficiency summary (top 5 gaps)

### 3.4 `src/components/layout/ProfileDrawer.tsx` [NEW]
- [x] Slide-in drawer component from the right (translateX animation, 280ms ease)
- [x] Semi-transparent overlay backdrop (closes drawer on click)
- [x] User avatar (56×56px initials, emerald gradient) + ✏️ edit icon
- [x] Name, user ID, Pro Max Member amber badge
- [x] Navigation options list (8 items with icon + label + chevron)
- [x] User stats mini-row (Goal / Activity / Diet)
- [x] Sign Out button (red ghost)

### 3.5 `src/components/layout/AppHeader.tsx` [MODIFY]
- [x] Implement merged Profile Avatar + Hamburger Badge button in the top-left slot (38×38px avatar circle with overlapping circular badge containing 3-line hamburger icon as shown in reference image)
- [x] Tapping merged button opens ProfileDrawer
- [x] Retain default right slot as notification bell icon with badge dot

### 3.6 `src/components/layout/BottomNav.tsx` [MODIFY]
- [x] Replace 5th tab "Profile" (`/profile`) → "Reports" (`/reports`)
- [x] Bar-chart SVG icon for Reports tab
- [x] Updated `aria-label` and `id` attributes

### 3.7 `src/App.tsx` [MODIFY]
- [x] Added `/reports` protected route → `<Reports />`

### 3.8 `src/pages/index.ts` [MODIFY]
- [x] Exported `Reports` page


---

## 🔒 Phase 4: Verification & Backend Integrity
- [ ] `tsc --noEmit` — zero TypeScript errors
- [ ] Profile drawer opens/closes correctly on avatar tap
- [ ] Reports page loads with real data from `NutritionContext` + `UserContext`
- [ ] Bottom nav Reports tab active state works correctly
- [ ] No regressions in BMR/TDEE calculation or API calls
