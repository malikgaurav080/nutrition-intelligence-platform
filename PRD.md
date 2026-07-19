# 📄 Product Requirements Document (PRD)
# Nutrition Intelligence Platform — Phase 1 MVP

**Version:** 1.0  
**Date:** July 2026  
**Status:** Approved for Development  
**Platform:** Mobile-First Web Application (Progressive Web App)

---

## 1. 🎯 Product Vision

Build a **Nutrition Intelligence Platform** that helps users achieve their health goals through **scientifically optimised nutrition**, not generic diet plans.

Unlike traditional calorie-counter apps, this platform:
- Optimises for **complete nutrition** — macros + micros + health priorities simultaneously
- Generates **fully personalised meal plans** based on real food users eat
- Presents **meaningful health insights** (Hair Health 82%, Brain Health 69%) instead of raw nutrient numbers
- Acts as the **brain** behind every food recommendation

**Phase 1 Scope:** Core Nutrition Engine (MVP) — Vegetarian-only. Non-vegetarian support in Phase 2.

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

| Nutrient | Unit | Age | Male | Female | Pregnant | Breastfeeding |
|---|---|---|---|---|---|---|
| Vitamin A | µg | 1–3 | 300 | 300 | — | — |
| | | 4–8 | 400 | 400 | — | — |
| | | 9–13 | 600 | 600 | — | — |
| | | 14–18 | 900 | 700 | 750 | 1200 |
| | | 19+ | 900 | 700 | 770 | 1300 |
| Vitamin C | mg | 1–3 | 15 | 15 | — | — |
| | | 4–8 | 25 | 25 | — | — |
| | | 9–13 | 45 | 45 | — | — |
| | | 14–18 | 75 | 65 | 80 | 115 |
| | | 19+ | 90 | 75 | 85 | 120 |
| Vitamin D | µg | 1–70 | 15 | 15 | 15 | 15 |
| | | 71+ | 20 | 20 | — | — |
| Vitamin E | mg | 1–3 | 6 | 6 | — | — |
| | | 4–8 | 7 | 7 | — | — |
| | | 9–13 | 11 | 11 | — | — |
| | | 14+ | 15 | 15 | 15 | 19 |
| Vitamin K | µg | 1–3 | 30 | 30 | — | — |
| | | 4–8 | 55 | 55 | — | — |
| | | 9–13 | 60 | 60 | — | — |
| | | 14–18 | 75 | 75 | 75 | 75 |
| | | 19+ | 120 | 90 | 90 | 90 |
| Vitamin B1 | mg | 1–3 | 0.5 | 0.5 | — | — |
| | | 4–8 | 0.6 | 0.6 | — | — |
| | | 9–13 | 0.9 | 0.9 | — | — |
| | | 14–18 | 1.2 | 1.0 | 1.4 | 1.4 |
| | | 19+ | 1.2 | 1.1 | 1.4 | 1.4 |
| Vitamin B2 | mg | 1–3 | 0.5 | 0.5 | — | — |
| | | 4–8 | 0.6 | 0.6 | — | — |
| | | 9–13 | 0.9 | 0.9 | — | — |
| | | 14–18 | 1.3 | 1.0 | 1.4 | 1.6 |
| | | 19+ | 1.3 | 1.1 | 1.4 | 1.6 |
| Vitamin B3 | mg | 1–3 | 6 | 6 | — | — |
| | | 4–8 | 8 | 8 | — | — |
| | | 9–13 | 12 | 12 | — | — |
| | | 14–18 | 16 | 14 | 18 | 17 |
| | | 19+ | 16 | 14 | 18 | 17 |
| Vitamin B5 | mg | 1–3 | 2 | 2 | — | — |
| | | 4–8 | 3 | 3 | — | — |
| | | 9–13 | 4 | 4 | — | — |
| | | 14+ | 5 | 5 | 6 | 7 |
| Vitamin B6 | mg | 1–3 | 0.5 | 0.5 | — | — |
| | | 4–8 | 0.6 | 0.6 | — | — |
| | | 9–13 | 1.0 | 1.0 | — | — |
| | | 14–18 | 1.3 | 1.2 | 1.9 | 2.0 |
| | | 19–50 | 1.3 | 1.3 | 1.9 | 2.0 |
| | | 51+ | 1.7 | 1.5 | — | — |
| Biotin (B7) | µg | 1–3 | 8 | 8 | — | — |
| | | 4–8 | 12 | 12 | — | — |
| | | 9–13 | 20 | 20 | — | — |
| | | 14–18 | 25 | 25 | 30 | 35 |
| | | 19+ | 30 | 30 | 30 | 35 |
| Folate (B9) | µg | 1–3 | 150 | 150 | — | — |
| | | 4–8 | 200 | 200 | — | — |
| | | 9–13 | 300 | 300 | — | — |
| | | 14+ | 400 | 400 | 600 | 500 |
| Vitamin B12 | µg | 1–3 | 0.9 | 0.9 | — | — |
| | | 4–8 | 1.2 | 1.2 | — | — |
| | | 9–13 | 1.8 | 1.8 | — | — |
| | | 14+ | 2.4 | 2.4 | 2.6 | 2.8 |
| Calcium | mg | 1–3 | 700 | 700 | — | — |
| | | 4–8 | 1000 | 1000 | — | — |
| | | 9–18 | 1300 | 1300 | 1300 | 1300 |
| | | 19–50 | 1000 | 1000 | 1000 | 1000 |
| | | 51–70 | 1000 | 1200 | — | — |
| | | 71+ | 1200 | 1200 | — | — |
| Iron | mg | 1–3 | 7 | 7 | — | — |
| | | 4–8 | 10 | 10 | — | — |
| | | 9–13 | 8 | 8 | — | — |
| | | 14–18 | 11 | 15 | 27 | 10 |
| | | 19–50 | 8 | 18 | 27 | 9 |
| | | 51+ | 8 | 8 | — | — |
| Magnesium | mg | 1–3 | 80 | 80 | — | — |
| | | 4–8 | 130 | 130 | — | — |
| | | 9–13 | 240 | 240 | — | — |
| | | 14–18 | 410 | 360 | 400 | 360 |
| | | 19–30 | 400 | 310 | 350 | 310 |
| | | 31+ | 420 | 320 | 360 | 320 |
| Potassium | mg | 1–3 | 2000 | 2000 | — | — |
| | | 4–8 | 2300 | 2300 | — | — |
| | | 9–13 | 2500 | 2300 | — | — |
| | | 14+ | 3400 | 2600 | 2900 | 2800 |
| Zinc | mg | 1–3 | 3 | 3 | — | — |
| | | 4–8 | 5 | 5 | — | — |
| | | 9–13 | 8 | 8 | — | — |
| | | 14–18 | 11 | 9 | 12 | 13 |
| | | 19+ | 11 | 8 | 11 | 12 |
| Phosphorus | mg | 1–3 | 460 | 460 | — | — |
| | | 4–8 | 500 | 500 | — | — |
| | | 9–18 | 1250 | 1250 | 1250 | 1250 |
| | | 19+ | 700 | 700 | 700 | 700 |
| Selenium | µg | 1–3 | 20 | 20 | — | — |
| | | 4–8 | 30 | 30 | — | — |
| | | 9–13 | 40 | 40 | — | — |
| | | 14+ | 55 | 55 | 60 | 70 |
| Iodine | µg | 1–3 | 90 | 90 | — | — |
| | | 4–8 | 90 | 90 | — | — |
| | | 9–13 | 120 | 120 | — | — |
| | | 14+ | 150 | 150 | 220 | 290 |
| Omega-3 | g | 1–3 | 0.7 | 0.7 | — | — |
| | | 4–8 | 0.9 | 0.9 | — | — |
| | | 9–13 | 1.2 | 1.0 | — | — |
| | | 14–18 | 1.6 | 1.1 | 1.4 | 1.3 |
| | | 19+ | 1.6 | 1.1 | 1.4 | 1.3 |

