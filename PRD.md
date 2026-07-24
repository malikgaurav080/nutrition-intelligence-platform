# 📄 Product Requirements Document (PRD)
# Nutrition Intelligence Platform — Phase 1 MVP

**Version:** 1.0  
**Date:** July 2026  
**Status:** Approved for Development  
**Platform:** Mobile-First Web Application (Progressive Web App)

> 📚 **Documentation & Specifications Index**:
> - 📄 **Personalised RDA Reference Table**: [docs/rda-reference.md](./docs/rda-reference.md)
> - 💡 **Essential Nutrients & Health Guide**: [docs/essential-nutrients-guide.md](./docs/essential-nutrients-guide.md)
> - 🥗 **52-Item Vegetarian Food Database**: [docs/foodDatabase.md](./docs/foodDatabase.md)
> - 📱 **9-Screen UI Layout Specification**: [docs/ui-screens-spec.md](./docs/ui-screens-spec.md)
> - 🎨 **Design System & Theme Guidelines**: [docs/design-system.md](./docs/design-system.md)
> - 📋 **Active Development Task Tracker**: [task.md](./task.md)

---

## 1. 🎯 Product Vision

Build a **Nutrition Intelligence & Food Logging Platform** that helps users achieve their health goals through **scientifically optimised nutrition** and **seamless daily food tracking**.

Unlike traditional calorie-counter apps, this platform:
- Enables **effortless food logging** — log foods directly from recommended meal plans slot-by-slot or search custom items
- Optimises for **complete nutrition** — macros + micros + health priorities simultaneously
- Generates **fully personalised meal plans** based on real food users eat
- Presents **meaningful health insights** (Hair Health 82%, Brain Health 69%) instead of raw nutrient numbers
- Acts as the **brain** behind every food recommendation and logged meal

**Phase 1 Scope:** Core Nutrition Engine & Logging System (MVP) — Vegetarian-only. Non-vegetarian support in Phase 2.

---

## 2. 👤 User Authentication & Onboarding

### 2.1 Sign Up Flow

**Step 1 — Account Creation**

| Field | Type | Validation |
|---|---|---|
| Full Name | Text | Required, min 2 chars |
| Email Address | Email | Required, unique |
| Password | Password | Min 8 chars, 1 uppercase, 1 number |
| Confirm Password | Password | Must match |

**Step 2 — Basic Profile (Required)**

| Field | Type | Options / Validation |
|---|---|---|
| Date of Birth | Date | Age must be 8+ |
| Gender | Select | Male / Female |
| Height | Number | cm (e.g., 165 cm) |
| Current Weight | Number | kg (e.g., 65 kg) |
| Activity Level | Select | Sedentary / Light / Moderate / Active / Athlete |
| Are you Pregnant? | Toggle | Yes / No (Female only) |
| Are you Breastfeeding? | Toggle | Yes / No (Female only) |

> **Note:** Age minimum is 8 years. Pregnancy/breastfeeding questions appear only for Female users.

**Step 3 — Your Goal**

User selects **one primary goal**:

| Goal | Icon | Description |
|---|---|---|
| Fat Loss | 🔥 | Lose body fat, create calorie deficit |
| Muscle Build | 💪 | Gain lean muscle, support training |
| Maintain Weight | ⚖️ | Eat at maintenance, feel balanced |
| Athletic Performance | 🏃 | Fuel training and recovery |
| General Wellness | 🌿 | Improve overall health and energy |

**Step 4 — Health Priorities** *(Select up to 5)*

User selects the health outcomes they care about most:

| Priority | Icon | Description |
|---|---|---|
| Brain & Nervous System | 🧠 | Memory, focus, energy, mood |
| Hair Health | 💇 | Stronger hair, less shedding |
| Skin Health | ✨ | Glow, elasticity, healing |
| Bones & Teeth | 🦴 | Density, strength, posture |
| Heart Health | ❤️ | Blood pressure, cholesterol |
| Muscle Health | 💪 | Repair, strength, recovery |
| Immunity | 🛡️ | Fight infections, faster recovery |
| Eye Health | 👀 | Vision, retina protection |
| Blood Health | 🩸 | Haemoglobin, iron levels |
| Thyroid Health | 🦋 | Hormonal balance, metabolism |

> **Minimum:** 1. **Maximum:** 5. Selected priorities determine which micronutrient dashboards are shown.

**Step 5 — Diet Type**

