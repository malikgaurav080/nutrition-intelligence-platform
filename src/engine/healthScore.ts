// ============================================================
// Health System Scoring Engine
// PRD Reference: Section 5.1, 5.2, 5.3
// Source: WHO/FAO Mean Adequacy Ratio (MAR) methodology
// ============================================================

import type { MicroKey } from '../types/nutrition.types';

export type HealthSystem =
  | 'Brain'
  | 'Hair'
  | 'Skin'
  | 'Bone'
  | 'Heart'
  | 'Muscle'
  | 'Immunity'
  | 'Eye'
  | 'Blood'
  | 'Thyroid';

/** Display metadata for each health system */
export const HEALTH_SYSTEM_META: Record<HealthSystem, { label: string; emoji: string }> = {
  Brain:    { label: 'Brain Health',   emoji: '🧠' },
  Hair:     { label: 'Hair Health',    emoji: '💇' },
  Skin:     { label: 'Skin Health',    emoji: '✨' },
  Bone:     { label: 'Bone Health',    emoji: '🦴' },
  Heart:    { label: 'Heart Health',   emoji: '❤️' },
  Muscle:   { label: 'Muscle Health',  emoji: '💪' },
  Immunity: { label: 'Immunity',       emoji: '🛡️' },
  Eye:      { label: 'Eye Health',     emoji: '👀' },
  Blood:    { label: 'Blood Health',   emoji: '🩸' },
  Thyroid:  { label: 'Thyroid Health', emoji: '🦋' },
};

interface NutrientWeight {
  key: MicroKey;
  /** 3 for ⭐⭐⭐, 2 for ⭐⭐ */
  weight: 2 | 3;
}

/** PRD Section 5.1 — Nutrient-to-Health-System mapping with weights */
const HEALTH_SYSTEM_MAP: Record<HealthSystem, NutrientWeight[]> = {
  Brain: [
    { key: 'vitB12',   weight: 3 },
    { key: 'magnesium',weight: 3 },
    { key: 'vitB1',    weight: 2 },
    { key: 'vitB6',    weight: 2 },
    { key: 'folate',   weight: 2 },
  ],
  Hair: [
    { key: 'iron',     weight: 3 },
    { key: 'zinc',     weight: 3 },
    { key: 'vitD',     weight: 3 },
    { key: 'biotin',   weight: 2 },
    { key: 'omega3',   weight: 2 },
    { key: 'vitC',     weight: 2 },
  ],
  Skin: [
    { key: 'vitC',     weight: 3 },
    { key: 'vitA',     weight: 3 },
    { key: 'vitE',     weight: 2 },
    { key: 'zinc',     weight: 2 },
    { key: 'omega3',   weight: 2 },
  ],
  Bone: [
    { key: 'calcium',   weight: 3 },
    { key: 'vitD',      weight: 3 },
    { key: 'magnesium', weight: 2 },
    { key: 'vitK',      weight: 2 },
    { key: 'phosphorus',weight: 2 },
  ],
  Heart: [
    { key: 'potassium', weight: 3 },
    { key: 'magnesium', weight: 3 },
    { key: 'omega3',    weight: 3 },
    { key: 'folate',    weight: 2 },
  ],
  Muscle: [
    { key: 'magnesium', weight: 3 },
    { key: 'potassium', weight: 3 },
    { key: 'calcium',   weight: 2 },
  ],
  Immunity: [
    { key: 'vitC', weight: 3 },
    { key: 'vitD', weight: 3 },
    { key: 'zinc', weight: 3 },
    { key: 'vitA', weight: 2 },
  ],
  Eye: [
    { key: 'vitA', weight: 3 },
  ],
  Blood: [
    { key: 'iron',   weight: 3 },
    { key: 'vitB12', weight: 3 },
    { key: 'folate', weight: 3 },
    { key: 'vitC',   weight: 2 },
  ],
  Thyroid: [
    { key: 'iodine',   weight: 3 },
    { key: 'selenium', weight: 2 },
  ],
};

/**
 * Calculates the weighted health score for a single system.
 * PRD Section 5.2: Health_Score = SUM(min(completion_i, 100) × weight_i) / SUM(weight_i)
 *
 * Note: Protein completion is passed separately as it is not a MicroKey.
 * Hair and Muscle systems reference protein — pass proteinCompletion for these.
 */
export function calcHealthScore(
  system: HealthSystem,
  completions: Partial<Record<MicroKey, number>>,
  proteinCompletion: number = 0,
): number {
  const nutrients = HEALTH_SYSTEM_MAP[system];
  let numerator = 0;
  let denominator = 0;

  // Hair and Muscle include protein as a ⭐⭐⭐ nutrient
  if (system === 'Hair' || system === 'Muscle') {
    numerator += Math.min(proteinCompletion, 100) * 3;
    denominator += 3;
  }

  for (const { key, weight } of nutrients) {
    const completion = completions[key] ?? 0;
    numerator += Math.min(completion, 100) * weight;
    denominator += weight;
  }

  if (denominator === 0) return 0;
  return Math.round(numerator / denominator);
}

/**
 * Calculates the overall nutrition score across all selected health systems.
 * PRD Section 5.3: Average of all selected system scores.
 */
export function calcOverallScore(
  selectedSystems: HealthSystem[],
  completions: Partial<Record<MicroKey, number>>,
  proteinCompletion: number = 0,
): number {
  if (selectedSystems.length === 0) return 0;
  const total = selectedSystems.reduce(
    (sum, system) => sum + calcHealthScore(system, completions, proteinCompletion),
    0,
  );
  return Math.round(total / selectedSystems.length);
}

/**
 * Returns colour class and label based on PRD 6.3 thresholds.
 * Green ≥80%, Indigo 60–79%, Amber 40–59%, Red <40%
 */
export function scoreColour(score: number): 'score-green' | 'score-indigo' | 'score-amber' | 'score-red' {
  if (score >= 80) return 'score-green';
  if (score >= 60) return 'score-indigo';
  if (score >= 40) return 'score-amber';
  return 'score-red';
}

/** Returns all nutrient weights for a given health system (for detail views) */
export function getSystemNutrients(system: HealthSystem): NutrientWeight[] {
  return HEALTH_SYSTEM_MAP[system];
}
