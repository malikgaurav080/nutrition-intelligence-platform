import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendedItem {
  foodId: string;
  name: string;
  servingSize: string;
  servingUnit: string;
  baseQty: number;
  loggedQty: number;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  micros: {
    vitA: number;
    vitC: number;
    vitD: number;
    vitE: number;
    vitB12: number;
    calcium: number;
    iron: number;
    zinc: number;
    magnesium: number;
    potassium: number;
    folate: number;
    omega3: number;
  };
  reason: string;
}

export interface IRecommendedMeal {
  slot: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  items: IRecommendedItem[];
  totalCalories: number;
  totalProtein: number;
}

export interface IMealPlan extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  isActive: boolean;
  meals: IRecommendedMeal[];
  planDeficiencies: string[];
  adjustments: { type: string; text: string }[];
}

const RecommendedItemSchema = new Schema<IRecommendedItem>({
  foodId: { type: String, required: true },
  name: { type: String, required: true },
  servingSize: { type: String, required: true },
  servingUnit: { type: String, required: true },
  baseQty: { type: Number, required: true },
  loggedQty: { type: Number, required: true },
  macros: {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number, required: true }
  },
  micros: {
    vitA: { type: Number, required: true },
    vitC: { type: Number, required: true },
    vitD: { type: Number, required: true },
    vitE: { type: Number, required: true },
    vitB12: { type: Number, required: true },
    calcium: { type: Number, required: true },
    iron: { type: Number, required: true },
    zinc: { type: Number, required: true },
    magnesium: { type: Number, required: true },
    potassium: { type: Number, required: true },
    folate: { type: Number, required: true },
    omega3: { type: Number, required: true }
  },
  reason: { type: String, required: true }
});

const RecommendedMealSchema = new Schema<IRecommendedMeal>({
  slot: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
    required: true
  },
  items: {
    type: [RecommendedItemSchema],
    default: []
  },
  totalCalories: { type: Number, required: true },
  totalProtein: { type: Number, required: true }
});

const MealPlanSchema = new Schema<IMealPlan>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    required: true,
    default: false
  },
  meals: {
    type: [RecommendedMealSchema],
    default: []
  },
  planDeficiencies: {
    type: [String],
    default: []
  },
  adjustments: [{
    type: { type: String, required: true },
    text: { type: String, required: true }
  }]
}, {
  timestamps: true
});

export default mongoose.model<IMealPlan>('MealPlan', MealPlanSchema);
