import type { FoodItem, MicroRDA, MicroKey, MealPlanWizardState } from '../types/nutrition.types';
import { VEGETARIAN_FOODS } from '../data/foodDatabase';
import { getSystemNutrients } from './healthScore';
import type { HealthSystem } from './healthScore';
import { dvToAbsolute } from './microConverter';

export interface RecommendedFood {
  food: FoodItem;
  loggedQty: number; // multiplier of baseQty
  reason: string;
}

export interface RecommendedMeal {
  slot: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'Pre-Workout' | 'Post-Workout';
  time?: string;
  sortTimeMinutes?: number;
  items: RecommendedFood[];
  totalCalories: number;
  totalProtein: number;
}

export interface SmartAdjustment {
  type: 'increase' | 'add' | 'swap' | 'alternative';
  text: string;
}

const HUMAN_MICRO_NAMES: Record<MicroKey, string> = {
  vitA: 'Vitamin A',
  vitC: 'Vitamin C',
  vitD: 'Vitamin D',
  vitE: 'Vitamin E',
  vitK: 'Vitamin K',
  vitB1: 'Vitamin B1',
  vitB2: 'Vitamin B2',
  vitB3: 'Vitamin B3',
  vitB5: 'Vitamin B5',
  vitB6: 'Vitamin B6',
  biotin: 'Biotin',
  folate: 'Folate',
  vitB12: 'Vitamin B12',
  calcium: 'Calcium',
  iron: 'Iron',
  magnesium: 'Magnesium',
  potassium: 'Potassium',
  zinc: 'Zinc',
  phosphorus: 'Phosphorus',
  selenium: 'Selenium',
  iodine: 'Iodine',
  omega3: 'Omega-3',
};

/** Check if a food is excluded based on user dietary restrictions */
function isExcluded(food: FoodItem, restrictions: string[]): boolean {
  for (const r of restrictions) {
    const norm = r.toLowerCase();
    if (norm.includes('peanut') && food.id === 'peanuts') return true;
    if (norm.includes('tree nut') && ['almonds', 'cashews', 'walnuts'].includes(food.id)) return true;
    if (norm.includes('soy') && ['tofu', 'tempeh', 'soya_chunks'].includes(food.id)) return true;
    if (norm.includes('lactose') && ['paneer', 'milk', 'greek_yogurt', 'hung_curd', 'whey_protein'].includes(food.id)) return true;
    if (norm.includes('gluten') && ['oats'].includes(food.id)) return true;
  }
  return false;
}

