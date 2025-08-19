// src/services/ai/predictionModel.js
const HealthData = require('../../models/HealthData');
const Prediction = require('../../models/Prediction');
const Correlation = require('../../models/Correlation');
const logger = require('../../utils/logger');
const mathUtils = require('../../utils/mathUtils');

class PredictionModel {
  constructor() {
    this.models = {
      'energy': { weights: {}, accuracy: 0.75 },
      'mood': { weights: {}, accuracy: 0.72 },
      'sleep-quality': { weights: {}, accuracy: 0.78 },
      'productivity': { weights: {}, accuracy: 0.70 },
      'health-score': { weights: {}, accuracy: 0.73 }
    };
  }

  async generatePredictions(userId) {
    try {
      const predictions = [];
      const historicalData = await this.getHistoricalData(userId);
      const correlations = await this.getUserCorrelations(userId);

      if (historicalData.length < 7) {
        logger.warn(`Insufficient data for predictions: ${historicalData.length} days`);
        return [];
      }

      // Generate predictions for different timeframes
      for (const predictionType of Object.keys(this.models)) {
        const dayPrediction = await this.predictNextDay(userId, predictionType, historicalData, correlations);
        const weekPrediction = await this.predictNextWeek(userId, predictionType, historicalData, correlations);
        
        if (dayPrediction) predictions.push(dayPrediction);
        if (weekPrediction) predictions.push(weekPrediction);
      }

      await this.savePredictions(predictions);
      return predictions;

    } catch (error) {
      logger.error('Prediction generation failed:', error);
      throw error;
    }
  }

