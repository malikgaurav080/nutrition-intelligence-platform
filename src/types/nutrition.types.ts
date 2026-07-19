// ============================================================
// Shared TypeScript types for the Nutrition Calculation Engine
// PRD Reference: Section 3
// ============================================================

/** Activity levels as defined in PRD Section 3.2 */
export type ActivityLevel = 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'Athlete';

/** Primary goal as defined in PRD Section 3.3 */
export type PrimaryGoal =
  | 'Fat Loss'
  | 'Muscle Build'
  | 'Maintain Weight'
  | 'Athletic Performance'
  | 'General Wellness';

/** Input profile for the nutrition calculation engine */
export interface UserProfile {
  /** Age in full years */
  age: number;
  gender: 'Male' | 'Female';
  /** Weight in kg */
  weight: number;
  /** Height in cm */
  height: number;
  activityLevel: ActivityLevel;
  primaryGoal: PrimaryGoal;
  pregnancyStatus: {
    isPregnant: boolean;
    isBreastfeeding: boolean;
  };
}

/** Computed daily macronutrient targets — output of calculateTargets() */
export interface NutritionTargets {
  /** BMR in kcal (Mifflin-St Jeor) */
  bmr: number;
  /** TDEE in kcal */
  tdee: number;
  /** Daily calorie target in kcal */
  calories: number;
  /** Protein target in grams */
  protein_g: number;
  /** Fat target in grams */
  fat_g: number;
  /** Carbohydrate target in grams */
  carbs_g: number;
  /** Fiber target in grams */
  fiber_g: number;
  /** Water intake target in ml */
  water_ml: number;
}

/** Input profile for the RDA lookup table */
export interface RDAProfile {
  age: number;
  gender: 'Male' | 'Female';
  isPregnant: boolean;
  isBreastfeeding: boolean;
}

/**
 * Personalised daily micronutrient RDA values.
 * Units as specified in PRD Section 3.5.
 * All values are in their base units (mg, µg, g).
 */
export interface MicroRDA {
  /** µg */
  vitA: number;
  /** mg */
  vitC: number;
  /** µg */
  vitD: number;
  /** mg */
  vitE: number;
  /** µg */
  vitK: number;
  /** mg */
  vitB1: number;
  /** mg */
  vitB2: number;
  /** mg */
  vitB3: number;
  /** mg */
  vitB5: number;
  /** mg */
  vitB6: number;
  /** µg */
  biotin: number;
  /** µg */
  folate: number;
  /** µg */
  vitB12: number;
  /** mg */
  calcium: number;
  /** mg */
  iron: number;
  /** mg */
  magnesium: number;
  /** mg */
  potassium: number;
  /** mg */
  zinc: number;
  /** mg */
  phosphorus: number;
  /** µg */
  selenium: number;
  /** µg */
  iodine: number;
  /** g */
  omega3: number;
}

/** All nutrient keys in MicroRDA — used for typed lookups */
export type MicroKey = keyof MicroRDA;

/** Completion percentage (0–100) for each micronutrient */
export type MicroCompletions = Record<MicroKey, number>;

/** Today's consumed macro values (grams / kcal) */
export interface ConsumedMacros {
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
}

/** Today's consumed micro values in absolute units (mg, µg, g) */
export type ConsumedMicros = Partial<Record<MicroKey, number>>;

/** Full daily log combining macros and micros consumed today */
export interface DailyLog {
  macros: ConsumedMacros;
  micros: ConsumedMicros;
}

/** Default zero daily log — used before food logger data is available */
export const EMPTY_DAILY_LOG: DailyLog = {
  macros: { calories: 0, protein_g: 0, fat_g: 0, carbs_g: 0, fiber_g: 0 },
  micros: {},
};
