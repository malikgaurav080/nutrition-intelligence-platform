# 📱 UI Screens Specification & Visual Layout

Reference Image: [`docs/assets/UI.png`](./assets/UI.png)

This document breaks down the exact layout, component architecture, visual elements, and interactive states for all screens extracted from the reference design.

---

## 1. 🏠 Main Dashboard (`/`)

### Layout & Sections
- **Top Navigation Bar**:
  - Hamburger menu icon (Left)
  - Greeting header: `"Good Morning Gaurav 👋"` (Center-Left)
  - Notification bell icon with badge (Right)
- **Hero Card — Calorie & Energy Balance**:
  - Background: Dark Emerald Green gradient (`#064E3B` → `#065F46`)
  - Calorie progress bar showing Taken Calories (consumed), Target Calories (goal), and Maintenance Calories (TDEE)
  - Numeric breakdown: `Taken: 1,700 kcal`, `Target: 2,200 kcal`, `Maintenance: 2,450 kcal`
- **Interactive Water Tracker**:
  - Responsive 1-row glass SVG icons layout (8–10 glass icons fitting dynamically in a single row on all screen sizes)
  - Clear SVG glass cup shape with blue fill level indicator for consumed glasses
  - Tapping `+ Add Glass` or any empty glass adds 250ml and logs directly to DB via backend API
- **Today's Progress (2x2 Macro Grid)**:
  - Header: `"Macronutrient Progress"` title on left, `"Micronutrients 💊"` button on right (navigates to `/micronutrients`)
  - Macro cards feature distinct nutrient icons for enhanced visual scanability:
    - 🥩 **Protein**: `102 / 145 g` (70%)
    - 🍞 **Carbs**: `220 / 275 g` (80%)
    - 🥑 **Fat**: `56 / 73 g` (77%)
    - 🌿 **Fiber**: `18 / 25 g` (72%)
  - *(Calories and Water removed from grid as they are featured in Hero & Water sections above)*
- **Health System Scores (Horizontal Scroll / Badges)**:
  - Dynamic circular icon badges displaying the user's selected Health Priorities chosen during registration/onboarding (min 1, max 5)
  - Each badge features a rounded circular icon background container with themed accent colors, bold percentage completion score (e.g. `91%`), and clean title label (e.g., Brain, Immunity, Heart, Bones, Muscle)
  - Horizontal scroll container (`pill-tabs`) allowing sleek scannability
  - Interactive navigation: Tapping any health badge opens the Health Systems detailed view (`/health`)
- **Bottom Navigation Bar**:
  - Fixed floating glass bar with 5 tabs: Home (Active), Meals, Floating `(+)` Action Button (Center), Progress, Reports
  - Top-left corner (in AppHeader): Merged Profile Avatar + Hamburger Menu Badge button — tapping opens the Profile Drawer
  - Top-right corner (in AppHeader): Notification bell icon with badge dot

---

## 2. 🥗 Today's Meals (`/meals`)

### Layout & Sections
- **Header**: Title `"Today's Meals"`, Calendar date picker icon
- **Meal Schedule Tabs**: `Breakfast` (Active), `Lunch`, `Dinner`, `Snacks`
- **Active Meal Item Card**:
  - Meal food photo thumbnail (e.g. Greek Yogurt Bowl)
  - Status badge: `Completed ✓`
  - Macro breakdown pill: Calories `480 kcal`, Protein `28g`, Carbs `42g`, Fat `18g`
- **Meal Timeline (Vertical Timeline)**:
  - Header: `"Meal Timeline"` title with top-right chevron icon (`>`)
  - Vertical layout: Individual rounded card containers for each slot linked by a continuous left vertical connector line
  - Node Badges:
    - Logged Slot: Solid green circular checkmark badge (`✓`)
    - Pending Slot: Circular outlined badge with clock icon and green top accent tab
  - Details: Bold slot title (`Breakfast`, `Lunch`, `Snacks`, `Dinner`), subtitle line formatted as `Time • Calories` (e.g. `8:30 AM • 480 kcal`, `12:30 PM • 650 kcal`)
  - Actions: Circular elevated `+` button on right side for pending slots
- **AI Recommendation Card**:
  - Soft grey card with nutrient icon/photo
  - Copy: *"You're low on Iron and Omega-3. Add Pumpkin Seeds to your next meal."*

---

## 3. 🩺 Health Systems (`/health`)

