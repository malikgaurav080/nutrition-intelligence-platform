# 🥗 Vegetarian Food Database

The following is the structured data for the vegetarian food database used in the Nutrition Engine.

```typescript
export const VEGETARIAN_FOODS: FoodItem[] = [
  // --- Proteins & Dairy ---
  {
    id: "paneer",
    name: "Paneer (Cottage Cheese)",
    category: "proteins_dairy",
    servingSize: "100g",
    servingUnit: "g",
    baseQty: 100,
    macros: { calories: 265, protein: 18.0, carbs: 3.6, fat: 20.0, fiber: 0.0 },
    micros: { vitA: 10, vitC: 0, vitD: 15, vitE: 2, vitB12: 20, calcium: 48, iron: 2, zinc: 8, magnesium: 5, potassium: 3, folate: 4, omega3: 0.1 }
  },
  {
    id: "tofu",
    name: "Tofu (Firm)",
    category: "proteins_dairy",
    servingSize: "100g",
    servingUnit: "g",
    baseQty: 100,
    macros: { calories: 144, protein: 17.0, carbs: 2.8, fat: 8.0, fiber: 1.8 },
    micros: { vitA: 2, vitC: 0, vitD: 0, vitE: 1, vitB12: 0, calcium: 35, iron: 30, zinc: 15, magnesium: 18, potassium: 4, folate: 5, omega3: 0.2 }
  },
  {
    id: "tempeh",
    name: "Tempeh",
    category: "proteins_dairy",
    servingSize: "100g",
    servingUnit: "g",
    baseQty: 100,
    macros: { calories: 192, protein: 20.0, carbs: 9.0, fat: 11.0, fiber: 0.0 },
    micros: { vitA: 0, vitC: 0, vitD: 0, vitE: 0, vitB12: 5, calcium: 11, iron: 15, zinc: 12, magnesium: 20, potassium: 10, folate: 6, omega3: 0.1 }
  },
  {
    id: "soya_chunks",
    name: "Soya Chunks",
    category: "proteins_dairy",
    servingSize: "30g",
    servingUnit: "g",
    baseQty: 30,
    macros: { calories: 105, protein: 15.0, carbs: 10.0, fat: 0.2, fiber: 4.0 },
    micros: { vitA: 0, vitC: 0, vitD: 0, vitE: 0, vitB12: 0, calcium: 10, iron: 25, zinc: 10, magnesium: 15, potassium: 15, folate: 8, omega3: 0.0 }
  },
  {
    id: "greek_yogurt",
    name: "Greek Yogurt (Plain)",
    category: "proteins_dairy",
    servingSize: "150g",
    servingUnit: "g",
    baseQty: 150,
    macros: { calories: 90, protein: 15.0, carbs: 5.0, fat: 0.4, fiber: 0.0 },
    micros: { vitA: 5, vitC: 0, vitD: 0, vitE: 0, vitB12: 35, calcium: 20, iron: 0, zinc: 10, magnesium: 4, potassium: 8, folate: 3, omega3: 0.0 }
  },
  {
    id: "whey_protein",
    name: "Whey Protein (Veg)",
    category: "proteins_dairy",
    servingSize: "1 scoop (30g)",
    servingUnit: "scoop",
    baseQty: 1,
    macros: { calories: 120, protein: 24.0, carbs: 2.0, fat: 1.5, fiber: 0.0 },
    micros: { vitA: 0, vitC: 0, vitD: 0, vitE: 0, vitB12: 15, calcium: 15, iron: 0, zinc: 2, magnesium: 8, potassium: 5, folate: 0, omega3: 0.0 }
  },
  {
    id: "milk",
    name: "Cow Milk (Low Fat)",
    category: "proteins_dairy",
    servingSize: "250ml",
    servingUnit: "ml",
    baseQty: 250,
    macros: { calories: 110, protein: 8.5, carbs: 12.0, fat: 2.5, fiber: 0.0 },
    micros: { vitA: 10, vitC: 2, vitD: 25, vitE: 0, vitB12: 45, calcium: 30, iron: 0, zinc: 8, magnesium: 6, potassium: 10, folate: 3, omega3: 0.0 }
  },
  {
    id: "sattu",
    name: "Sattu (Roasted Chickpea Flour)",
    category: "proteins_dairy",
    servingSize: "30g",
    servingUnit: "g",
    baseQty: 30,
    macros: { calories: 120, protein: 6.0, carbs: 19.0, fat: 1.5, fiber: 4.0 },
    micros: { vitA: 2, vitC: 0, vitD: 0, vitE: 2, vitB12: 0, calcium: 6, iron: 12, zinc: 8, magnesium: 10, potassium: 6, folate: 12, omega3: 0.0 }
  },
  {
    id: "hung_curd",
    name: "Hung Curd",
    category: "proteins_dairy",
    servingSize: "100g",
    servingUnit: "g",
    baseQty: 100,
    macros: { calories: 95, protein: 10.0, carbs: 4.0, fat: 4.0, fiber: 0.0 },
    micros: { vitA: 5, vitC: 0, vitD: 0, vitE: 0, vitB12: 30, calcium: 18, iron: 0, zinc: 8, magnesium: 4, potassium: 7, folate: 3, omega3: 0.0 }
  },

  // --- Grains & Legumes ---
  {
    id: "oats",
    name: "Oats (Rolled)",
    category: "grains_legumes",
    servingSize: "50g",
    servingUnit: "g",
    baseQty: 50,
    macros: { calories: 190, protein: 6.5, carbs: 32.0, fat: 3.5, fiber: 5.0 },
    micros: { vitA: 0, vitC: 0, vitD: 0, vitE: 1, vitB12: 0, calcium: 3, iron: 13, zinc: 12, magnesium: 14, potassium: 4, folate: 4, omega3: 0.1 }
  },
  {
    id: "quinoa",
    name: "Quinoa",
    category: "grains_legumes",
    servingSize: "50g",
    servingUnit: "g",
    baseQty: 50,
    macros: { calories: 185, protein: 6.5, carbs: 32.0, fat: 3.0, fiber: 3.5 },
    micros: { vitA: 0, vitC: 0, vitD: 0, vitE: 3, vitB12: 0, calcium: 4, iron: 15, zinc: 12, magnesium: 20, potassium: 7, folate: 18, omega3: 0.1 }
  },
  {
    id: "lentils",
    name: "Moong/Masoor Dal (Lentils)",
    category: "grains_legumes",
    servingSize: "100g cooked",
    servingUnit: "g",
    baseQty: 100,
    macros: { calories: 116, protein: 9.0, carbs: 20.0, fat: 0.4, fiber: 8.0 },
    micros: { vitA: 1, vitC: 2, vitD: 0, vitE: 0, vitB12: 0, calcium: 2, iron: 18, zinc: 11, magnesium: 9, potassium: 8, folate: 45, omega3: 0.0 }
  },
  {
    id: "chickpeas",
    name: "Chickpeas (Kabuli Chana)",
    category: "grains_legumes",
    servingSize: "100g cooked",
    servingUnit: "g",
    baseQty: 100,
    macros: { calories: 164, protein: 9.0, carbs: 27.0, fat: 2.6, fiber: 7.6 },
    micros: { vitA: 1, vitC: 2, vitD: 0, vitE: 2, vitB12: 0, calcium: 5, iron: 16, zinc: 10, magnesium: 12, potassium: 7, folate: 43, omega3: 0.1 }
  },
  {
    id: "kidney_beans",
    name: "Kidney Beans (Rajma)",
    category: "grains_legumes",
    servingSize: "100g cooked",
    servingUnit: "g",
    baseQty: 100,
    macros: { calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5, fiber: 6.4 },
    micros: { vitA: 0, vitC: 2, vitD: 0, vitE: 0, vitB12: 0, calcium: 3, iron: 12, zinc: 8, magnesium: 10, potassium: 10, folate: 33, omega3: 0.0 }
  },
  {
    id: "edamame",
    name: "Edamame",
    category: "grains_legumes",
    servingSize: "100g",
    servingUnit: "g",
    baseQty: 100,
    macros: { calories: 122, protein: 11.0, carbs: 10.0, fat: 5.0, fiber: 5.2 },
    micros: { vitA: 6, vitC: 10, vitD: 0, vitE: 4, vitB12: 0, calcium: 6, iron: 8, zinc: 9, magnesium: 16, potassium: 12, folate: 78, omega3: 0.3 }
  },
  {
    id: "brown_rice",
    name: "Brown Rice",
    category: "grains_legumes",
    servingSize: "150g cooked",
    servingUnit: "g",
    baseQty: 150,
    macros: { calories: 165, protein: 3.5, carbs: 35.0, fat: 1.2, fiber: 2.5 },
    micros: { vitA: 0, vitC: 0, vitD: 0, vitE: 0, vitB12: 0, calcium: 1, iron: 3, zinc: 6, magnesium: 11, potassium: 2, folate: 2, omega3: 0.0 }
  },
  {
    id: "ragi",
    name: "Ragi (Finger Millet Flour)",
    category: "grains_legumes",
    servingSize: "30g",
    servingUnit: "g",
    baseQty: 30,
    macros: { calories: 100, protein: 2.2, carbs: 22.0, fat: 0.4, fiber: 3.5 },
    micros: { vitA: 1, vitC: 0, vitD: 0, vitE: 1, vitB12: 0, calcium: 35, iron: 10, zinc: 6, magnesium: 12, potassium: 4, folate: 5, omega3: 0.0 }
  },
  {
    id: "black_beans",
    name: "Black Beans",
    category: "grains_legumes",
    servingSize: "100g cooked",
    servingUnit: "g",
    baseQty: 100,
    macros: { calories: 132, protein: 8.9, carbs: 23.7, fat: 0.5, fiber: 8.7 },
    micros: { vitA: 0, vitC: 0, vitD: 0, vitE: 1, vitB12: 0, calcium: 3, iron: 12, zinc: 8, magnesium: 17, potassium: 10, folate: 37, omega3: 0.1 }
  },
  {
    id: "cowpeas",
    name: "Cowpeas (Lobia)",
    category: "grains_legumes",
    servingSize: "100g cooked",
    servingUnit: "g",
    baseQty: 100,
    macros: { calories: 116, protein: 8.0, carbs: 20.8, fat: 0.5, fiber: 6.5 },
    micros: { vitA: 0, vitC: 1, vitD: 0, vitE: 0, vitB12: 0, calcium: 4, iron: 13, zinc: 8, magnesium: 11, potassium: 8, folate: 52, omega3: 0.0 }
  },
  {
    id: "green_peas",
    name: "Green Peas",
    category: "grains_legumes",
    servingSize: "100g cooked",
    servingUnit: "g",
    baseQty: 100,
    macros: { calories: 84, protein: 5.4, carbs: 15.6, fat: 0.4, fiber: 5.5 },
    micros: { vitA: 10, vitC: 24, vitD: 0, vitE: 1, vitB12: 0, calcium: 3, iron: 8, zinc: 7, magnesium: 8, potassium: 8, folate: 24, omega3: 0.0 }
  },

  // --- Seeds & Nuts ---
  {
    id: "chia_seeds",
    name: "Chia Seeds",
    category: "seeds_nuts",
    servingSize: "15g",
    servingUnit: "g",
    baseQty: 15,
    macros: { calories: 73, protein: 2.5, carbs: 6.0, fat: 4.6, fiber: 5.0 },
    micros: { vitA: 0, vitC: 0, vitD: 0, vitE: 1, vitB12: 0, calcium: 10, iron: 7, zinc: 5, magnesium: 12, potassium: 2, folate: 2, omega3: 2.5 }
  },
  {
    id: "flaxseeds",
    name: "Flaxseeds",
    category: "seeds_nuts",
    servingSize: "15g",
    servingUnit: "g",
    baseQty: 15,
    macros: { calories: 80, protein: 2.7, carbs: 4.3, fat: 6.3, fiber: 4.1 },
    micros: { vitA: 0, vitC: 0, vitD: 0, vitE: 1, vitB12: 0, calcium: 4, iron: 5, zinc: 4, magnesium: 13, potassium: 3, folate: 3, omega3: 3.2 }
  },
  {
    id: "pumpkin_seeds",
    name: "Pumpkin Seeds",
    category: "seeds_nuts",
    servingSize: "30g",
    servingUnit: "g",
    baseQty: 30,
    macros: { calories: 170, protein: 9.0, carbs: 4.0, fat: 14.0, fiber: 1.8 },
    micros: { vitA: 1, vitC: 1, vitD: 0, vitE: 3, vitB12: 0, calcium: 2, iron: 16, zinc: 20, magnesium: 37, potassium: 6, folate: 4, omega3: 0.1 }
  },
  {
    id: "sunflower_seeds",
    name: "Sunflower Seeds",
    category: "seeds_nuts",
    servingSize: "30g",
    servingUnit: "g",
    baseQty: 30,
    macros: { calories: 175, protein: 6.0, carbs: 6.0, fat: 15.0, fiber: 3.0 },
    micros: { vitA: 1, vitC: 1, vitD: 0, vitE: 45, vitB12: 0, calcium: 2, iron: 8, zinc: 8, magnesium: 9, potassium: 6, folate: 16, omega3: 0.1 }
  },
  {
    id: "almonds",
    name: "Almonds",
    category: "seeds_nuts",
    servingSize: "30g",
    servingUnit: "g",
    baseQty: 30,
    macros: { calories: 170, protein: 6.0, carbs: 6.0, fat: 15.0, fiber: 3.5 },
    micros: { vitA: 0, vitC: 0, vitD: 0, vitE: 37, vitB12: 0, calcium: 8, iron: 6, zinc: 6, magnesium: 19, potassium: 4, folate: 3, omega3: 0.0 }
  },
  {
    id: "walnuts",
    name: "Walnuts",
    category: "seeds_nuts",
    servingSize: "30g",
    servingUnit: "g",
    baseQty: 30,
    macros: { calories: 185, protein: 4.3, carbs: 4.0, fat: 18.5, fiber: 2.0 },
    micros: { vitA: 1, vitC: 1, vitD: 0, vitE: 2, vitB12: 0, calcium: 3, iron: 5, zinc: 6, magnesium: 11, potassium: 3, folate: 5, omega3: 2.5 }
  },
  {
    id: "cashews",
    name: "Cashews",
    category: "seeds_nuts",
    servingSize: "30g",
    servingUnit: "g",
    baseQty: 30,
    macros: { calories: 165, protein: 5.5, carbs: 9.0, fat: 13.0, fiber: 1.0 },
    micros: { vitA: 0, vitC: 0, vitD: 0, vitE: 1, vitB12: 0, calcium: 1, iron: 11, zinc: 15, magnesium: 18, potassium: 5, folate: 5, omega3: 0.1 }
  },
  {
    id: "peanuts",
    name: "Peanuts",
    category: "seeds_nuts",
    servingSize: "30g",
    servingUnit: "g",
    baseQty: 30,
    macros: { calories: 170, protein: 7.5, carbs: 5.0, fat: 14.0, fiber: 2.4 },
    micros: { vitA: 0, vitC: 0, vitD: 0, vitE: 12, vitB12: 0, calcium: 2, iron: 6, zinc: 8, magnesium: 15, potassium: 5, folate: 12, omega3: 0.0 }
  },
  {
    id: "hemp_seeds",
    name: "Hemp Seeds",
    category: "seeds_nuts",
    servingSize: "30g",
    servingUnit: "g",
    baseQty: 30,
    macros: { calories: 170, protein: 10.0, carbs: 3.0, fat: 15.0, fiber: 1.2 },
    micros: { vitA: 0, vitC: 0, vitD: 0, vitE: 2, vitB12: 0, calcium: 2, iron: 14, zinc: 20, magnesium: 45, potassium: 8, folate: 3, omega3: 2.5 }
  },

  // --- Vegetables ---
  {
    id: "spinach",
    name: "Spinach",
    category: "vegetables",
    servingSize: "100g cooked",
    servingUnit: "g",
    baseQty: 100,
    macros: { calories: 23, protein: 3.0, carbs: 3.6, fat: 0.4, fiber: 2.4 },
    micros: { vitA: 105, vitC: 30, vitD: 0, vitE: 10, vitB12: 0, calcium: 10, iron: 15, zinc: 4, magnesium: 20, potassium: 12, folate: 37, omega3: 0.0 }
  },
  {
    id: "broccoli",
    name: "Broccoli",
    category: "vegetables",
    servingSize: "100g cooked",
    servingUnit: "g",
    baseQty: 100,
    macros: { calories: 35, protein: 2.4, carbs: 7.0, fat: 0.4, fiber: 3.3 },
    micros: { vitA: 10, vitC: 110, vitD: 0, vitE: 4, vitB12: 0, calcium: 4, iron: 4, zinc: 3, magnesium: 5, potassium: 7, folate: 15, omega3: 0.1 }
  },
  {
    id: "kale",
    name: "Kale",
    category: "vegetables",
    servingSize: "100g cooked",
    servingUnit: "g",
    baseQty: 100,
    macros: { calories: 35, protein: 2.9, carbs: 4.4, fat: 1.5, fiber: 4.1 },
    micros: { vitA: 130, vitC: 100, vitD: 0, vitE: 6, vitB12: 0, calcium: 13, iron: 6, zinc: 2, magnesium: 8, potassium: 8, folate: 10, omega3: 0.1 }
  },
  {
    id: "sweet_potato",
    name: "Sweet Potato",
    category: "vegetables",
    servingSize: "150g baked",
    servingUnit: "g",
    baseQty: 150,
    macros: { calories: 135, protein: 2.0, carbs: 31.0, fat: 0.2, fiber: 4.5 },
    micros: { vitA: 150, vitC: 25, vitD: 0, vitE: 4, vitB12: 0, calcium: 4, iron: 4, zinc: 3, magnesium: 6, potassium: 12, folate: 4, omega3: 0.0 }
  },
  {
    id: "mushrooms",
    name: "Mushrooms",
    category: "vegetables",
    servingSize: "100g",
    servingUnit: "g",
    baseQty: 100,
    macros: { calories: 22, protein: 3.0, carbs: 3.0, fat: 0.3, fiber: 1.0 },
    micros: { vitA: 0, vitC: 1, vitD: 20, vitE: 0, vitB12: 0, calcium: 1, iron: 3, zinc: 5, magnesium: 3, potassium: 9, folate: 4, omega3: 0.0 }
  },
  {
    id: "bell_peppers",
    name: "Bell Peppers",
    category: "vegetables",
    servingSize: "100g",
    servingUnit: "g",
    baseQty: 100,
    macros: { calories: 26, protein: 1.0, carbs: 6.0, fat: 0.2, fiber: 2.1 },
    micros: { vitA: 20, vitC: 150, vitD: 0, vitE: 8, vitB12: 0, calcium: 1, iron: 2, zinc: 1, magnesium: 3, potassium: 4, folate: 12, omega3: 0.0 }
  },
  {
    id: "carrots",
    name: "Carrots",
    category: "vegetables",
    servingSize: "100g",
    servingUnit: "g",
    baseQty: 100,
    macros: { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8 },
    micros: { vitA: 180, vitC: 7, vitD: 0, vitE: 3, vitB12: 0, calcium: 3, iron: 2, zinc: 2, magnesium: 3, potassium: 7, folate: 5, omega3: 0.0 }
  },
  {
    id: "moringa_leaves",
    name: "Moringa Leaves (Drumstick Leaves)",
    category: "vegetables",
    servingSize: "50g cooked",
    servingUnit: "g",
    baseQty: 50,
    macros: { calories: 32, protein: 4.5, carbs: 4.2, fat: 0.7, fiber: 1.5 },
    micros: { vitA: 60, vitC: 40, vitD: 0, vitE: 12, vitB12: 0, calcium: 18, iron: 12, zinc: 5, magnesium: 15, potassium: 6, folate: 10, omega3: 0.0 }
  },
  {
    id: "white_potato",
    name: "White Potato",
    category: "vegetables",
    servingSize: "150g baked",
    servingUnit: "g",
    baseQty: 150,
    macros: { calories: 141, protein: 3.2, carbs: 31.6, fat: 0.2, fiber: 3.5 },
    micros: { vitA: 0, vitC: 30, vitD: 0, vitE: 0, vitB12: 0, calcium: 2, iron: 7, zinc: 6, magnesium: 12, potassium: 18, folate: 12, omega3: 0.0 }
  },
  {
    id: "corn",
    name: "Sweet Corn",
    category: "vegetables",
    servingSize: "100g cooked",
    servingUnit: "g",
    baseQty: 100,
    macros: { calories: 96, protein: 3.4, carbs: 21.0, fat: 1.5, fiber: 2.4 },
    micros: { vitA: 9, vitC: 6, vitD: 0, vitE: 1, vitB12: 0, calcium: 1, iron: 3, zinc: 5, magnesium: 8, potassium: 5, folate: 12, omega3: 0.0 }
  },

  // --- Fruits ---
  {
    id: "banana",
    name: "Banana",
    category: "fruits",
    servingSize: "1 medium",
    servingUnit: "medium",
    baseQty: 1,
    macros: { calories: 105, protein: 1.3, carbs: 27.0, fat: 0.4, fiber: 3.0 },
    micros: { vitA: 1, vitC: 10, vitD: 0, vitE: 0, vitB12: 0, calcium: 1, iron: 1, zinc: 1, magnesium: 8, potassium: 10, folate: 6, omega3: 0.0 }
  },
  {
    id: "apple",
    name: "Apple",
    category: "fruits",
    servingSize: "1 medium",
    servingUnit: "medium",
    baseQty: 1,
    macros: { calories: 95, protein: 0.5, carbs: 25.0, fat: 0.3, fiber: 4.4 },
    micros: { vitA: 1, vitC: 8, vitD: 0, vitE: 1, vitB12: 0, calcium: 1, iron: 1, zinc: 0, magnesium: 2, potassium: 4, folate: 1, omega3: 0.0 }
  },
  {
    id: "orange",
    name: "Orange",
    category: "fruits",
    servingSize: "1 medium",
    servingUnit: "medium",
    baseQty: 1,
    macros: { calories: 62, protein: 1.2, carbs: 15.0, fat: 0.2, fiber: 3.1 },
    micros: { vitA: 4, vitC: 90, vitD: 0, vitE: 1, vitB12: 0, calcium: 4, iron: 1, zinc: 1, magnesium: 3, potassium: 5, folate: 10, omega3: 0.0 }
  },
  {
    id: "blueberries",
    name: "Blueberries",
    category: "fruits",
    servingSize: "100g",
    servingUnit: "g",
    baseQty: 100,
    macros: { calories: 57, protein: 0.7, carbs: 14.0, fat: 0.3, fiber: 2.4 },
    micros: { vitA: 1, vitC: 16, vitD: 0, vitE: 4, vitB12: 0, calcium: 1, iron: 2, zinc: 1, magnesium: 2, potassium: 2, folate: 2, omega3: 0.1 }
  },
  {
    id: "avocado",
    name: "Avocado",
    category: "fruits",
    servingSize: "100g",
    servingUnit: "g",
    baseQty: 100,
    macros: { calories: 160, protein: 2.0, carbs: 8.5, fat: 15.0, fiber: 6.7 },
    micros: { vitA: 3, vitC: 10, vitD: 0, vitE: 10, vitB12: 0, calcium: 1, iron: 3, zinc: 4, magnesium: 7, potassium: 10, folate: 20, omega3: 0.1 }
  },
  {
    id: "pomegranate",
    name: "Pomegranate",
    category: "fruits",
    servingSize: "100g",
    servingUnit: "g",
    baseQty: 100,
    macros: { calories: 83, protein: 1.7, carbs: 18.7, fat: 1.2, fiber: 4.0 },
    micros: { vitA: 0, vitC: 12, vitD: 0, vitE: 4, vitB12: 0, calcium: 1, iron: 2, zinc: 2, magnesium: 3, potassium: 5, folate: 10, omega3: 0.0 }
  },
  {
    id: "papaya",
    name: "Papaya",
    category: "fruits",
    servingSize: "150g",
    servingUnit: "g",
    baseQty: 150,
    macros: { calories: 60, protein: 0.8, carbs: 15.0, fat: 0.4, fiber: 2.5 },
    micros: { vitA: 15, vitC: 100, vitD: 0, vitE: 2, vitB12: 0, calcium: 3, iron: 1, zinc: 1, magnesium: 4, potassium: 5, folate: 10, omega3: 0.0 }
  }
];
```
