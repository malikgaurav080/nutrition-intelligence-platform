import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(value: Date) {
        const ageDifMs = Date.now() - value.getTime();
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        return age >= 8;
      },
      message: 'Age must be 8 years or older'
    }
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: [true, 'Gender is required']
  },
  height: {
    type: Number,
    required: [true, 'Height is required']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required']
  },
  activityLevel: {
    type: String,
    enum: ['Sedentary', 'Light', 'Moderate', 'Active', 'Athlete'],
    required: [true, 'Activity level is required']
  },
  pregnancyStatus: {
    isPregnant: {
      type: Boolean,
      default: false
    },
    isBreastfeeding: {
      type: Boolean,
      default: false
    }
  },
  primaryGoal: {
    type: String,
    enum: ['Fat Loss', 'Muscle Build', 'Maintain Weight', 'Athletic Performance', 'General Wellness'],
    required: [true, 'Primary goal is required']
  },
  healthPriorities: {
    type: [String],
    validate: {
      validator: function(val: string[]) {
        return val.length >= 1 && val.length <= 5;
      },
      message: 'Please select between 1 and 5 health priorities'
    },
    required: [true, 'Health priorities are required']
  },
  dietType: {
    type: String,
    enum: ['Pure Vegetarian', 'Lacto-Vegetarian', 'Ovo-Vegetarian', 'Vegan'],
    required: [true, 'Diet type is required']
  },
  dietaryRestrictions: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

export default mongoose.model('User', UserSchema);