*Source: U.S. National Academies of Sciences — Dietary Reference Intakes (DRIs)*

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

---

## 6. 📱 Dashboard Screens

### 6.1 Daily Macro Dashboard

| Widget | Data Points |
|---|---|
| Calorie Ring | Target kcal / Consumed kcal / Remaining kcal |
| Protein Bar | Target g / Consumed g / Remaining g / % |
| Carbohydrates Bar | Target g / Consumed g / Remaining g / % |
| Fat Bar | Target g / Consumed g / Remaining g / % |
| Fiber Bar | Target g / Consumed g / Remaining g / % |
| Water Tracker | Target ml / Logged ml / Glass count |

### 6.2 Micronutrient Dashboard (per selected health priority)

| Widget | Data Points |
|---|---|
| Nutrient Row | Name / Daily Target (absolute) / Consumed (absolute + %) / Remaining / Progress bar |
| Priority Badge | ⭐⭐⭐ or ⭐⭐ |
| Health Score Card | e.g. "💇 Hair Health — 65%" with animated ring |

### 6.3 Health System Overview

- Animated ring cards per selected priority
- Overall Nutrition Score prominently shown
- Tap → detailed nutrient breakdown
- Color: Green ≥80%, Indigo 60–79%, Amber 40–59%, Red <40%

