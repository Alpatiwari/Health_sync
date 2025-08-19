const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  profile: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say']
    },
    height: Number, // cm
    weight: Number, // kg
    timezone: {
      type: String,
      default: 'UTC'
    }
  },

  preferences: {
    notificationSettings: {
      microMoments: { type: Boolean, default: true },
      insights: { type: Boolean, default: true },
      predictions: { type: Boolean, default: true },
      goals: { type: Boolean, default: true }
    },
    
    microMomentPreferences: {
      frequency: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      preferredTimes: [{
        start: String, // "09:00"
        end: String    // "18:00"
      }],
      excludeTimes: [{
        start: String,
        end: String
      }]
    },

    healthGoals: {
      primaryFocus: {
        type: String,
        enum: ['sleep', 'fitness', 'nutrition', 'mood', 'overall']
      },
      targetSleep: Number, // hours
      targetSteps: Number,
      targetWorkouts: Number // per week
    }
  },

  integrations: {
    fitbit: {
      connected: { type: Boolean, default: false },
      accessToken: String,
      refreshToken: String,
      lastSync: Date
    },
    googleFit: {
      connected: { type: Boolean, default: false },
      accessToken: String,
      refreshToken: String,
      lastSync: Date
    },
    appleHealth: {
      connected: { type: Boolean, default: false },
      deviceId: String,
      lastSync: Date
    }
  },

  healthScore: {
    current: { type: Number, default: 50 },
    trend: { type: String, enum: ['improving', 'stable', 'declining'] },
    lastCalculated: Date
  },

  aiProfile: {
    personalityType: String, // Determined by AI
    optimalMicroMomentTiming: [String], // AI-determined best times
    responsePatterns: mongoose.Schema.Types.Mixed, // How user responds to different interventions
    correlationStrengths: mongoose.Schema.Types.Mixed // User's unique correlation patterns
  }
}, {
  timestamps: true
});

// Password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);