### Layout & Sections
- **Header**: Back button, Title `"Health Systems"`, Info button
- **Category Filter Tabs**: `All` (Active), `Needs Attention`, `Strong`
- **System Progress Rows**:
  - 🧠 Brain & Nervous System — `91%` (Excellent) — Emerald bar
  - 🛡️ Immunity — `74%` (Good) — Green bar
  - ❤️ Heart Health — `88%` (Excellent) — Emerald bar
  - 🦴 Bones & Teeth — `82%` (Good) — Green bar
  - 💪 Muscle Health — `87%` (Excellent) — Emerald bar
  - ✨ Skin Health — `65%` (Needs Attention) — Amber bar
  - 💇 Hair Health — `62%` (Needs Attention) — Amber bar
  - 👀 Eye Health — `78%` (Good) — Green bar
  - 🩸 Blood Health — `85%` (Excellent) — Emerald bar
  - 🦋 Thyroid Health — `70%` (Good) — Green bar
- **Overall Health Score Card (Bottom)**:
  - Score `78%` (Good) with circular SVG gauge

---

## 4. 💊 Micronutrients Detail View (`/micronutrients`)

### Layout & Sections
- **Header**: Back arrow, Title `"Micronutrients"`, Search icon
- **Tabs**: `Vitamins` | `Minerals`
- **Ultra-Compact Nutrient Grid (2 Columns / Row)**:
  - High-density 2-column grid (`display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px;`) displaying all vitamins or minerals simultaneously with smooth vertical page scrolling
  - Ultra-compact card layout:
    - **Header Row**: Nutrient icon badge (e.g. 👁️) + title (`Vitamin A`) on top-left; bold percentage score (`94%`) on top-right
    - **Middle Row**: Intake fraction (`850 / 900 µg`) with muted typography
    - **Bottom Row**: Color-coded progress bar (emerald ≥80%, amber ≥50%, red <50%)

---

## 5. 🍲 Generated Meal Plan (`/meal-plan` & `/meals`)

### Layout & Sections
- **Header**: Back arrow, Title `"Meal Plan"`, Filter icon
- **Active Plan Top Banner**: Premium dark emerald gradient card (`rgba(6, 78, 59, 0.95)` → `rgba(6, 95, 70, 0.95)`) featuring:
  - Active status indicator: `🌟 Active Plan` with glowing green dot
  - Active Plan Name: `Plan 1` (or active plan title)
  - `🔄 Switch Plan` / `✕ Close` pill button to toggle the interactive Plan Selector card
- **Interactive Plan Selector Card** (expanded when `Switch Plan` is tapped):
  - Header: `"Select a Meal Plan to View or Switch"` title with close (`✕`) icon button
  - List of saved plan cards (`Plan 1`, `Plan 2`, `Plan 3`) with calorie & protein metrics
  - Highlighted `Active Plan ✓` badge for the active plan
  - Direct `Set Active` action button per plan for instant 1-tap activation
  - Prominent `➕ Create New Plan (1/3)` dashed button (available when total saved plans < 3) to trigger generation and save a new plan
- **Plan Summary Banner**: Dark emerald gradient card (`#064E3B` → `#065F46`) displaying plan name (`Plan 1`), subtitle (`High Protein Plan`), total calories & protein (`1,850 kcal · 120g Protein`)
- **Nutrient Gap Alerts Card**: Amber warning container (`var(--color-amber-bg)`) listing audited nutrient deficiencies in the plan
- **Meal Slot Cards**:
  - `Breakfast` ☀️: Slot icon & title, total calories, food items list (name, serving count, calories), and `Log Slot` action button
  - `Lunch` 🌤️: Slot icon & title, total calories, food items list (name, serving count, calories), and `Log Slot` action button
  - `Snacks` 🍎: Slot icon & title, total calories, food items list (name, serving count, calories), and `Log Slot` action button
  - `Dinner` 🌙: Slot icon & title, total calories, food items list (name, serving count, calories), and `Log Slot` action button
- **Plan Actions Row**: Interactive plan control buttons (`⚡ Set Active` / `Active Plan ✓` and `🗑️ Delete Plan` or `💾 Save As New Plan`)
- **Smart Adjustments Card**: Card displaying AI/engine nutrient optimization recommendations (`💡 Smart Adjustments`)
- **Sticky CTA**: Fixed bottom action button (`🔄 Generate New Plan`) to shuffle or generate alternative recommendations

---

## 6. 🔍 Add Meal / Food Logger (`/log-food`)