| Option | Description |
|---|---|
| Pure Vegetarian | No eggs, no meat |
| Lacto-Vegetarian | Includes dairy, no eggs |
| Ovo-Vegetarian | Includes eggs, no dairy |
| Vegan | No animal products at all |

> *Note: Phase 1 is vegetarian-only. Non-veg will unlock in Phase 2.*

**Step 6 — Dietary Restrictions / Allergies** *(Optional)*

Checkboxes for common restrictions:
- Gluten-Free
- Lactose Intolerant
- Nut Allergy
- Soy Allergy
- No Onion / No Garlic
- Diabetic-Friendly
- Low FODMAP

---

### 2.2 Login Flow

| Field | Type |
|---|---|
| Email Address | Email |
| Password | Password |

Additional options:
- "Forgot Password?" → Email OTP reset
- "Remember Me" → 30-day session

---

## 3. 🧮 Nutrition Calculation Engine

### 3.1 Step 1 — BMR Calculation (Mifflin-St Jeor)

```
Male:   BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5
Female: BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161
```

### 3.2 Step 2 — TDEE (Total Daily Energy Expenditure)

```
TDEE = BMR × Activity Multiplier
```

| Activity Level | Multiplier |
|---|---|
| Sedentary (desk job, no exercise) | 1.2 |
| Light (1–3 days/week exercise) | 1.375 |
| Moderate (3–5 days/week) | 1.55 |
| Active (6–7 days/week) | 1.725 |
| Athlete (twice/day training) | 1.9 |

### 3.3 Step 3 — Calorie Target by Goal

| Goal | Calorie Adjustment |
|---|---|
| Fat Loss | TDEE − 400 kcal (default) |
| Muscle Build | TDEE + 250 kcal (default) |
| Maintain Weight | TDEE (no change) |
| Athletic Performance | TDEE + 200 kcal |
| General Wellness | TDEE (no change) |

### 3.4 Step 4 — Macronutrient Targets

**Protein (Priority 1):**

| Profile | Protein g/kg body weight |
|---|---|
| Sedentary | 0.8 g/kg |
| Normal Active | 1.0 g/kg |
| Fat Loss | 1.35 g/kg (midpoint 1.2–1.5) |
| Muscle Build | 1.8 g/kg (midpoint 1.6–2.0) |
| Athletic Performance | 1.8 g/kg |
| Older Adults (65+) | 1.1 g/kg |

```
Protein_Calories = Protein_grams × 4
```

**Fat (Priority 2 — goal-adjusted):**

| Goal | Fat % of Total Calories |
|---|---|
| Fat Loss | 20% |
| Maintenance / General Wellness | 27.5% |
| Muscle Build | 30% |
| Athletic Performance | 28% |

```
Fat_Calories = Total_Calories × Fat%
Fat_grams    = Fat_Calories ÷ 9
```

**Carbohydrates (Priority 3 — remainder):**

```
Carb_Calories = Total_Calories − Protein_Calories − Fat_Calories
Carb_grams    = Carb_Calories ÷ 4
```

**Fiber:**
```
Fiber_grams = (Total_Calories ÷ 1000) × 14
```
*Standard: 14g per 1,000 kcal — Academy of Nutrition and Dietetics*

**Water Intake:**
```
Water_ml = Weight_kg × 35
+ 500 ml if Active or Athlete
+ 300 ml if Moderate
```

---

### 3.5 Step 5 — Personalised Micronutrient RDA Table

RDAs are looked up by Age + Gender + Pregnancy/Breastfeeding status.

> 📄 **Reference Table:** For complete nutrient values broken down by age, gender, pregnancy, and breastfeeding status, see [docs/rda-reference.md](./docs/rda-reference.md).

---

## 4. 📊 Micronutrient Tracking — Dual Display System

### 4.1 Storage vs. Display

Food database stores `micros` as **% of standard reference Daily Value (DV)** per serving.
The engine converts to absolute amounts using:

```
Consumed_absolute = (food.micros.nutrient_dv% / 100) × Reference_DV_value
```

**Reference DV values (for conversion):**

| Nutrient | Reference DV | Unit |
|---|---|---|
| Vitamin A | 900 | µg |
| Vitamin C | 90 | mg |
| Vitamin D | 20 | µg |
| Vitamin E | 15 | mg |
| Vitamin B12 | 2.4 | µg |
| Calcium | 1300 | mg |
| Iron | 18 | mg |
| Zinc | 11 | mg |
| Magnesium | 420 | mg |
| Potassium | 4700 | mg |
| Folate | 400 | µg |
| Omega-3 | stored as absolute g | g |

