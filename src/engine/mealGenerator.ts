import type { FoodItem, MicroRDA, MicroKey } from '../types/nutrition.types';
import { VEGETARIAN_FOODS } from '../data/foodDatabase';
import { getSystemNutrients } from './healthScore';
import type { HealthSystem } from './healthScore';

export interface RecommendedFood {
  food: FoodItem;
  loggedQty: number; // multiplier of baseQty
  reason: string;
}

export interface RecommendedMeal {
  slot: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  items: RecommendedFood[];
  totalCalories: number;
  totalProtein: number;
}

export interface SmartAdjustment {
  type: 'increase' | 'add' | 'swap' | 'alternative';
  text: string;
}

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

/**
 * Generates daily meal suggestions and smart adjustment recommendations.
 * PRD Section 7.4 & 7.5.
 */
export function generateMealPlan(
  remainingCalories: number,
  remainingProtein: number,
  userRDA: MicroRDA,
  consumedMicros: Partial<Record<MicroKey, number>>,
  selectedSystems: HealthSystem[],
  restrictions: string[]
): { meals: RecommendedMeal[]; adjustments: SmartAdjustment[] } {
  // 1. Filter database
  const allowedFoods = VEGETARIAN_FOODS.filter(f => !isExcluded(f, restrictions));

  // 2. Identify highest-deficit nutrients in the user's selected health priorities
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

  // 3. Helper to score foods based on how well they address user deficits and protein needs
  const scoreFood = (food: FoodItem): number => {
    let score = 0;
    // Add protein points
    score += food.macros.protein * 2;
    // Add fiber points
    score += food.macros.fiber * 1.5;

    // Add points for matching deficit micros
    for (let i = 0; i < keyDeficits.length; i++) {
      const key = keyDeficits[i];
      const dvPct = key in food.micros ? (food.micros as any)[key] : 0;
      if (dvPct > 0) {
        // Higher points if it solves a larger deficit (earlier in sorted array)
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

  // If calorie targets are already hit, suggest lightweight snacks to top off nutrients
  const dailyCaloriesTarget = Math.max(remainingCalories, 300);

  // Define meal slot allocations
  const slots: { slot: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'; pct: number; cats: (keyof typeof categories)[] }[] = [
    { slot: 'Breakfast', pct: 0.25, cats: ['proteins_dairy', 'fruits', 'seeds_nuts'] },
    { slot: 'Lunch',     pct: 0.35, cats: ['grains_legumes', 'proteins_dairy', 'vegetables'] },
    { slot: 'Dinner',    pct: 0.30, cats: ['grains_legumes', 'vegetables', 'seeds_nuts'] },
    { slot: 'Snacks',    pct: 0.10, cats: ['fruits', 'seeds_nuts'] },
  ];

  // 4. Generate meals
  for (const { slot, pct, cats } of slots) {
    const slotCalTarget = dailyCaloriesTarget * pct;
    const selectedItems: RecommendedFood[] = [];
    let slotCals = 0;
    let slotProtein = 0;

    // Pick 1 high scoring food from each assigned category for the slot
    for (const catName of cats) {
      const candidates = categories[catName];
      if (candidates && candidates.length > 0) {
        // Pick the top candidate not already chosen
        const best = candidates[0];
        // Calculate portion to hit roughly 1/3 of the slot's calorie targets
        const portionCalTarget = slotCalTarget / cats.length;
        const loggedQty = Math.max(parseFloat((portionCalTarget / best.macros.calories).toFixed(1)), 0.5);

        selectedItems.push({
          food: best,
          loggedQty,
          reason: `High in ${best.macros.protein > 10 ? 'Protein' : best.macros.fiber > 4 ? 'Fiber' : 'essential micronutrients'}`
        });
        slotCals += best.macros.calories * loggedQty;
        slotProtein += best.macros.protein * loggedQty;
      }
    }

    meals.push({
      slot,
      items: selectedItems,
      totalCalories: Math.round(slotCals),
      totalProtein: Math.round(slotProtein)
    });
  }

  // 5. Generate Smart Adjustments based on deficiencies
  // Rule A: High deficit in specific nutrients
  if (keyDeficits.includes('magnesium')) {
    const richMag = allowedFoods.find(f => f.micros.magnesium > 25);
    if (richMag) {
      adjustments.push({
        type: 'add',
        text: `Add ${richMag.servingSize} ${richMag.name} to increase Magnesium by +${richMag.micros.magnesium}% DV`
      });
    }
  }

  if (keyDeficits.includes('vitC')) {
    const richC = allowedFoods.find(f => f.micros.vitC > 80);
    if (richC) {
      adjustments.push({
        type: 'swap',
        text: `Swap current fruit for ${richC.name} to easily meet today's Vitamin C requirements`
      });
    }
  }

  if (keyDeficits.includes('iron')) {
    const richIron = allowedFoods.find(f => f.micros.iron > 15);
    if (richIron) {
      adjustments.push({
        type: 'increase',
        text: `Include ${richIron.name} in your next meal to hit your daily Iron target`
      });
    }
  }

  // Rule B: Protein deficit
  if (remainingProtein > 15) {
    const richProt = allowedFoods.find(f => f.category === 'proteins_dairy' && f.macros.protein >= 15);
    if (richProt) {
      adjustments.push({
        type: 'alternative',
        text: `You have ${Math.round(remainingProtein)}g Protein remaining today. Try adding 1 serving of ${richProt.name} (+${richProt.macros.protein}g protein).`
      });
    }
  }

  // Default fallback if no specific deficits
  if (adjustments.length === 0) {
    adjustments.push({
      type: 'alternative',
      text: "Targets look well-balanced! Maintain current meal plans to stay on track."
    });
  }

  return { meals, adjustments };
}
