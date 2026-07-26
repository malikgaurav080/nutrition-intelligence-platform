import mongoose, { Schema, Document } from 'mongoose';

export interface ILoggedMeal {
  slot: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'Pre-Workout' | 'Post-Workout';
  foodId: string;
  name: string;
  servingSize: string;
  servingUnit: string;
  baseQty: number;
  loggedQty: number; // serving multiplier
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
}

export interface IDailyLog extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  waterConsumed: number; // ml
  meals: ILoggedMeal[];
}

const LoggedMealSchema = new Schema<ILoggedMeal>({
  slot: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Pre-Workout', 'Post-Workout'],
    required: true
  },
  foodId: { type: String, required: true },
  name: { type: String, required: true },
  servingSize: { type: String, required: true },
  servingUnit: { type: String, required: true },
  baseQty: { type: Number, required: true },
  loggedQty: { type: Number, required: true, default: 1 },
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
  }
});

const DailyLogSchema = new Schema<IDailyLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: true,
    index: true
  },
  waterConsumed: {
    type: Number,
    required: true,
    default: 0
  },
  meals: {
    type: [LoggedMealSchema],
    default: []
  }
}, {
  timestamps: true
});

// Ensure a user can only have one log document per date
DailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IDailyLog>('DailyLog', DailyLogSchema);