  async predictNextDay(userId, predictionType, historicalData, correlations) {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Feature extraction from historical data
      const features = this.extractFeatures(historicalData, predictionType, 1);
      
      // Apply correlation weights
      const correlationWeights = this.getCorrelationWeights(correlations, predictionType);
      
      // Simple weighted average prediction with trend analysis
      const prediction = this.calculatePrediction(features, correlationWeights);
      const confidence = this.calculateConfidence(features, this.models[predictionType].accuracy);

      return {
        userId,
        predictionType,
        timeframe: {
          targetDate: tomorrow,
          horizon: '1-day'
        },
        prediction: {
          value: prediction,
          confidence,
          range: {
            min: prediction * 0.85,
            max: prediction * 1.15
          }
        },
        factors: {
          primary: this.getPrimaryFactors(correlationWeights),
          weights: correlationWeights,
          correlationsUsed: correlations.map(c => c._id)
        },
        model: {
          algorithm: 'weighted-correlation-model',
          version: '1.0',
          accuracy: this.models[predictionType].accuracy
        },
        actionableInsights: this.generateActionableInsights(predictionType, prediction, features)
      };

    } catch (error) {
      logger.error(`Failed to predict ${predictionType} for next day:`, error);
      return null;
    }
  }

  async predictNextWeek(userId, predictionType, historicalData, correlations) {
    try {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const features = this.extractFeatures(historicalData, predictionType, 7);
      const trend = this.calculateTrend(historicalData, predictionType);
      const seasonality = this.calculateSeasonality(historicalData, predictionType);

      // More complex prediction for longer timeframe
      const basePrediction = this.calculatePrediction(features, this.getCorrelationWeights(correlations, predictionType));
      const trendAdjustedPrediction = basePrediction + (trend * 7);
      const finalPrediction = trendAdjustedPrediction + seasonality;

      return {
        userId,
        predictionType,
        timeframe: {
          targetDate: nextWeek,
          horizon: '1-week'
        },
        prediction: {
          value: finalPrediction,
          confidence: this.models[predictionType].accuracy * 0.85, // Lower confidence for longer horizon
          range: {
            min: finalPrediction * 0.75,
            max: finalPrediction * 1.25
          }
        },
        factors: {
          primary: this.getPrimaryFactors(this.getCorrelationWeights(correlations, predictionType)),
          weights: { trend, seasonality },
          correlationsUsed: correlations.map(c => c._id)
        },
        model: {
          algorithm: 'trend-seasonal-correlation-model',
          version: '1.0',
          accuracy: this.models[predictionType].accuracy * 0.85
        },
        actionableInsights: this.generateWeeklyInsights(predictionType, finalPrediction, trend)
      };

    } catch (error) {
      logger.error(`Failed to predict ${predictionType} for next week:`, error);
      return null;
    }
  }

  extractFeatures(historicalData, predictionType, horizon) {
    const recentData = historicalData.slice(-horizon * 3); // Use 3x the horizon for features
    const features = {
      recent_avg: 0,
      recent_trend: 0,
      variance: 0,
      momentum: 0
    };

    if (recentData.length === 0) return features;

    const values = recentData.map(d => this.extractPredictionValue(d, predictionType)).filter(v => v !== null);
    
    if (values.length > 0) {
      features.recent_avg = values.reduce((a, b) => a + b) / values.length;
      features.variance = mathUtils.calculateVariance(values);
      
      if (values.length > 1) {
        features.recent_trend = (values[values.length - 1] - values[0]) / values.length;
        features.momentum = values[values.length - 1] - features.recent_avg;
      }
    }

    return features;
  }

  extractPredictionValue(dataPoint, predictionType) {
    switch (predictionType) {
      case 'energy':
        return dataPoint.mood?.energy || null;
      case 'mood':
        return dataPoint.mood?.overall || null;
      case 'sleep-quality':
        return dataPoint.sleep?.quality || null;
      case 'productivity':
        return this.calculateProductivityScore(dataPoint);
      case 'health-score':
        return this.calculateHealthScore(dataPoint);
      default:
        return null;
    }
  }

  calculateProductivityScore(dataPoint) {
    // Simple productivity score based on multiple factors
    let score = 5; // baseline
    
    if (dataPoint.mood?.focus) score += (dataPoint.mood.focus - 5) * 0.3;
    if (dataPoint.mood?.energy) score += (dataPoint.mood.energy - 5) * 0.2;
    if (dataPoint.sleep?.quality) score += (dataPoint.sleep.quality - 5) * 0.2;
    if (dataPoint.activity?.activeMinutes) {
      const activeScore = Math.min(dataPoint.activity.activeMinutes / 30, 1) * 2;
      score += activeScore;
    }
    
    return Math.max(1, Math.min(10, score));
  }

  calculateHealthScore(dataPoint) {
    // Comprehensive health score
    let score = 5;
    let factors = 0;

    if (dataPoint.sleep?.quality) {
      score += (dataPoint.sleep.quality - 5) * 0.25;
      factors++;
    }
    if (dataPoint.mood?.overall) {
      score += (dataPoint.mood.overall - 5) * 0.2;
      factors++;
    }
    if (dataPoint.activity?.steps) {
      const stepsScore = Math.min(dataPoint.activity.steps / 8000, 1) * 2;
      score += stepsScore;
      factors++;
    }
    if (dataPoint.nutrition?.calories && dataPoint.nutrition.calories > 0) {
      // Assume 2000 calories is optimal
      const nutritionScore = 1 - Math.abs(dataPoint.nutrition.calories - 2000) / 2000;
      score += nutritionScore * 2;
      factors++;
    }

    return factors > 0 ? Math.max(1, Math.min(10, score)) : 5;
  }

  getCorrelationWeights(correlations, predictionType) {
    const weights = {};
    
    correlations.forEach(corr => {
      const targetFactor = this.getTargetFactor(predictionType);
      
      if (corr.factors.secondary.includes(targetFactor) || corr.factors.primary.includes(targetFactor)) {
        const factorName = corr.factors.primary.includes(targetFactor) ? 
          corr.factors.secondary : corr.factors.primary;
        weights[factorName] = corr.correlation.strength * corr.correlation.confidence;
      }
    });

    return weights;
  }

  getTargetFactor(predictionType) {
    const factorMapping = {
      'energy': 'mood.energy',
      'mood': 'mood.overall',
      'sleep-quality': 'sleep.quality',
      'productivity': 'mood.focus',
      'health-score': 'overall'
    };
    return factorMapping[predictionType] || 'mood.overall';
  }

  calculatePrediction(features, weights) {
    let prediction = features.recent_avg;
    
    // Apply trend
    prediction += features.recent_trend * 2;
    
    // Apply momentum
    prediction += features.momentum * 0.3;
    
    // Apply correlation weights (simplified)
    const weightSum = Object.values(weights).reduce((a, b) => a + Math.abs(b), 0);
    if (weightSum > 0) {
      const weightedAdjustment = Object.values(weights).reduce((sum, weight) => sum + weight, 0) / weightSum;
      prediction += weightedAdjustment * features.recent_avg * 0.2;
    }

    return Math.max(1, Math.min(10, prediction));
  }

  calculateConfidence(features, baseAccuracy) {
    let confidence = baseAccuracy;
    
    // Lower confidence if high variance
    if (features.variance > 2) {
      confidence *= 0.8;
    }
    
    // Higher confidence if stable trend
    if (Math.abs(features.recent_trend) < 0.1) {
      confidence *= 1.1;
    }

    return Math.max(0.3, Math.min(1, confidence));
  }

  calculateTrend(historicalData, predictionType) {
    const values = historicalData
      .map(d => this.extractPredictionValue(d, predictionType))
      .filter(v => v !== null);

    if (values.length < 3) return 0;

    // Simple linear trend
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return isNaN(slope) ? 0 : slope;
  }

  calculateSeasonality(historicalData, predictionType) {
    // Simple day-of-week seasonality
    const dayOfWeek = new Date().getDay();
    const sameDayData = historicalData.filter(d => new Date(d.timestamp).getDay() === dayOfWeek);
    
    if (sameDayData.length < 2) return 0;

    const sameDayValues = sameDayData
      .map(d => this.extractPredictionValue(d, predictionType))
      .filter(v => v !== null);

    const allValues = historicalData
      .map(d => this.extractPredictionValue(d, predictionType))
      .filter(v => v !== null);

    if (sameDayValues.length === 0 || allValues.length === 0) return 0;

    const sameDayAvg = sameDayValues.reduce((a, b) => a + b) / sameDayValues.length;
    const overallAvg = allValues.reduce((a, b) => a + b) / allValues.length;

    return sameDayAvg - overallAvg;
  }

  generateActionableInsights(predictionType, prediction, features) {
    const insights = [];
    
    if (prediction < 5) {
      insights.push({
        action: this.getLowPredictionAction(predictionType),
        expectedImpact: 0.7,
        confidence: 0.8
      });
    }

    if (features.recent_trend < -0.2) {
      insights.push({
        action: this.getNegativeTrendAction(predictionType),
        expectedImpact: 0.6,
        confidence: 0.7
      });
    }

    return insights;
  }

  getLowPredictionAction(predictionType) {
    const actions = {
      'energy': 'Consider going to bed 30 minutes earlier tonight to boost tomorrow\'s energy',
      'mood': 'Plan a mood-boosting activity like a walk or calling a friend',
      'sleep-quality': 'Create a relaxing bedtime routine 1 hour before sleep',
      'productivity': 'Schedule your most important tasks for your peak energy hours',
      'health-score': 'Focus on hydration and movement throughout the day'
    };
    return actions[predictionType] || 'Focus on healthy habits today';
  }

  getNegativeTrendAction(predictionType) {
    const actions = {
      'energy': 'Your energy trend is declining. Consider evaluating sleep and stress levels',
      'mood': 'Mood patterns show a downward trend. Consider mindfulness or social activities',
      'sleep-quality': 'Sleep quality is declining. Review your evening routine and sleep environment',
      'productivity': 'Productivity is trending down. Consider time blocking and reducing distractions',
      'health-score': 'Overall health trend needs attention. Review all health factors'
    };
    return actions[predictionType] || 'Monitor this trend and consider lifestyle adjustments';
  }

  async getHistoricalData(userId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await HealthData.find({
      userId,
      timestamp: { $gte: thirtyDaysAgo }
    }).sort({ timestamp: 1 });
  }

  async getUserCorrelations(userId) {
    return await Correlation.find({
      userId,
      'correlation.significance': { $in: ['moderate', 'strong', 'very-strong'] }
    });
  }

  async savePredictions(predictions) {
    for (const pred of predictions) {
      await Prediction.create(pred);
    }
  }

  getPrimaryFactors(weights) {
    return Object.entries(weights)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 3)
      .map(([factor]) => factor);
  }

  generateWeeklyInsights(predictionType, prediction, trend) {
    const insights = [];
    
    if (trend > 0.1) {
      insights.push({
        action: `${predictionType} is trending positively. Maintain current habits`,
        expectedImpact: 0.8,
        confidence: 0.9
      });
    } else if (trend < -0.1) {
      insights.push({
        action: this.getNegativeTrendAction(predictionType),
        expectedImpact: 0.7,
        confidence: 0.8
      });
    }

    return insights;
  }
}

module.exports = new PredictionModel();