Then calculate personalised completion:
```
Completion% = (Consumed_absolute / User_Personalised_RDA) × 100
Capped at 100% per nutrient for score calculation.
```

### 4.2 Dashboard Display (Both Values Shown)

```
Vitamin C
Daily Target:  75 mg        (personalised — 24F)
Consumed:      52 mg  (69%)
Remaining:     23 mg
Progress Bar:  ████████░░  69%
```

---

## 5. 🏥 Health System Scoring

> 💡 **Essential Nutrients Reference Guide:** Complete nutrient functions, deficiency symptoms, daily food source checklists, and health impact guides are documented in [docs/essential-nutrients-guide.md](./docs/essential-nutrients-guide.md).

### 5.1 Nutrient-to-Health System Mapping

| Health System | Nutrient | Priority | Weight |
|---|---|---|---|
| 🧠 Brain Health | Vitamin B12 | ⭐⭐⭐ | 3 |
| | Magnesium | ⭐⭐⭐ | 3 |
| | Vitamin B1 | ⭐⭐ | 2 |
| | Vitamin B6 | ⭐⭐ | 2 |
| | Folate (B9) | ⭐⭐ | 2 |
| 💇 Hair Health | Protein | ⭐⭐⭐ | 3 |
| | Iron | ⭐⭐⭐ | 3 |
| | Zinc | ⭐⭐⭐ | 3 |
| | Vitamin D | ⭐⭐⭐ | 3 |
| | Biotin (B7) | ⭐⭐ | 2 |
| | Omega-3 | ⭐⭐ | 2 |
| | Vitamin C | ⭐⭐ | 2 |
| ✨ Skin Health | Vitamin C | ⭐⭐⭐ | 3 |
| | Vitamin A | ⭐⭐⭐ | 3 |
| | Vitamin E | ⭐⭐ | 2 |
| | Zinc | ⭐⭐ | 2 |
| | Omega-3 | ⭐⭐ | 2 |
| 🦴 Bone Health | Calcium | ⭐⭐⭐ | 3 |
| | Vitamin D | ⭐⭐⭐ | 3 |
| | Magnesium | ⭐⭐ | 2 |
| | Vitamin K | ⭐⭐ | 2 |
| | Phosphorus | ⭐⭐ | 2 |
| ❤️ Heart Health | Potassium | ⭐⭐⭐ | 3 |
| | Magnesium | ⭐⭐⭐ | 3 |
| | Omega-3 | ⭐⭐⭐ | 3 |
| | Fiber | ⭐⭐⭐ | 3 |
| 💪 Muscle Health | Protein | ⭐⭐⭐ | 3 |
| | Magnesium | ⭐⭐⭐ | 3 |
| | Potassium | ⭐⭐⭐ | 3 |
| | Calcium | ⭐⭐ | 2 |
| 🛡️ Immunity | Vitamin C | ⭐⭐⭐ | 3 |
| | Vitamin D | ⭐⭐⭐ | 3 |
| | Zinc | ⭐⭐⭐ | 3 |
| | Vitamin A | ⭐⭐ | 2 |
| 👀 Eye Health | Vitamin A | ⭐⭐⭐ | 3 |
| | Lutein | ⭐⭐ | 2 |
| | Zeaxanthin | ⭐⭐ | 2 |
| 🩸 Blood Health | Iron | ⭐⭐⭐ | 3 |
| | Vitamin B12 | ⭐⭐⭐ | 3 |
| | Folate | ⭐⭐⭐ | 3 |
| | Vitamin C | ⭐⭐ | 2 |
| 🦋 Thyroid Health | Iodine | ⭐⭐⭐ | 3 |
| | Selenium | ⭐⭐ | 2 |

### 5.2 Weighted Health Score Formula

Based on the WHO/FAO Mean Adequacy Ratio (MAR) methodology — a standardised approach to nutrient adequacy scoring used in nutrition science:

```
Health_Score = SUM(min(completion_i, 100) × weight_i) / SUM(weight_i)
```

Where:
- `completion_i` = (Consumed_absolute / User_RDA) × 100, **capped at 100%**
- `weight_i` = 3 for ⭐⭐⭐ nutrients, 2 for ⭐⭐ nutrients

**Example — Brain Health Score calculation:**