---

## 7. 🥗 Intelligent Meal Generation Engine

### 7.1 Food Database Summary

Source: `foodDatabase.md` / `foodDatabase.ts`
Total: 44 vegetarian food items

| Category | Count |
|---|---|
| proteins_dairy | 9 |
| grains_legumes | 11 |
| seeds_nuts | 9 |
| vegetables | 10 |
| fruits | 7 |

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

---

## 8. 🌐 App Screens & Navigation

### Bottom Navigation Tabs

| Tab | Screen |
|---|---|
| 🏠 Home | Daily Dashboard |
| 🥗 Meals | Meal Planner & Food Logger |
| 📊 Insights | Micronutrient & Health Scores |
| 👤 Profile | Settings & Profile |

### Screen List

| Screen | Key Features |
|---|---|
| Splash / Landing | App intro, Sign Up / Log In CTA |
| Sign Up (6 steps) | Account → Profile → Goal → Priorities → Diet → Restrictions |
| Log In | Email + password |
| Dashboard | Calorie ring, macro bars, health score cards, water tracker |
| Meal Planner | Today's meals, Add Food, Generate button |
| Food Logger | Search food, serving selector, log to slot |
| Nutrient Insights | Per-priority cards with absolute + %DV |
| Health Scores | Animated rings per priority + overall score |
| Profile & Settings | Edit profile, change goals and priorities |

---

## 9. 🎨 Design System

### Design Philosophy
The application is a **Nutrition Intelligence Platform**, not a food logging app. Every screen should help users understand where they currently stand, what they should do next, and why that recommendation matters. The interface should prioritize clarity, personalization, scientific credibility, and actionable insights over excessive visual effects. The application should feel closer to Apple Health, WHOOP, Oura, Levels, Linear, and Stripe Dashboard rather than a traditional calorie tracker.

### Overall Design Principles

#### Mobile First
- Design mobile-first with a minimum width of **375px**.
- Support responsive layouts for 375px, 390px, 414px, and 430px.
- Desktop should feel like an optimized extension of the mobile experience rather than a separate design.

#### Premium Visual Language
- The UI should look modern, elegant, and trustworthy.
- Avoid a "startup template" appearance.
- Focus on large whitespace, clear visual hierarchy, soft rounded corners, premium typography, elegant shadows, subtle gradients, minimal borders, and clean card layouts.
- The design should communicate confidence and simplicity.

#### Theme System
- Support Dark Theme (Default), Light Theme, and System Theme.
- Dark mode should feel luxurious with deep neutral backgrounds rather than pure black.
- Example palette:
  - Background: `#0B0F14`
  - Surface: `#141A22`
  - Card: `#1A222D`
  - Divider: `rgba(255,255,255,0.06)`
- Use glass effects sparingly only where they improve focus. Avoid making every card glassmorphic.

#### Glassmorphism Guidelines
- Use frosted glass only for: floating navigation, bottom sheets, modal dialogs, floating action buttons, quick actions.
- Avoid glass backgrounds for every card because readability is more important than visual effects.

#### Dashboard First Design
- The home screen should function as a personalized health command center.
- The first screen should immediately answer:
  - How healthy am I today?
  - What is left to complete?
  - What should I eat next?
  - Which nutrients require attention?
  - How close am I to today's goals?
- Prioritize meaningful insights instead of displaying large amounts of raw data.

#### Information Hierarchy
Every screen should follow this hierarchy:
1. Overall Nutrition Score
2. Today's Progress
3. Health System Scores
4. Remaining Nutrition Targets
5. Recommended Next Meal
6. Daily Meal Timeline
7. Insights & Suggestions
Users should understand their health status within 5 seconds of opening the app.

#### Dashboard Components
- Design premium cards for: Overall Nutrition Score, Daily Calories, Protein Progress, Carbohydrate Progress, Fat Progress, Fiber Progress, Water Intake, Health System Scores, Meal Timeline, Recommended Meal, Deficiency Alerts, Nutrition Insights.
- Use circular progress indicators, animated rings, and clean progress bars instead of tables.

