// src/services/ai/correlationEngine.js
const HealthData = require('../../models/HealthData');
const Correlation = require('../../models/Correlation');
const logger = require('../../utils/logger');
const mathUtils = require('../../utils/mathUtils');

class CorrelationEngine {
  constructor() {
    this.correlationThreshold = 0.6;
    this.minDataPoints = 10;
  }

  async findCorrelations(userId, timeRange = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRange);

      // Get all health data for user
      const healthData = await HealthData.find({
        userId,
        timestamp: { $gte: startDate }
      }).sort({ timestamp: 1 });

      if (healthData.length < this.minDataPoints) {
        logger.info(`Insufficient data for correlation analysis: ${healthData.length} points`);
        return [];
      }

      const correlations = [];
      const factorPairs = this.generateFactorPairs();

      for (const pair of factorPairs) {
        const correlation = await this.calculateCorrelation(healthData, pair);
        if (correlation && Math.abs(correlation.strength) >= this.correlationThreshold) {
          correlations.push(correlation);
        }
      }

      // Save significant correlations
      await this.saveCorrelations(userId, correlations);
      return correlations;

    } catch (error) {
      logger.error('Correlation analysis failed:', error);
      throw error;
    }
  }

  generateFactorPairs() {
    const factors = [
      'sleep.duration', 'sleep.quality', 'sleep.efficiency',
      'activity.steps', 'activity.activeMinutes', 'activity.calories',
      'mood.overall', 'mood.energy', 'mood.stress',
      'nutrition.calories', 'nutrition.protein', 'nutrition.water',
      'biometric.weight', 'biometric.restingHeartRate'
    ];

    const pairs = [];
    for (let i = 0; i < factors.length; i++) {
      for (let j = i + 1; j < factors.length; j++) {
        pairs.push({ primary: factors[i], secondary: factors[j] });
      }
    }
    return pairs;
  }

  async calculateCorrelation(healthData, factorPair) {
    try {
      const primaryValues = [];
      const secondaryValues = [];

      // Extract values for both factors
      for (const dataPoint of healthData) {
        const primaryValue = this.extractValue(dataPoint, factorPair.primary);
        const secondaryValue = this.extractValue(dataPoint, factorPair.secondary);

        if (primaryValue !== null && secondaryValue !== null) {
          primaryValues.push(primaryValue);
          secondaryValues.push(secondaryValue);
        }
      }

      if (primaryValues.length < this.minDataPoints) {
        return null;
      }

      // Calculate Pearson correlation
      const correlation = mathUtils.pearsonCorrelation(primaryValues, secondaryValues);
      const confidence = this.calculateConfidence(primaryValues.length, Math.abs(correlation));

      if (Math.abs(correlation) < this.correlationThreshold) {
        return null;
      }

      return {
        factors: factorPair,
        strength: correlation,
        confidence,
        significance: this.getSignificanceLevel(Math.abs(correlation)),
        direction: correlation > 0 ? 'positive' : 'negative',
        dataPoints: primaryValues.length,
        method: 'pearson'
      };

    } catch (error) {
      logger.error('Correlation calculation failed:', error);
      return null;
    }
  }

  extractValue(dataPoint, factorPath) {
    const keys = factorPath.split('.');
    let value = dataPoint;
    
    for (const key of keys) {
      if (value && value[key] !== undefined) {
        value = value[key];
      } else {
        return null;
      }
    }
    
    return typeof value === 'number' ? value : null;
  }

  calculateConfidence(dataPoints, correlationStrength) {
    // Confidence increases with more data points and stronger correlation
    const sampleSizeConfidence = Math.min(dataPoints / 50, 1);
    const strengthConfidence = correlationStrength;
    return (sampleSizeConfidence + strengthConfidence) / 2;
  }

  getSignificanceLevel(strength) {
    if (strength >= 0.8) return 'very-strong';
    if (strength >= 0.6) return 'strong';
    if (strength >= 0.4) return 'moderate';
    return 'weak';
  }

  async saveCorrelations(userId, correlations) {
    for (const corrData of correlations) {
      await Correlation.findOneAndUpdate(
        {
          userId,
          'factors.primary': corrData.factors.primary,
          'factors.secondary': corrData.factors.secondary
        },
        {
          ...corrData,
          userId,
          'analysis.dataPoints': corrData.dataPoints,
          'analysis.method': corrData.method,
          'metadata.computedAt': new Date(),
          'metadata.algorithm': 'correlation-engine-v1.0'
        },
        { upsert: true, new: true }
      );
    }
  }

  // Generate actionable insights from correlations
  async generateInsights(userId) {
    const correlations = await Correlation.find({ 
      userId, 
      'correlation.significance': { $in: ['strong', 'very-strong'] }
    });

    const insights = [];
    for (const corr of correlations) {
      const insight = this.createInsight(corr);
      if (insight) insights.push(insight);
    }

    return insights;
  }

  createInsight(correlation) {
    const { primary, secondary } = correlation.factors;
    const { strength, direction } = correlation.correlation;

    // Generate human-readable insights
    const insights = {
      'sleep.duration-mood.energy': {
        positive: `Your sleep duration strongly correlates with your energy levels. Getting adequate sleep could boost your daily energy by up to ${Math.round(strength * 30)}%.`,
        negative: `Longer sleep appears to decrease your energy levels. You might benefit from shorter, higher-quality sleep.`
      },
      'activity.steps-mood.overall': {
        positive: `Your daily steps have a strong positive impact on your mood. Aim for ${Math.round(8000 + strength * 2000)} steps for optimal mood.`,
        negative: `Excessive activity might be impacting your mood negatively. Consider balanced, moderate exercise.`
      },
      'nutrition.water-energy': {
        positive: `Hydration significantly affects your energy. Drinking ${Math.round(2 + strength)} liters daily could improve energy levels.`,
        negative: `Overhydration might be affecting your energy. Find your optimal water intake balance.`
      }
    };

    const key = `${primary}-${secondary}`;
    const template = insights[key];
    
    if (template) {
      return {
        description: template[direction],
        actionable: true,
        recommendation: this.generateRecommendation(correlation),
        potentialImpact: strength > 0.8 ? 'high' : strength > 0.6 ? 'medium' : 'low'
      };
    }

    return null;
  }

  generateRecommendation(correlation) {
    // Generate specific, actionable recommendations based on correlations
    const { primary, secondary } = correlation.factors;
    const { direction } = correlation.correlation;

    const recommendations = {
      'sleep.duration': direction === 'positive' ? 
        'Maintain consistent sleep schedule of 7-9 hours for optimal health benefits.' :
        'Focus on sleep quality over quantity. Try shorter, more restful sleep cycles.',
      
      'activity.steps': direction === 'positive' ?
        'Gradually increase daily steps by 500-1000 to enhance mood and energy.' :
        'Balance activity with adequate rest. Consider lower-impact exercises.',

      'nutrition.water': direction === 'positive' ?
        'Set hourly hydration reminders to maintain optimal water intake.' :
        'Monitor hydration levels and adjust based on activity and climate.'
    };

    return recommendations[primary] || 'Monitor this pattern and adjust accordingly.';
  }
}

module.exports = new CorrelationEngine();