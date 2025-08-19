const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  timestamp: {
    type: Date,
    required: true,
    index: true
  },

  dataType: {
    type: String,
    enum: ['sleep', 'activity', 'mood', 'nutrition', 'biometric'],
    required: true,
    index: true
  },

  source: {
    type: String,
    enum: ['manual', 'fitbit', 'google-fit', 'apple-health', 'oura', 'system'],
    default: 'manual'
  },

  // Sleep data
  sleep: {
    duration: Number, // hours
    quality: Number, // 1-10 scale
    deepSleep: Number, // hours
    remSleep: Number, // hours
    efficiency: Number, // percentage
    bedTime: Date,
    wakeTime: Date,
    restlessness: Number // 1-10 scale
  },

  // Activity data
  activity: {
    steps: Number,
    distance: Number, // km
    calories: Number,
    activeMinutes: Number,
    exerciseType: String,
    exerciseDuration: Number, // minutes
    intensity: {
      type: String,
      enum: ['low', 'moderate', 'high']
    },
    heartRateZones: {
      resting: Number,
      fat_burn: Number,
      cardio: Number,
      peak: Number
    }
  },

  // Mood data
  mood: {
    overall: { type: Number, min: 1, max: 10 }, // Overall mood score
    energy: { type: Number, min: 1, max: 10 },
    stress: { type: Number, min: 1, max: 10 },
    anxiety: { type: Number, min: 1, max: 10 },
    happiness: { type: Number, min: 1, max: 10 },
    focus: { type: Number, min: 1, max: 10 },
    notes: String,
    triggers: [String] // What affected mood
  },

  // Nutrition data
  nutrition: {
    calories: Number,
    protein: Number, // grams
    carbs: Number,
    fat: Number,
    fiber: Number,
    water: Number, // liters
    meals: [{
      type: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
      time: Date,
      calories: Number,
      description: String
    }],
    supplements: [String]
  },

  // Biometric data
  biometric: {
    weight: Number, // kg
    bodyFat: Number, // percentage
    muscleMass: Number, // kg
    restingHeartRate: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    temperature: Number, // celsius
    oxygenSaturation: Number // percentage
  },

  // Context data (for AI correlation analysis)
  context: {
    weather: {
      temperature: Number,
      humidity: Number,
      condition: String
    },
    location: String,
    workday: Boolean,
    specialEvents: [String]
  },

  // AI-processed flags
  processed: {
    correlationAnalysis: { type: Boolean, default: false },
    patternRecognition: { type: Boolean, default: false },
    predictionInput: { type: Boolean, default: false }
  },

  quality: {
    score: { type: Number, min: 0, max: 1 }, // Data quality score (0-1)
    flags: [String] // Quality issues identified
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
healthDataSchema.index({ userId: 1, timestamp: -1 });
healthDataSchema.index({ userId: 1, dataType: 1, timestamp: -1 });
healthDataSchema.index({ timestamp: -1, processed: 1 });

module.exports = mongoose.model('HealthData', healthDataSchema);