/** Parse a time string like "8:00 AM" or "6:30 PM" into minutes from midnight */
export function parseTimeToMinutes(timeStr?: string): number {
  if (!timeStr) return 8 * 60;
  const norm = timeStr.trim().toUpperCase();
  const match = norm.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (!match) return 8 * 60;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const mer = match[3];
  if (mer === 'PM' && h < 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

/** Format minutes from midnight into 12-hour AM/PM string (e.g. 1020 -> "5:00 PM") */
export function formatMinutesToTime(mins: number): string {
  const normalized = ((mins % 1440) + 1440) % 1440;
  let h = Math.floor(normalized / 60);
  const m = Math.round(normalized % 60);
  const mer = h >= 12 ? 'PM' : 'AM';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  const mStr = m < 10 ? `0${m}` : `${m}`;
  return `${h12}:${mStr} ${mer}`;
}

/**
 * Generates daily meal suggestions and smart adjustment recommendations.
 * Parameters align to profile targets. Allowed/excluded items are used for filtering.
 * PRD Section 7.4, 7.5 & 7.6.
 */
export function generateMealPlan(
  remainingCalories: number,
  remainingProtein: number,
  userRDA: MicroRDA,
  consumedMicros: Partial<Record<MicroKey, number>>,
  selectedSystems: HealthSystem[],
  allowedIngredients: string[],
  excludedIngredients: string[],
  restrictions: string[],
  offset: number = 0,
  wizardConfig?: MealPlanWizardState
): { meals: RecommendedMeal[]; adjustments: SmartAdjustment[]; planDeficiencies: string[] } {
  // 1. Filter database based on restrictions, allowed items, and categorized excluded items
  const combinedExclusions = new Set<string>([
    ...excludedIngredients,
    ...(wizardConfig?.excludedFruits ?? []),
    ...(wizardConfig?.excludedNuts ?? []),
    ...(wizardConfig?.excludedVeggies ?? []),
    ...(wizardConfig?.excludedProteins ?? []),
  ]);

  let allowedFoods = VEGETARIAN_FOODS.filter(f => !isExcluded(f, restrictions));

  if (allowedIngredients.length > 0) {
    allowedFoods = allowedFoods.filter(f => allowedIngredients.includes(f.id));
  }

  if (combinedExclusions.size > 0) {
    allowedFoods = allowedFoods.filter(f => !combinedExclusions.has(f.id));
  }



  // 3. Identify highest-deficit nutrients in the user's selected health priorities
  const deficitNutrients: { key: MicroKey; deficit: number }[] = [];
  const systemNutrientKeys = new Set<MicroKey>();

  for (const sys of selectedSystems) {
    const nutrients = getSystemNutrients(sys);
    for (const n of nutrients) {
      systemNutrientKeys.add(n.key);
    }
  }

  for (const key of systemNutrientKeys) {
    const rdaVal = userRDA[key] || 1;
    const consumedVal = consumedMicros[key] || 0;
    const completionPct = (consumedVal / rdaVal) * 100;
    if (completionPct < 80) {
      deficitNutrients.push({ key, deficit: 100 - completionPct });
    }
  }

  // Sort deficits highest first
  deficitNutrients.sort((a, b) => b.deficit - a.deficit);
  const keyDeficits = deficitNutrients.map(d => d.key);

  // Helper to score foods based on how well they address user deficits and protein needs
  const scoreFood = (food: FoodItem): number => {
    let score = 0;
    score += food.macros.protein * 2;
    score += food.macros.fiber * 1.5;

    for (let i = 0; i < keyDeficits.length; i++) {
      const key = keyDeficits[i];
      const dvPct = key in food.micros ? (food.micros as any)[key] : 0;
      if (dvPct > 0) {
        score += dvPct * (keyDeficits.length - i);
      }
    }
    return score;
  };

  // Group allowed foods by category
  const categories = {
    proteins_dairy: allowedFoods.filter(f => f.category === 'proteins_dairy').sort((a, b) => scoreFood(b) - scoreFood(a)),
    grains_legumes: allowedFoods.filter(f => f.category === 'grains_legumes').sort((a, b) => scoreFood(b) - scoreFood(a)),
    seeds_nuts: allowedFoods.filter(f => f.category === 'seeds_nuts').sort((a, b) => scoreFood(b) - scoreFood(a)),
    vegetables: allowedFoods.filter(f => f.category === 'vegetables').sort((a, b) => scoreFood(b) - scoreFood(a)),
    fruits: allowedFoods.filter(f => f.category === 'fruits').sort((a, b) => scoreFood(b) - scoreFood(a)),
  };

  const meals: RecommendedMeal[] = [];
  const adjustments: SmartAdjustment[] = [];

  const dailyCaloriesTarget = Math.max(Math.round(remainingCalories), 300);

  // Define meal slot allocations based on wizard config (Gym vs Non-Gym)
  type SlotType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'Pre-Workout' | 'Post-Workout';
  let slots: { slot: SlotType; pct: number; cats: (keyof typeof categories)[] }[] = [];

  if (wizardConfig?.gymWorkout) {
    slots = [
      { slot: 'Pre-Workout',  pct: 0.12, cats: ['fruits', 'seeds_nuts'] },
      { slot: 'Post-Workout', pct: 0.23, cats: ['proteins_dairy'] },
      { slot: 'Breakfast',    pct: 0.20, cats: ['proteins_dairy', 'fruits'] },
      { slot: 'Lunch',        pct: 0.25, cats: ['grains_legumes', 'proteins_dairy', 'vegetables'] },
      { slot: 'Dinner',       pct: 0.20, cats: ['grains_legumes', 'vegetables', 'seeds_nuts'] },
    ];
  } else {
    slots = [
      { slot: 'Breakfast', pct: 0.25, cats: ['proteins_dairy', 'fruits', 'seeds_nuts'] },
      { slot: 'Lunch',     pct: 0.35, cats: ['grains_legumes', 'proteins_dairy', 'vegetables'] },
      { slot: 'Dinner',    pct: 0.30, cats: ['grains_legumes', 'vegetables', 'seeds_nuts'] },
      { slot: 'Snacks',    pct: 0.10, cats: ['fruits', 'seeds_nuts'] },
    ];
  }

  // 4. Generate meals
  const wheyFood = VEGETARIAN_FOODS.find(f => f.id === 'whey_protein') || {
    id: 'whey_protein',
    name: 'Whey Protein (Veg)',
    category: 'proteins_dairy' as const,
    servingSize: '1 scoop (30g)',
    servingUnit: 'scoop',
    baseQty: 1,
    macros: { calories: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0 },
    micros: { vitA: 0, vitC: 0, vitD: 10, vitE: 0, vitB12: 25, calcium: 15, iron: 2, zinc: 5, magnesium: 8, potassium: 4, folate: 0, omega3: 0 }
  };

  const scoops = wizardConfig?.proteinScoops ?? 0;
  const workoutMins = parseTimeToMinutes(wizardConfig?.workoutTime || '8:00 AM');
  const wakeMins = (wizardConfig?.wakeHour ?? 7) * 60;
  const sleepMins = (wizardConfig?.sleepHour ?? 23) * 60;

  function getSlotMins(s: SlotType): number {
    switch (s) {
      case 'Pre-Workout':  return workoutMins - 60; // Exactly 1 hour before gym time
      case 'Post-Workout': return workoutMins + 60; // Exactly 1 hour after gym start
      case 'Breakfast':    return wakeMins + 60;    // 1h after waking up
      case 'Lunch':        return wakeMins + 360;   // 6h after waking up
      case 'Dinner':       return sleepMins - 150;  // 2.5h before sleeping
      case 'Snacks':       return wakeMins + 570;   // 9.5h after waking up
    }
  }

  for (const { slot, pct, cats } of slots) {
    const slotCalTarget = dailyCaloriesTarget * pct;
    const selectedItems: RecommendedFood[] = [];
    const slotMins = getSlotMins(slot);

    // Post-Workout slot: Must contain ONLY 1 item (Whey Protein scoop if scoops > 0, else 1 high-protein food)
    if (slot === 'Post-Workout') {
      if (scoops > 0) {
        selectedItems.push({
          food: wheyFood,
          loggedQty: 1,
          reason: 'Post-Workout Whey Protein Scoop for rapid muscle recovery'
        });
      } else {
        const bestProt = categories.proteins_dairy[offset % Math.max(categories.proteins_dairy.length, 1)] || VEGETARIAN_FOODS[0];
        const loggedQty = parseFloat((slotCalTarget / bestProt.macros.calories).toFixed(2));
        selectedItems.push({
          food: bestProt,
          loggedQty,
          reason: 'Post-Workout high-protein recovery meal'
        });
      }
    } else {
      // Other slots: Add Scoop if configured for Breakfast/Snacks
      if (scoops === 1 && slot === 'Breakfast' && !wizardConfig?.gymWorkout) {
        selectedItems.push({
          food: wheyFood,
          loggedQty: 1,
          reason: 'Morning Whey Protein Scoop for daily protein target'
        });
      } else if (scoops === 2 && slot === 'Breakfast') {
        selectedItems.push({
          food: wheyFood,
          loggedQty: 1,
          reason: 'Morning Whey Protein Scoop with meal for daily protein target'
        });
      } else if (scoops === 2 && slot === 'Snacks' && !wizardConfig?.gymWorkout) {
        selectedItems.push({
          food: wheyFood,
          loggedQty: 1,
          reason: 'Evening Whey Protein Scoop'
        });
      }

      for (const catName of cats) {
        const candidates = categories[catName];
        if (candidates && candidates.length > 0) {
          const index = offset % candidates.length;
          const best = candidates[index];
          const portionCalTarget = slotCalTarget / cats.length;
          const loggedQty = parseFloat((portionCalTarget / best.macros.calories).toFixed(2));

          selectedItems.push({
            food: best,
            loggedQty,
            reason: `High in ${best.macros.protein > 10 ? 'Protein' : best.macros.fiber > 4 ? 'Fiber' : 'essential micronutrients'}`
          });
        } else {
          // Fallback: search general vegetarian database
          const fallbacks = VEGETARIAN_FOODS.filter(f => f.category === catName && !isExcluded(f, restrictions));
          if (fallbacks.length > 0) {
            const index = offset % fallbacks.length;
            const best = fallbacks[index];
            const portionCalTarget = slotCalTarget / cats.length;
            const loggedQty = parseFloat((portionCalTarget / best.macros.calories).toFixed(2));

            selectedItems.push({
              food: best,
              loggedQty,
              reason: `Fallback: High in ${best.macros.protein > 10 ? 'Protein' : 'nutrients'}`
            });
          }
        }
      }
    }

    meals.push({
      slot,
      time: formatMinutesToTime(slotMins),
      sortTimeMinutes: slotMins,
      items: selectedItems,
      totalCalories: Math.round(selectedItems.reduce((s, it) => s + it.food.macros.calories * it.loggedQty, 0)),
      totalProtein: Math.round(selectedItems.reduce((s, it) => s + it.food.macros.protein * it.loggedQty, 0))
    });
  }

  // 4b. Calorie & Protein Target Normalization Pass
  // Deduct scoop calories and scale whole food portions so total plan calories match dailyCaloriesTarget precisely
  const totalScoopCalories = meals.reduce((sum, meal) => sum + meal.items.filter(it => it.food.id === 'whey_protein').reduce((s, it) => s + it.food.macros.calories * it.loggedQty, 0), 0);
  const rawWholeFoodCalories = meals.reduce((sum, meal) => sum + meal.items.filter(it => it.food.id !== 'whey_protein').reduce((s, it) => s + it.food.macros.calories * it.loggedQty, 0), 0);
  const targetWholeFoodCalories = Math.max(dailyCaloriesTarget - totalScoopCalories, 200);

  if (rawWholeFoodCalories > 0) {
    const scaleFactor = targetWholeFoodCalories / rawWholeFoodCalories;
    for (const meal of meals) {
      let slotCals = 0;
      let slotProt = 0;
      for (const item of meal.items) {
        if (item.food.id !== 'whey_protein') {
          item.loggedQty = Math.max(parseFloat((item.loggedQty * scaleFactor).toFixed(2)), 0.1);
        }
        slotCals += item.food.macros.calories * item.loggedQty;
        slotProt += item.food.macros.protein * item.loggedQty;
      }
      meal.totalCalories = Math.round(slotCals);
      meal.totalProtein = Math.round(slotProt);
    }
  }

  // 4c. Sort meals in ascending chronological order based on sortTimeMinutes
  meals.sort((a, b) => (a.sortTimeMinutes ?? 0) - (b.sortTimeMinutes ?? 0));

  // 5. Generate Smart Adjustments based on deficits
  if (keyDeficits.includes('magnesium')) {
    const richMag = allowedFoods.find(f => f.micros.magnesium > 25) || VEGETARIAN_FOODS.find(f => f.micros.magnesium > 25);
    if (richMag) {
      adjustments.push({
        type: 'add',
        text: `Add ${richMag.servingSize} ${richMag.name} to increase Magnesium by +${richMag.micros.magnesium}% DV`
      });
    }
  }

  if (keyDeficits.includes('vitC')) {
    const richC = allowedFoods.find(f => f.micros.vitC > 80) || VEGETARIAN_FOODS.find(f => f.micros.vitC > 80);
    if (richC) {
      adjustments.push({
        type: 'swap',
        text: `Swap current fruit for ${richC.name} to easily meet today's Vitamin C requirements`
      });
    }
  }

  if (keyDeficits.includes('iron')) {
    const richIron = allowedFoods.find(f => f.micros.iron > 15) || VEGETARIAN_FOODS.find(f => f.micros.iron > 15);
    if (richIron) {
      adjustments.push({
        type: 'increase',
        text: `Include ${richIron.name} in your next meal to hit your daily Iron target`
      });
    }
  }

  if (remainingProtein > 15) {
    const richProt = allowedFoods.find(f => f.category === 'proteins_dairy' && f.macros.protein >= 15) || VEGETARIAN_FOODS.find(f => f.category === 'proteins_dairy' && f.macros.protein >= 15);
    if (richProt) {
      adjustments.push({
        type: 'alternative',
        text: `Remaining Protein target is ${Math.round(remainingProtein)}g. Consider adding 1 serving of ${richProt.name} (+${richProt.macros.protein}g protein).`
      });
    }
  }

  if (adjustments.length === 0) {
    adjustments.push({
      type: 'alternative',
      text: "Targets look well-balanced! Maintain current meal plans to stay on track."
    });
  }

  // 6. Recommendation Deficit Audit & Gaps Suggestion (PRD 7.6)
  const planTotals = {
    micros: {} as Record<MicroKey, number>
  };

  for (const meal of meals) {
    for (const item of meal.items) {
      const qty = item.loggedQty;
      for (const key of Object.keys(userRDA) as MicroKey[]) {
        if (key in item.food.micros) {
          const dvPct = (item.food.micros as any)[key];
          const absVal = dvToAbsolute(dvPct, key) * qty;
          planTotals.micros[key] = (planTotals.micros[key] || 0) + absVal;
        }
      }
    }
  }

  const planDeficiencies: string[] = [];
  for (const key of systemNutrientKeys) {
    const rdaVal = userRDA[key] || 1;
    const planVal = planTotals.micros[key] || 0;
    const planCompletionPct = (planVal / rdaVal) * 100;

    if (planCompletionPct < 95) {
      const richFood = allowedFoods
        .filter(f => key in f.micros && (f.micros as any)[key] > 10)
        .sort((a, b) => (b.micros as any)[key] - (a.micros as any)[key])[0] ||
        VEGETARIAN_FOODS
        .filter(f => key in f.micros && (f.micros as any)[key] > 10)
        .sort((a, b) => (b.micros as any)[key] - (a.micros as any)[key])[0];

      const label = HUMAN_MICRO_NAMES[key] || key;
      if (richFood) {
        planDeficiencies.push(
          `Shortfall of ${label} (${Math.round(planCompletionPct)}% of target). Suggestion: Log ${richFood.servingSize} ${richFood.name} (+${(richFood.micros as any)[key]}% DV)`
        );
      } else {
        planDeficiencies.push(
          `Shortfall of ${label} (${Math.round(planCompletionPct)}% of target)`
        );
      }
    }
  }

  return { meals, adjustments, planDeficiencies };
}