| Nutrient | Weight | Completion | Contribution |
|---|---|---|---|
| B12 | 3 | 80% | 240 |
| Magnesium | 3 | 60% | 180 |
| B1 | 2 | 90% | 180 |
| B6 | 2 | 70% | 140 |
| Folate | 2 | 50% | 100 |
| **Total** | **12** | | **840** |

**Brain Health Score = 840 ÷ 12 = 70%**

### 5.3 Overall Nutrition Score

```
Overall_Score = Average of all selected Health System Scores
```

### 5.4 Top 14 Core Essential Nutrients
The engine prioritizes tracking, recommendations, and deficit alerts for 14 core high-impact nutrients:
1. ⭐⭐⭐ **Protein**
2. ⭐⭐⭐ **Fiber**
3. ⭐⭐⭐ **Vitamin D**
4. ⭐⭐⭐ **Vitamin B12**
5. ⭐⭐⭐ **Iron**
6. ⭐⭐⭐ **Calcium**
7. ⭐⭐⭐ **Magnesium**
8. ⭐⭐⭐ **Potassium**
9. ⭐⭐⭐ **Zinc**
10. ⭐⭐⭐ **Vitamin C**
11. ⭐⭐⭐ **Vitamin A**
12. ⭐⭐⭐ **Folate (B9)**
13. ⭐⭐⭐ **Iodine**
14. ⭐⭐⭐ **Omega-3**

---

## 6. 📱 Dashboard & Screen Layouts

> 📱 **Full Visual & Screen Specification:** Detailed section-by-section breakdown, component hierarchy, visual layout, and interactive states for all 9 app screens are documented in [docs/ui-screens-spec.md](./docs/ui-screens-spec.md).

### 6.1 Daily Macro Dashboard (`/`)
- **Header**: Greeting (`"Good Morning Gaurav 👋"`), Hamburger menu, Notification bell with badge.
- **Hero Nutrition Score Card**: Dark Emerald Green card with large numeric score (`92 Excellent`), animated SVG radial gauge, and trend (`↑ 12% vs yesterday`).
- **Today's Progress (2x3 Grid)**: Calories, Protein, Carbs, Fat, Fiber, Water cards with absolute numbers, targets, percentages, and progress bars.
- **Health System Scores Row**: Horizontal badges for Brain, Immunity, Heart, Bones, Muscle scores.

### 6.2 Health Status Screen (`/health`)
- Dedicated status page with category filter tabs (`All`, `Needs Attention`, `Strong`).
- 10 progress rows for health priorities (Brain, Immunity, Heart, Bones, Muscle, Skin, Hair, Eye, Blood, Thyroid) with color-coded bars.
- Overall Health Score card with animated circular gauge.

---

## 7. 🥗 Intelligent Meal Generation Engine

### 7.1 Food Database Summary

Source: `foodDatabase.md` / `foodDatabase.ts`
Total: 52 vegetarian superfood items

| Category | Count |
|---|---|
| proteins_dairy | 9 |
| grains_legumes | 14 |
| seeds_nuts | 10 |
| vegetables | 10 |
| fruits | 9 |

### 7.2 FoodItem TypeScript Interface

```typescript
interface FoodItem {
  id: string;
  name: string;
  category: 'proteins_dairy' | 'grains_legumes' | 'seeds_nuts' | 'vegetables' | 'fruits';
  servingSize: string;
  servingUnit: string;
  baseQty: number;
  macros: {
    calories: number;   // kcal
    protein: number;    // g
    carbs: number;      // g
    fat: number;        // g
    fiber: number;      // g
  };
  micros: {
    vitA: number;       // % DV
    vitC: number;       // % DV
    vitD: number;       // % DV
    vitE: number;       // % DV
    vitB12: number;     // % DV
    calcium: number;    // % DV
    iron: number;       // % DV
    zinc: number;       // % DV
    magnesium: number;  // % DV
    potassium: number;  // % DV
    folate: number;     // % DV
    omega3: number;     // g (absolute)
  };
}
```

### 7.3 Meal Generation Filters

| Filter | Options |
|---|---|
| Meal Schedule | Breakfast / Lunch / Dinner / Snacks |
| Meals Per Day | 2 / 3 / 4 / 5 |
| Allowed Ingredients | Multi-select from database |
| Excluded Ingredients | Multi-select |
| Cuisine | Indian / Continental / Mixed |
| Cooking Time | Quick <15 min / Medium 15-30 min / Any |
| Budget | Low / Medium / High |
| Portion Size | Small / Standard / Large |

