const mongoose = require('mongoose');

const correlationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  factors: {
    primary: {
      type: String,
      required: true // e.g., 'sleep.duration'
    },
    secondary: {
      type: String,
      required: true // e.g., 'mood.energy'
    }
  },

  correlation: {
    strength: {
      type: Number,
      min: -1,
      max: 1,
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    significance: {
      type: String,
      enum: ['weak', 'moderate', 'strong', 'very-strong'],
      required: true
    },
    direction: {
      type: String,
      enum: ['positive', 'negative'],
      required: true
    }
  },

  analysis: {
    dataPoints: Number, // Number of data points used
    timeRange: {
      start: Date,
      end: Date
    },
    method: {
      type: String,
      enum: ['pearson', 'spearman', 'kendall', 'mutual-information']
    },
    pValue: Number,
    adjustedR2: Number
  },

  insights: {
    description: String,
    actionable: Boolean,
    recommendation: String,
    potentialImpact: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  },

  validation: {
    status: {
      type: String,
      enum: ['discovered', 'validating', 'confirmed', 'rejected'],
      default: 'discovered'
    },
    confirmedBy: [String], // Methods that confirmed this correlation
    lastValidated: Date,
    stabilityScore: Number // How stable this correlation is over time
  },

  metadata: {
    algorithm: String,
    version: String,
    computedAt: { type: Date, default: Date.now },
    nextRecompute: Date
  }
}, {
  timestamps: true
});

correlationSchema.index({ userId: 1, 'correlation.strength': -1 });
correlationSchema.index({ 'factors.primary': 1, 'factors.secondary': 1 });

module.exports = mongoose.model('Correlation', correlationSchema);