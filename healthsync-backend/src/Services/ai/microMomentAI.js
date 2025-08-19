// src/services/ai/microMomentAI.js
const User = require('../../models/User');
const HealthData = require('../../models/HealthData');
const MicroMoment = require('../../models/MicroMoment');
const Correlation = require('../../models/Correlation');
const logger = require('../../utils/logger');

class MicroMomentAI {
  constructor() {
    this.defaultWindow = 30; // minutes
    this.maxMomentsPerDay = 8;
    this.minGapBetweenMoments = 60; // minutes
  }

  async scheduleMicroMoments(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Get user's current health state and patterns
      const currentState = await this.getCurrentHealthState(userId);
      const behaviorPatterns = await this.analyzeBehaviorPatterns(userId);
      const correlations = await this.getStrongCorrelations(userId);

      // Determine optimal timing windows
      const optimalWindows = await this.identifyOptimalWindows(userId, behaviorPatterns);

      // Generate micro-moments for the next 24 hours
      const microMoments = await this.generateMicroMoments(
        userId, 
        currentState, 
        correlations, 
        optimalWindows
      );

      // Schedule the micro-moments
      await this.scheduleMoments(microMoments);

      logger.info(`Scheduled ${microMoments.length} micro-moments for user ${userId}`);
      return microMoments;

    } catch (error) {
      logger.error('MicroMoment scheduling failed:', error);
      throw error;
    }
  }
  async getCurrentHealthState(userId) {
    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Get latest health data across all categories
      const latestData = await HealthData.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId), timestamp: { $gte: yesterday } } },
        { $sort: { timestamp: -1 } },
        { $group: {
          _id: '$dataType',
          latest: { $first: '$$ROOT' }
        }}
      ]);

      // Process into current state object
      const state = {
        timestamp: new Date(),
        sleep: null,
        activity: null,
        mood: null,
        nutrition: null,
        biometric: null,
        context: await this.getCurrentContext(userId)
      };

      latestData.forEach(item => {
        state[item._id] = item.latest[item._id];
      });

      return state;
    } catch (error) {
      logger.error('Failed to get current health state:', error);
      return null;
    }
  }

  async getCurrentContext(userId) {
    const now = new Date();
    const user = await User.findById(userId);
    
    return {
      timeOfDay: this.getTimeOfDay(now),
      dayOfWeek: now.getDay(),
      isWorkday: this.isWorkday(now),
      timezone: user?.profile?.timezone || 'UTC',
      weather: await this.getWeatherContext(user?.profile?.location)
    };
  }

  async analyzeBehaviorPatterns(userId) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get historical micro-moment responses
      const pastMoments = await MicroMoment.find({
        userId,
        createdAt: { $gte: thirtyDaysAgo },
        'response.acknowledged': true
      });

      // Analyze response patterns
      const patterns = {
        optimalTimes: this.findOptimalResponseTimes(pastMoments),
        preferredTypes: this.analyzePreferredTypes(pastMoments),
        responseRate: this.calculateResponseRate(pastMoments),
        effectivenessPatterns: this.analyzeEffectiveness(pastMoments)
      };

      return patterns;
    } catch (error) {
      logger.error('Behavior pattern analysis failed:', error);
      return this.getDefaultPatterns();
    }
  }

  findOptimalResponseTimes(moments) {
    const timeSlots = {};
    
    moments.forEach(moment => {
      if (moment.response.acknowledged) {
        const hour = new Date(moment.timing.scheduledFor).getHours();
        timeSlots[hour] = (timeSlots[hour] || 0) + 1;
      }
    });

    // Return top 3 most responsive hours
    return Object.entries(timeSlots)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  }

  async getStrongCorrelations(userId) {
    return await Correlation.find({
      userId,
      'correlation.significance': { $in: ['strong', 'very-strong'] },
      'validation.status': 'confirmed'
    }).limit(10);
  }

  async identifyOptimalWindows(userId, behaviorPatterns) {
    const user = await User.findById(userId);
    const preferences = user.preferences.microMomentPreferences;
    
    // Combine user preferences with AI-learned patterns
    const windows = [];
    const optimalHours = behaviorPatterns.optimalTimes;

    // Create 2-hour windows around optimal times
    for (const hour of optimalHours) {
      windows.push({
        start: hour - 1,
        end: hour + 1,
        confidence: behaviorPatterns.responseRate,
        type: 'learned'
      });
    }

    // Add user-preferred windows
    if (preferences.preferredTimes) {
      preferences.preferredTimes.forEach(timeWindow => {
        windows.push({
          start: parseInt(timeWindow.start.split(':')[0]),
          end: parseInt(timeWindow.end.split(':')[0]),
          confidence: 0.8,
          type: 'preference'
        });
      });
    }

    return this.mergeOverlappingWindows(windows);
  }

  async generateMicroMoments(userId, currentState, correlations, optimalWindows) {
    const moments = [];
    const now = new Date();

    for (const window of optimalWindows) {
      // Determine what type of micro-moment would be most beneficial
      const momentType = await this.selectOptimalMomentType(currentState, correlations);
      
      if (momentType) {
        const scheduledTime = this.calculateOptimalTime(now, window);
        const content = await this.generatePersonalizedContent(userId, momentType, currentState);
        
        moments.push({
          userId,
          type: momentType,
          timing: {
            scheduledFor: scheduledTime,
            optimalWindow: {
              start: new Date(scheduledTime.getTime() - 15 * 60000), // 15 min before
              end: new Date(scheduledTime.getTime() + 15 * 60000)     // 15 min after
            },
            aiConfidence: window.confidence
          },
          content,
          personalization: {
            basedOnCorrelations: correlations.map(c => c._id),
            userBehaviorPattern: JSON.stringify(currentState),
            contextFactors: this.extractContextFactors(currentState)
          }
        });
      }
    }

    return moments;
  }

  async selectOptimalMomentType(currentState, correlations) {
    // AI logic to select the most impactful micro-moment type
    const priorities = {
      'hydration-reminder': 0,
      'movement-break': 0,
      'breathing-exercise': 0,
      'mood-check': 0,
      'energy-boost': 0
    };

    // Analyze correlations to determine what would be most beneficial
    correlations.forEach(corr => {
      if (corr.factors.primary.includes('mood') && currentState.mood?.overall < 6) {
        priorities['breathing-exercise'] += corr.correlation.strength;
        priorities['movement-break'] += corr.correlation.strength * 0.8;
      }
      
      if (corr.factors.primary.includes('activity') && currentState.activity?.steps < 3000) {
        priorities['movement-break'] += corr.correlation.strength;
      }

      if (corr.factors.primary.includes('nutrition.water')) {
        priorities['hydration-reminder'] += corr.correlation.strength;
      }
    });

    // Return highest priority type
    const maxPriority = Math.max(...Object.values(priorities));
    return maxPriority > 0.3 ? Object.keys(priorities).find(key => priorities[key] === maxPriority) : null;
  }

  async generatePersonalizedContent(userId, momentType, currentState) {
    const user = await User.findById(userId);
    const firstName = user.profile.firstName || 'there';

    const contentTemplates = {
      'hydration-reminder': {
        title: `💧 Hydration Check`,
        message: `Hey ${firstName}! Your energy patterns suggest you perform better when well-hydrated. Time for a water break?`,
        actionRequired: 'Drink 250ml of water',
        duration: 60,
        difficulty: 'easy'
      },
      'movement-break': {
        title: `🏃‍♀️ Movement Moment`,
        message: `${firstName}, based on your activity correlations, a quick movement break could boost your mood by 15%!`,
        actionRequired: '2-minute walk or stretch',
        duration: 120,
        difficulty: 'easy'
      },
      'breathing-exercise': {
        title: `🧘 Mindful Moment`,
        message: `Hi ${firstName}! Your stress patterns suggest a breathing exercise would be perfect right now.`,
        actionRequired: '4-7-8 breathing technique (4 cycles)',
        duration: 180,
        difficulty: 'medium'
      },
      'mood-check': {
        title: `😊 Mood Check-in`,
        message: `Hey ${firstName}! Quick mood check - this helps our AI better understand your patterns.`,
        actionRequired: 'Rate your current mood (1-10)',
        duration: 30,
        difficulty: 'easy'
      },
      'energy-boost': {
        title: `⚡ Energy Boost`,
        message: `${firstName}, your energy typically dips now. Try this quick energizer!`,
        actionRequired: '10 jumping jacks or deep breaths',
        duration: 90,
        difficulty: 'medium'
      }
    };

    return contentTemplates[momentType] || contentTemplates['mood-check'];
  }

  async scheduleMoments(microMoments) {
    const scheduledMoments = [];

    for (const moment of microMoments) {
      try {
        const savedMoment = await MicroMoment.create(moment);
        scheduledMoments.push(savedMoment);
        
        // Queue notification for delivery
        await this.queueNotification(savedMoment);
      } catch (error) {
        logger.error('Failed to schedule micro-moment:', error);
      }
    }

    return scheduledMoments;
  }

  async queueNotification(microMoment) {
    // This would integrate with your notification service
    const notificationService = require('../notifications/microMomentTrigger');
    await notificationService.scheduleDelivery(microMoment);
  }

  // Helper methods
  getTimeOfDay(date) {
    const hour = date.getHours();
    if (hour < 6) return 'early-morning';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  isWorkday(date) {
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday to Friday
  }

  mergeOverlappingWindows(windows) {
    // Sort and merge overlapping time windows
    windows.sort((a, b) => a.start - b.start);
    const merged = [];

    for (const window of windows) {
      if (merged.length === 0 || merged[merged.length - 1].end < window.start) {
        merged.push(window);
      } else {
        merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, window.end);
        merged[merged.length - 1].confidence = Math.max(merged[merged.length - 1].confidence, window.confidence);
      }
    }

    return merged;
  }

  calculateOptimalTime(baseDate, window) {
    const targetHour = Math.floor((window.start + window.end) / 2);
    const scheduledTime = new Date(baseDate);
    scheduledTime.setHours(targetHour, Math.floor(Math.random() * 60), 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= baseDate) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    return scheduledTime;
  }

  extractContextFactors(currentState) {
    const factors = [];
    if (currentState.context.weather) factors.push(`weather-${currentState.context.weather.condition}`);
    if (currentState.context.isWorkday) factors.push('workday');
    factors.push(`time-${currentState.context.timeOfDay}`);
    return factors;
  }

  getDefaultPatterns() {
    return {
      optimalTimes: [9, 14, 16], // 9am, 2pm, 4pm
      preferredTypes: ['hydration-reminder', 'movement-break'],
      responseRate: 0.6,
      effectivenessPatterns: {}
    };
  }
}

module.exports = new MicroMomentAI();