#### Data Visualization
- The application is data-heavy. Prioritize beautiful visualizations: circular progress rings, radial health gauges, animated progress bars, weekly trend charts, nutrition completion graphs, meal timelines, achievement indicators.
- Avoid overwhelming the user with spreadsheets or dense tables.

#### Motion Design
- Animations should communicate state changes rather than exist for decoration.
- Examples: Dashboard cards fade and slide in sequentially, progress rings animate from 0% to the current value, progress bars fill smoothly, meal logging updates numbers in real time, health scores animate after calculations, recommendation cards transition elegantly.
- Animation duration: 150–300ms with smooth easing throughout.
- Avoid flashy or distracting animations.

#### Typography
- Headings: Inter Bold
- Body: Inter Regular
- Numbers: Tabular figures for consistency
- Maintain a clear visual hierarchy through font weight and spacing instead of excessive font sizes.

#### Color System
- Use a restrained color palette.
  - Primary: Emerald Green
  - Secondary: Electric Blue
  - Warning: Amber
  - Error: Red
  - Success: Green
  - Neutral: Slate Gray
- Never rely solely on color to communicate status. Always combine icons, labels, and percentages.

#### Card Design
- Cards should have: large padding, soft shadows, rounded corners (16–20px), minimal borders, consistent spacing.
- Cards should feel lightweight and premium.

#### Navigation
- Use a clean bottom navigation with five tabs: Home, Meals, Dashboard, Progress, Profile.
- Floating action button: Log Meal.
- The navigation should always remain accessible.

#### User Experience
- Every screen should answer one question: "What is the next best action the user should take?"
- Examples:
  - Instead of "Iron: 58%", Display: "Iron is below today's target. Adding 20g Pumpkin Seeds will increase completion to 86%."
  - Instead of "Protein: 102g", Display: "Only 28g protein remaining. Recommended: Greek Yogurt + Tofu Bowl."

#### Accessibility
- Support: high contrast, dynamic text scaling, screen readers, large touch targets, color-blind friendly charts.
- Never rely only on color.

#### Empty States
- Every empty state should guide the user.
- Example: "No meals logged. Start with breakfast to begin tracking today's nutrition."
- Avoid blank screens.

#### Premium Feel
- The application should feel: Intelligent, Calm, Scientific, Premium, Personalized, Trustworthy, Modern, Minimal.
- Avoid clutter, unnecessary icons, excessive gradients, or overly decorative elements.
- Every element should have a clear purpose.

#### Final Design Goal
- Do not design this application like a calorie tracker.
- Design it as a **Nutrition Intelligence Operating System** that helps users make better nutritional decisions through personalized insights, scientific optimization, and an elegant premium experience.
- Every screen should make users feel that the platform understands their health and proactively guides them toward achieving their goals.

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
| src/data/foodDatabase.ts | 44-item food array |
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

### Foundation
- [ ] Project setup (Vite + React + TypeScript)
- [ ] Design system (CSS tokens, typography, colors)
- [ ] Routing setup (React Router v6)

### Authentication
- [ ] Sign Up Step 1 — Account creation
- [ ] Sign Up Step 2 — Basic profile
- [ ] Sign Up Step 3 — Goal selection
- [ ] Sign Up Step 4 — Health priorities (max 5)
- [ ] Sign Up Step 5 — Diet type
- [ ] Sign Up Step 6 — Dietary restrictions
- [ ] Log In screen
- [ ] Session persistence (JWT/Cookie + MongoDB session)

### Nutrition Engine
- [ ] BMR + TDEE calculator
- [ ] Macro target calculator
- [ ] RDA lookup table
- [ ] %DV → absolute micro converter
- [ ] Completion% calculator (capped at 100%)
- [ ] Weighted health score calculator
- [ ] Overall nutrition score

### Dashboards
- [ ] Macro dashboard (calorie ring + bars)
- [ ] Water tracker
- [ ] Health system score cards
- [ ] Micronutrient detail view per health system
- [ ] Overall nutrition score

### Meal Features
- [ ] Food logger (search + serving size)
- [ ] Daily meal log (4 slots)
- [ ] Rule-based meal generator
- [ ] Smart adjustment recommendations

### UX Polish
- [ ] Splash / loading screen
- [ ] Animated progress rings and bars
- [ ] Responsive mobile-first layout
- [ ] Empty states + onboarding nudges
- [ ] Color-coded health score indicators

---

*PRD Version 1.0 — Nutrition Intelligence Platform Phase 1 MVP*  
*Calculations based on U.S. National Academies Dietary Reference Intakes (DRIs) and Academy of Nutrition and Dietetics guidelines.*
