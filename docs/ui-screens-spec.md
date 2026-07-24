# 📱 UI Screens Specification & Visual Layout

Reference Image: [`docs/assets/UI.png`](./assets/UI.png)

This document breaks down the exact layout, component architecture, visual elements, and interactive states for all 9 screens extracted from the reference design.

---

## 1. 🏠 Main Dashboard (`/`)

### Layout & Sections
- **Top Navigation Bar**:
  - Hamburger menu icon (Left)
  - Greeting header: `"Good Morning Gaurav 👋"` (Center-Left)
  - Notification bell icon with badge (Right)
- **Hero Card — Overall Nutrition Score**:
  - Background: Dark Emerald Green gradient (`#064E3B` → `#047857` or dark surface with emerald ring)
  - Content: Large numeric score (e.g. `92`), status label (`"Excellent"`), subtext (`"↑ 12% vs yesterday"`)
  - Radial SVG progress ring animating to current score
- **Today's Progress (2x3 Card Grid)**:
  - **Calories**: `1,700 / 2,200 kcal` (77%) with dual-color horizontal progress bar
  - **Protein**: `102 / 145 g` (70%)
  - **Carbs**: `220 / 275 g` (80%)
  - **Fat**: `56 / 73 g` (77%)
  - **Fiber**: `18 / 25 g` (72%)
  - **Water**: `1.8 / 2.5 L` (72%)
- **Health System Scores (Horizontal Scroll / Badges)**:
  - Circular icon badges with percentage and title:
    - 🧠 Brain (91%)
    - 🛡️ Immunity (74%)
    - ❤️ Heart (88%)
    - 🦴 Bones (82%)
    - 💪 Muscle (87%)
- **Bottom Navigation Bar**:
  - Fixed floating glass bar with 5 tabs: Home (Active), Meals, Floating `(+)` Action Button (Center), Progress, Profile

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
  - Breakfast slot (`8:30 AM • 480 kcal`) — Checkmark badge
  - Lunch slot (`12:30 PM • 650 kcal`) — `(+)` Add button
  - Snacks slot (`4:30 PM • 200 kcal`) — `(+)` Add button
  - Dinner slot (`7:30 PM • 550 kcal`) — `(+)` Add button
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

## 4. 📊 Nutrition Targets (`/targets`)

### Layout & Sections
- **Header**: Hamburger menu, Title `"Nutrition Targets"`, Edit button
- **Segmented Toggle**: `Macros` (Active) | `Micronutrients`
- **Macro Donut Chart**:
  - Center label: `2,200 kcal Daily Target`
  - Donut slices & legend:
    - Protein: `145g` (26%) — Blue
    - Carbs: `275g` (50%) — Yellow/Orange
    - Fat: `73g` (24%) — Red/Pink
- **Target Detail Cards**:
  - **Fiber**: `25 g` (14g per 1000 kcal standard)
  - **Water**: `2.5 L` Recommended

---

## 5. 💊 Micronutrients Detail View (`/micronutrients`)

### Layout & Sections
- **Header**: Back arrow, Title `"Micronutrients"`, Search icon
- **Tabs**: `Vitamins` | `Minerals`
- **Nutrient Rows with Fraction & Bar**:
  - Vitamin A: `850 / 900 µg` (94%)
  - Vitamin C: `72 / 90 mg` (80%)
  - Vitamin D: `15 / 15 µg` (100%)
  - Iron: `8.5 / 18 mg` (47% - Amber)
  - Calcium: `820 / 1000 mg` (82%)
  - Vitamin B12: `2.4 / 2.4 µg` (100%)
- **CTA**: `"View All Micronutrients"` button

---

## 6. 🍲 Generated Meal Plan (`/meal-plan`)

### Layout & Sections
- **Header**: Back arrow, Title `"Meal Plan"`, Filter icon
- **Plan Summary Banner**: `"High Protein Plan (2,200 kcal • 145g Protein)"`
- **Food Thumbnails Carousel**
- **Plan Meal Slot Cards**:
  - Breakfast: Greek Yogurt Bowl (`480 kcal`)
  - Lunch: Quinoa Buddha Bowl (`650 kcal`)
  - Dinner: Grilled Chicken & Veggies (`560 kcal`)
  - Snacks: Almonds & Banana (`200 kcal`)
- **Sticky CTA**: `"Generate New Plan"` green button

---

## 7. 🔍 Add Meal / Food Logger (`/log-food`)

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

## 8. 💡 Insights (`/insights`)

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

## 9. 👤 Profile & Settings (`/profile`)

### Layout & Sections
- **Header**: Back arrow, Title `"Profile"`, Settings gear
- **User Profile Header Card**:
  - Avatar picture + Edit icon
  - Name: `"Gaurav Malik"`
  - User ID: `malikgaurav080`
  - Membership Badge: `Gold (Expiring 27th August)`
- **Navigation Options**:
  - Edit Profile
  - Workout AI Plan
  - Blood Health Analysis
  - Your Personal Trainer
  - AI Nutrition Coach
  - Account & Settings
  - Safety Centre
  - Help & Support
