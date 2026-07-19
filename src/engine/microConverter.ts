// ============================================================
// Micronutrient %DV → Absolute Conversion & Completion Engine
// PRD Reference: Section 4.1
// ============================================================

import type { MicroKey, MicroRDA } from '../types/nutrition.types';

/**
 * Standard reference Daily Values used to convert %DV to absolute amounts.
 * Source: PRD Section 4.1 reference table.
 * Nutrients not listed here are stored as absolute values already (omega3).
 */
const REFERENCE_DV: Partial<Record<MicroKey, number>> = {
  vitA: 900,      // µg
  vitC: 90,       // mg
  vitD: 20,       // µg
  vitE: 15,       // mg
  vitB12: 2.4,    // µg
  calcium: 1300,  // mg
  iron: 18,       // mg
  zinc: 11,       // mg
  magnesium: 420, // mg
  potassium: 4700,// mg
  folate: 400,    // µg
  // omega3 is already stored as absolute grams
};

/**
 * Converts a food database %DV value to absolute amount.
 * If the nutrient has no reference DV (e.g. omega3), returns dvPercent as-is (already absolute).
 * PRD Section 4.1: Consumed_absolute = (dv% / 100) × Reference_DV_value
 */
export function dvToAbsolute(dvPercent: number, nutrient: MicroKey): number {
  const refDV = REFERENCE_DV[nutrient];
  if (refDV === undefined) return dvPercent; // already absolute
  return (dvPercent / 100) * refDV;
}

/**
 * Calculates personalised completion % for a nutrient.
 * Capped at 100% per PRD Section 4.1.
 */
export function calcCompletion(consumed: number, rda: number): number {
  if (rda <= 0) return 0;
  return Math.min((consumed / rda) * 100, 100);
}

/**
 * Builds a full MicroCompletions map from consumed absolute values + user RDA.
 * Any nutrient with no consumed entry defaults to 0% completion.
 */
export function buildMicroCompletions(
  consumedMicros: Partial<Record<MicroKey, number>>,
  userRDA: MicroRDA,
): Record<MicroKey, number> {
  const keys = Object.keys(userRDA) as MicroKey[];
  const result = {} as Record<MicroKey, number>;
  for (const key of keys) {
    const consumed = consumedMicros[key] ?? 0;
    result[key] = calcCompletion(consumed, userRDA[key]);
  }
  return result;
}