### Layout & Sections
- **Header**: Back arrow, Title `"Add Meal"`, Share/Export icon
- **Search Input**: `"Search food or recipe"` with magnifying icon
- **Filter Pills**: `All` (Active), `My Foods`, `Recipes`, `Scan`
- **"Quick Add" List**:
  - Boiled Egg (1 large) — `78 kcal` — `(+)` Add
  - Oats (40g) — `150 kcal` — `(+)` Add
  - Banana (1 medium) — `105 kcal` — `(+)` Add
  - Almonds (10) — `70 kcal` — `(+)` Add
- **CTA**: `"Create Custom Meal"` button

---

## 7. 💡 Insights (`/insights`)

### Layout & Sections
- **Header**: Back arrow, Title `"Insights"`
- **Timeframe Selector**: `Today` | `Weekly` (Active) | `Monthly`
- **Nutrient Insight Hero Card**:
  - Copy: *"Your Iron intake is low. Add more lentils, spinach or pumpkin seeds to complete your target. Improve Now →"*
- **Weekly Trend Chart**:
  - Bar chart with M, T, W, T, F, S, S bars
  - Stat: `1,850 kcal avg` (`↓ 120 kcal vs last week`)
- **Top Consumed Foods**:
  - List of top items (e.g. Oats — 12 servings)

---

## 8. 📊 Reports (`/reports`)

> **Navigation change:** This screen replaces the former "Profile" tab in the bottom navigation bar. The 5th bottom-nav tab is now **"Reports"** (bar-chart icon). Profile is accessed via the top-right circular user avatar in `AppHeader`.

### Layout & Sections
- **Header**: Hamburger menu icon (Left), Title `"Reports"` (Center), Date-range picker icon (Right)
- **Timeframe Segmented Toggle**: `Weekly` (Active) | `Monthly` | `All Time`
- **Summary Stats Row (3 cards, horizontal)**:
  - Avg Daily Calories: `1,850 kcal`
  - Best Nutrition Score: `94`
  - Days Tracked: `18`
- **Macro Trend Chart**:
  - Grouped bar chart — Protein (Blue) / Carbs (Amber) / Fat (Red) across days
  - X-axis: day labels (M, T, W, T, F, S, S)
  - Y-axis: grams
- **Nutrition Score Timeline**:
  - Bar chart showing daily overall score (0–100) for the selected period
  - Today's bar highlighted in emerald green; others in light grey
- **Health System Breakdown Card**:
  - Horizontal list of all user-selected health systems + their average score % for the period
  - Color-coded bars (green ≥70%, amber 50–69%, red <50%)
- **Micronutrient Summary**:
  - Top 5 consistently-deficient nutrients across the period
  - Row format: Nutrient name + avg completion % + colored bar

---

## 10. 👤 Profile Drawer (Slide-in Panel)

> **Not a standalone route.** This is a **slide-in drawer** that overlays any screen. It is opened by tapping the **circular user avatar button** in the top-left of `AppHeader` (next to the menu bar icon, visible across all protected screens).

### Trigger
- A merged **Profile Avatar + Hamburger Menu Badge button** is rendered in the **left slot** of `AppHeader`. It consists of a 38×38px circular avatar with user initials/photo and an overlapping circular light badge (20×20px) at the bottom-right containing a 3-line hamburger menu bar icon.
- Tapping this merged button opens the Profile Drawer from the right.
- The default **right slot** of `AppHeader` retains the notification bell icon with badge dot.
- A semi-transparent dark overlay appears behind the drawer; tapping it closes the drawer.

### Drawer Panel Layout
- **Width**: 80vw (max 320px), full viewport height
- **Background**: `var(--bg-card)` white
- **Slide animation**: Translates in from `translateX(100%)` → `translateX(0)` over 280ms ease
- **Header**:
  - Close (×) button — top-right of drawer
  - Circular avatar (56×56px, initials, emerald gradient) + ✏️ Edit icon overlay
  - Name: user's full name
  - User ID: email prefix (e.g. `malikgaurav080`)
  - Membership Badge: `⭐ Pro Max Member` (amber pill) — `Expiring on 27th August`
- **Navigation Options List** (each row: icon + label + chevron):
  - ✏️ Edit Profile
  - 🏋️ Workout AI Plan
  - 🩸 Blood Health Analysis
  - 🧑‍💼 Your Personal Trainer
  - 🤖 AI Nutrition Coach
  - ⚙️ Account & Settings
  - 🛡️ Safety Centre
  - ❓ Help & Support
- **User Stats Row**: Goal | Activity | Diet type (compact 3-column mini-cards)
- **Sign Out button**: Red ghost button at the bottom of the drawer