### 7.4 Meal Generation Algorithm (Rule-Based)

```
1. Load user daily targets (macros + micros)
2. Subtract already-consumed nutrients → get remaining targets
3. Filter food DB by user restrictions/preferences
4. For each meal slot (Breakfast/Lunch/Dinner/Snack):
   a. Rank foods by contribution to highest-deficit nutrients
   b. Priority: Protein → Fiber → Health-Priority Micros
   c. Assign serving sizes to hit meal-level calorie target
5. Validate full day plan:
   a. Total calories within ±50 kcal of target
   b. Protein within ±5g of target
   c. No nutrient exceeds 150% RDA (safety cap)
6. If not satisfied → trigger smart adjustments (see 7.5)
```

### 7.5 Smart Adjustment Recommendations

1. **Increase quantity** — "Add 50g more lentils to hit your iron target"
2. **Add complementary food** — "Add pumpkin seeds for +37% Magnesium"
3. **Swap ingredient** — "Swap apple for papaya for more Vitamin C"
4. **Nutrient-dense alternative** — "Replace white potato with sweet potato for +150% Vitamin A"

### 7.6 Custom Recommendation Actions & Deficit Audits

#### 1. Custom Diet/Meal Plans (MongoDB Stored Plans)
The database stores up to 3 custom diet/meal plans per user in a separate collection (`MealPlan`). Users can switch between these 3 stored plans on the UI and toggle one as the "Active Meal Plan". The interface will display the active plan's configurations and suggest: "You can create up to 3 meal plans and switch here."

#### 2. Log Slot from Active Plan
Instead of logging the entire day's meals at once, logging is done slot-by-slot from the active plan. Clicking a slot-level log button (e.g., "Log Breakfast Option") copies only the recommended items for that specific slot into the user's daily consumed log (`DailyLog`) in the DB.

#### 3. Recommendation Deficit Audit & Gaps Suggestion
The engine calculates the total macros and micros of any generated or active diet plan against the user's RDA targets. If any priority nutrient falls below 95%:
- It lists the nutrient as "Deficient in Plan".
- It suggests a specific dense food from the database to cover the shortage (e.g., "Shortfall of Vitamin C (91% of target). Suggestion: Log 150g Papaya (+100% DV)").

#### 4. Customization Filters & Inline Sizing
Users can dynamically customize the recommendations:
- The daily target limits remain locked to the calculated profile targets (loaded from user settings).
- Portion sizes can be customized inline for each suggested item (using increment/decrement buttons). This dynamically updates that meal slot's calorie and protein totals before logging.
- Exclude or allow specific ingredients grouped neatly by category (Proteins & Dairy, Grains & Legumes, Seeds & Nuts, Vegetables, Fruits), adjusting recommendations in real-time.

---

## 8. 🌐 App Screens & Navigation

> 📱 **Full UI Layout Spec:** See [docs/ui-screens-spec.md](./docs/ui-screens-spec.md) for full visual layouts & section details.

### Bottom Navigation Bar (5 Floating Glass Tabs)

| Tab | Screen / Path | Key Role |
|---|---|---|
| 🏠 Home | Main Dashboard (`/`) | Health command center, score ring, 2x3 progress grid |
| 🥗 Meals | Today's Meals (`/meals`) | Slot timeline, active meal card, AI advice |
| ➕ Action (Center) | Add Meal / Food Logger (`/log-food`) | Quick food search & slot-by-slot logging |
| 📈 Progress | Health Systems (`/health`) & Insights (`/insights`) | Health score bars, trend graphs, micro details |
| 👤 Profile | Profile & Settings (`/profile`) | User profile card, membership, AI feature navigation |

### 9 Core Screens Summary

| Screen | Route / View | Key Features & Layout |
|---|---|---|
| **1. Main Dashboard** | `/` | Nutrition Score 92 ring, 2x3 progress grid, health system chips |
| **2. Today's Meals** | `/meals` | Meal schedule tabs, active meal card with macros, vertical timeline |
| **3. Health Systems** | `/health` | 10 priority bars (Brain, Hair, Skin, etc.), filter tabs (All/Attention/Strong) |
| **4. Nutrition Targets** | `/targets` | Macro radial donut chart (2,200 kcal), fiber & water recommendation cards |
| **5. Micronutrient Detail** | `/micronutrients` | Vitamin & mineral progress bars with target fractions (`850 / 900 µg`) |
| **6. Generated Meal Plan** | `/meal-plan` | Plan banner summary, food thumbnail carousel, slot cards, Generate CTA |
| **7. Add Meal / Logger** | `/log-food` | Food search bar, category chips (`All`/`My Foods`/`Recipes`/`Scan`), quick add list |
| **8. Insights & Trends** | `/insights` | Timeframe toggle (`Today`/`Weekly`/`Monthly`), weekly trend bar chart, top foods |
| **9. Profile & Settings** | `/profile` | User avatar card (`Gaurav Malik`), Gold membership badge, AI feature list |

