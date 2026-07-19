// ============================================================
// Nutrition Calculation Engine — calculateTargets
// PRD Reference: Section 3.1 → 3.4
// ============================================================

import type { UserProfile, NutritionTargets, ActivityLevel, PrimaryGoal } from '../types/nutrition.types';

// --- PRD 3.2: Activity Multipliers ---
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  Sedentary: 1.2,
  Light: 1.375,
  Moderate: 1.55,
  Active: 1.725,
  Athlete: 1.9,
};

// --- PRD 3.3: Calorie adjustment by goal ---
const CALORIE_ADJUSTMENTS: Record<PrimaryGoal, number> = {
  'Fat Loss': -400,
  'Muscle Build': +250,
  'Maintain Weight': 0,
  'Athletic Performance': +200,
  'General Wellness': 0,
};

// --- PRD 3.4: Fat % of total calories by goal ---
const FAT_PERCENTAGE: Record<PrimaryGoal, number> = {
  'Fat Loss': 0.20,
  'Muscle Build': 0.30,
  'Maintain Weight': 0.275,
  'Athletic Performance': 0.28,
  'General Wellness': 0.275,
};

/**
 * Returns protein g/kg based on goal and age.
 * PRD Section 3.4 — Protein Priority 1.
 */
function getProteinPerKg(goal: PrimaryGoal, age: number): number {
  if (age >= 65) return 1.1; // Older Adults override
  switch (goal) {
    case 'Fat Loss': return 1.35;
    case 'Muscle Build': return 1.8;
    case 'Athletic Performance': return 1.8;
    case 'Maintain Weight': return 1.0;
    case 'General Wellness': return 1.0;
    default: return 1.0;
  }
}

/**
 * Calculates all daily nutrition targets for a given user profile.
 * Implements PRD Sections 3.1 through 3.4.
 */
export function calculateTargets(profile: UserProfile): NutritionTargets {
  const { gender, weight, height, age, activityLevel, primaryGoal } = profile;

  // --- PRD 3.1: BMR (Mifflin-St Jeor) ---
  const bmr = gender === 'Male'
    ? (10 * weight) + (6.25 * height) - (5 * age) + 5
    : (10 * weight) + (6.25 * height) - (5 * age) - 161;

  // --- PRD 3.2: TDEE ---
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);

  // --- PRD 3.3: Calorie Target ---
  const calories = Math.round(tdee + CALORIE_ADJUSTMENTS[primaryGoal]);

  // --- PRD 3.4: Protein ---
  const proteinPerKg = getProteinPerKg(primaryGoal, age);
  const protein_g = Math.round(proteinPerKg * weight);
  const proteinCalories = protein_g * 4;

  // --- PRD 3.4: Fat ---
  const fatPercent = FAT_PERCENTAGE[primaryGoal];
  const fatCalories = calories * fatPercent;
  const fat_g = Math.round(fatCalories / 9);

  // --- PRD 3.4: Carbohydrates (remainder) ---
  const carbCalories = calories - proteinCalories - fatCalories;
  const carbs_g = Math.round(Math.max(carbCalories, 0) / 4);

  // --- PRD 3.4: Fiber — 14g per 1,000 kcal ---
  const fiber_g = Math.round((calories / 1000) * 14);

  // --- PRD 3.4: Water ---
  let water_ml = weight * 35;
  if (activityLevel === 'Active' || activityLevel === 'Athlete') {
    water_ml += 500;
  } else if (activityLevel === 'Moderate') {
    water_ml += 300;
  }
  water_ml = Math.round(water_ml);

  return {
    bmr: Math.round(bmr),
    tdee,
    calories,
    protein_g,
    fat_g,
    carbs_g,
    fiber_g,
    water_ml,
  };
}
