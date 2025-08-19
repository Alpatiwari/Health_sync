const mongoose = require('mongoose');

const microMomentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  type: {
    type: String,
    enum: [
      'hydration-reminder',
      'movement-break',
      'breathing-exercise',
      'posture-check',
      'energy-boost',
      'mood-check',
      'sleep-preparation',
      'nutrition-timing',
      'stress-relief',
      'focus-enhancement'
    ],
    required: true
  },

  timing: {
    scheduledFor: {
      type: Date,
      required: true,
      index: true
    },
    optimalWindow: {
      start: Date,
      end: Date
    },
    aiConfidence: { type: Number, min: 0, max: 1 } // How confident AI is in timing
  },

  content: {
    title: String,
    message: String,
    actionRequired: String,
    duration: Number, // seconds
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'challenging']
    }
  },

  personalization: {
    basedOnCorrelations: [String], // Which correlations influenced this
    userBehaviorPattern: String,
    contextFactors: [String], // weather, schedule, etc.
    adaptedFromPrevious: mongoose.Schema.Types.ObjectId // Previous micro-moment this adapted from
  },

  delivery: {
    sent: { type: Boolean, default: false },
    sentAt: Date,
    channel: {
      type: String,
      enum: ['push', 'email', 'sms', 'in-app']
    },
    deviceType: String
  },

  response: {
    acknowledged: { type: Boolean, default: false },
    acknowledgedAt: Date,
    completed: { type: Boolean, default: false },
    completedAt: Date,
    rating: { type: Number, min: 1, max: 5 },
    feedback: String,
    effectiveness: Number // AI-calculated effectiveness score
  },

  analytics: {
    contextAtDelivery: mongoose.Schema.Types.Mixed,
    healthStatePreIntervention: mongoose.Schema.Types.Mixed,
    healthStatePostIntervention: mongoose.Schema.Types.Mixed,
    measuredImpact: Number // -1 to 1 scale
  }
}, {
  timestamps: true
});

microMomentSchema.index({ userId: 1, 'timing.scheduledFor': 1 });
microMomentSchema.index({ 'timing.scheduledFor': 1, 'delivery.sent': 1 });

module.exports = mongoose.model('MicroMoment', microMomentSchema);