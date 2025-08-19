const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  predictionType: {
    type: String,
    enum: ['energy', 'mood', 'sleep-quality', 'productivity', 'health-score'],
    required: true
  },

  timeframe: {
    targetDate: {
      type: Date,
      required: true,
      index: true
    },
    horizon: {
      type: String,
      enum: ['1-day', '3-day', '1-week', '1-month'],
      required: true
    }
  },

  prediction: {
    value: mongoose.Schema.Types.Mixed, // The actual prediction
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    range: {
      min: mongoose.Schema.Types.Mixed,
      max: mongoose.Schema.Types.Mixed
    }
  },

  factors: {
    primary: [String], // Most influential factors
    weights: mongoose.Schema.Types.Mixed, // Factor importance weights
    correlationsUsed: [mongoose.Schema.Types.ObjectId] // References to correlations
  },

  model: {
    algorithm: String,
    version: String,
    trainingData: {
      startDate: Date,
      endDate: Date,
      dataPoints: Number
    },
    accuracy: Number // Historical accuracy of this model type
  },

  validation: {
    actualValue: mongoose.Schema.Types.Mixed,
    actualDate: Date,
    accuracy: Number, // How close prediction was to actual
    validated: { type: Boolean, default: false }
  },

  actionableInsights: [{
    action: String,
    expectedImpact: Number,
    confidence: Number
  }]
}, {
  timestamps: true
});

predictionSchema.index({ userId: 1, 'timeframe.targetDate': 1 });
predictionSchema.index({ predictionType: 1, 'timeframe.targetDate': 1 });

module.exports = mongoose.model('Prediction', predictionSchema);