---

## 9. 🎨 Design System

> 🎨 **Design System Specification:** Complete design principles, visual language, theme tokens, motion guidelines, component structure, and typography rules are documented in [docs/design-system.md](./docs/design-system.md).

### Design Summary
- **Visual Style:** Enterprise Minimalist / Premium Health OS (inspired by Apple Health, WHOOP, Linear, Oura)
- **Theme:** Dark Mode (default background `#0B0F14`), Light Mode, System Mode
- **Layout:** Mobile-First (min width 375px) responsive layout
- **Typography:** Inter Bold (headings), Inter Regular (body), Tabular figures for numbers
- **Palette:** Emerald Green (Primary), Electric Blue (Secondary), Slate Gray (Neutral), Amber (Warning), Red (Error)

---

## 10. 📐 Technical Architecture

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite (TypeScript) |
| Backend | Node.js + Express (TypeScript) |
| Database | MongoDB (via Mongoose) |
| Styling | Vanilla CSS + CSS custom properties |
| Fonts | Google Fonts (Inter) |
| State | React Context API + useReducer |
| Persistence | MongoDB (user profile + daily logs) |
| Data | API-driven from Backend Express Server |
| Charts | Custom CSS animations + SVG rings |

### Key TypeScript Files

| File | Purpose |
|---|---|
| src/data/foodDatabase.ts | 52-item food array |
| src/data/rdaTable.ts | RDA lookup by age + gender |
| src/data/healthSystems.ts | Nutrient-to-system mapping + weights |
| src/engine/calculateTargets.ts | BMR, TDEE, macro targets |
| src/engine/nutrientCalculator.ts | %DV → absolute conversion + completion% |
| src/engine/healthScoreCalculator.ts | Weighted health system scores |
| src/engine/mealGenerator.ts | Rule-based meal plan generation |
| src/context/UserContext.tsx | Global user profile state |
| src/context/NutritionContext.tsx | Daily log + computed targets |

### Data Flow

```
User Profile (Onboarding)
         │
         ▼
Nutrition Engine (calculateTargets.ts)
   ├── BMR → TDEE → Calorie Target
   ├── Protein / Fat / Carbs / Fiber / Water
   └── RDA lookup (age + gender + pregnancy)
         │
         ▼
Daily Targets → Context
         │
         ▼
Food Logger → consumed foods
         │
         ▼
nutrientCalculator.ts
   ├── Sum macros
   ├── %DV → absolute using ref DV table
   ├── Completion% = consumed / RDA × 100
   └── Cap at 100% per nutrient
         │
         ▼
healthScoreCalculator.ts
   ├── Weighted mean per health system
   └── Overall score = avg of selected systems
         │
         ▼
Dashboard (live updates)
```

---

## 11. 🚀 Phase 2 Roadmap

| Feature | Description |
|---|---|
| Non-Vegetarian Foods | Eggs, chicken, fish added to DB |
| AI Nutrition Coach | Chat assistant for meal & diet advice |
| AI Workout Planner | Personalised workout programs |
| Personal Coaching | Access to certified nutritionists |
| Barcode Scanner | Log packaged foods |
| Photo Food Recognition | AI identifies food from camera |
| Smart Grocery List | Auto-generate from meal plan |
| Wearable Integration | Apple Health, Google Fit, Fitbit |
| Blood Test Analysis | Upload reports, get custom micro targets |
| Family Profiles | Manage nutrition for entire family |
| Disease-Specific Plans | Diabetes, PCOS, Thyroid protocols |

---

## 12. ✅ Phase 1 Development Checklist

> 📋 **Task Tracker:** Active development progress and execution checklist are tracked in [task.md](./task.md).

---

*PRD Version 1.0 — Nutrition Intelligence Platform Phase 1 MVP*  
*Calculations based on U.S. National Academies Dietary Reference Intakes (DRIs) and Academy of Nutrition and Dietetics guidelines.*
