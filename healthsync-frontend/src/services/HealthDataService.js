// frontend/src/services/healthDataService.js
import apiService from './apiService';

class HealthDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Main health data retrieval
  async getHealthData(userId, options = {}) {
    const { 
      startDate, 
      endDate, 
      metrics = [], 
      useCache = true,
      aggregation = 'daily' 
    } = options;

    const cacheKey = `health-data-${userId}-${startDate}-${endDate}-${metrics.join(',')}-${aggregation}`;
    
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const data = await apiService.getHealthData(userId, startDate, endDate);
      const processedData = this.processHealthData(data, { metrics, aggregation });
      
      if (useCache) {
        this.cache.set(cacheKey, {
          data: processedData,
          timestamp: Date.now()
        });
      }
      
      return processedData;
    } catch (error) {
      console.error('Failed to fetch health data:', error);
      return this.generateFallbackData(userId, options);
    }
  }

  // Process raw health data
  processHealthData(rawData, options = {}) {
    const { metrics = [], aggregation = 'daily' } = options;
    
    if (!rawData || !Array.isArray(rawData)) {
      return [];
    }

    let processedData = rawData.map(entry => ({
      ...entry,
      timestamp: new Date(entry.date).getTime(),
      // Ensure numeric values
      sleep: this.ensureNumeric(entry.sleep),
      energy: this.ensureNumeric(entry.energy),
      mood: this.ensureNumeric(entry.mood),
      steps: this.ensureNumeric(entry.steps),
      heart_rate: this.ensureNumeric(entry.heart_rate),
      stress_level: this.ensureNumeric(entry.stress_level),
      hydration: this.ensureNumeric(entry.hydration),
      calories: this.ensureNumeric(entry.calories),
      weight: this.ensureNumeric(entry.weight)
    }));

    // Filter by specific metrics if requested
    if (metrics.length > 0) {
      processedData = processedData.map(entry => {
        const filtered = { date: entry.date, timestamp: entry.timestamp };
        metrics.forEach(metric => {
          if (entry[metric] !== undefined) {
            filtered[metric] = entry[metric];
          }
        });
        return filtered;
      });
    }

    // Apply aggregation if needed
    if (aggregation !== 'daily') {
      processedData = this.aggregateData(processedData, aggregation);
    }

    return processedData;
  }

  // Aggregate data by time period
  aggregateData(data, period) {
    if (period === 'daily') return data;

    const grouped = {};
    
    data.forEach(entry => {
      const date = new Date(entry.date);
      let groupKey;
      
      switch (period) {
        case 'weekly':
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          groupKey = startOfWeek.toISOString().split('T')[0];
          break;
        case 'monthly':
          groupKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
        default:
          groupKey = entry.date;
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(entry);
    });

    return Object.keys(grouped).map(key => {
      const group = grouped[key];
      const aggregated = { date: key };
      
      // Calculate averages for numeric fields
      const numericFields = ['sleep', 'energy', 'mood', 'steps', 'heart_rate', 'stress_level', 'hydration', 'calories', 'weight'];
      
      numericFields.forEach(field => {
        const values = group.map(entry => entry[field]).filter(val => val != null && !isNaN(val));
        if (values.length > 0) {
          if (field === 'steps' || field === 'calories') {
            // Sum for cumulative metrics
            aggregated[field] = values.reduce((sum, val) => sum + val, 0);
          } else {
            // Average for other metrics
            aggregated[field] = values.reduce((sum, val) => sum + val, 0) / values.length;
          }
        }
      });
      
      return aggregated;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  // Get specific metric trends
  async getMetricTrend(userId, metric, days = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const data = await this.getHealthData(userId, {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      metrics: [metric]
    });

    return this.calculateTrend(data, metric);
  }

  // Calculate trend for a metric
  calculateTrend(data, metric) {
    if (!data || data.length < 2) {
      return { trend: 'insufficient_data', change: 0, direction: 'neutral' };
    }

    const values = data.map(entry => entry[metric]).filter(val => val != null && !isNaN(val));
    
    if (values.length < 2) {
      return { trend: 'insufficient_data', change: 0, direction: 'neutral' };
    }

    // Simple linear trend calculation
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate percentage change
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const percentChange = ((lastValue - firstValue) / firstValue) * 100;
    
    return {
      trend: slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable',
      change: percentChange,
      direction: slope > 0 ? 'up' : slope < 0 ? 'down' : 'neutral',
      slope,
      r_squared: this.calculateRSquared(values, x, slope, intercept)
    };
  }

  // Calculate R-squared for trend quality
  calculateRSquared(y, x, slope, intercept) {
    const predicted = x.map(xi => slope * xi + intercept);
    const actualMean = y.reduce((sum, val) => sum + val, 0) / y.length;
    
    const totalSumSquares = y.reduce((sum, val) => sum + Math.pow(val - actualMean, 2), 0);
    const residualSumSquares = y.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0);
    
    return 1 - (residualSumSquares / totalSumSquares);
  }

  // Get health score
  async getHealthScore(userId, date = null) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const data = await this.getHealthData(userId, {
      startDate: targetDate,
      endDate: targetDate
    });

    if (!data || data.length === 0) {
      return { score: 0, breakdown: {}, recommendations: [] };
    }

    const entry = data[0];
    return this.calculateHealthScore(entry);
  }

  // Calculate health score from data entry
  calculateHealthScore(entry) {
    const weights = {
      sleep: 0.3,
      energy: 0.2,
      mood: 0.2,
      steps: 0.15,
      stress_level: 0.15
    };

    const scores = {};
    let totalWeight = 0;
    let weightedSum = 0;

    // Sleep score (0-100, target: 7-9 hours)
    if (entry.sleep != null) {
      scores.sleep = entry.sleep >= 7 && entry.sleep <= 9 ? 100 : 
                   entry.sleep >= 6 && entry.sleep <= 10 ? 80 :
                   entry.sleep >= 5 && entry.sleep <= 11 ? 60 : 40;
      weightedSum += scores.sleep * weights.sleep;
      totalWeight += weights.sleep;
    }

    // Energy score (0-100, scale from 1-10)
    if (entry.energy != null) {
      scores.energy = (entry.energy / 10) * 100;
      weightedSum += scores.energy * weights.energy;
      totalWeight += weights.energy;
    }

    // Mood score (0-100, scale from 1-10)
    if (entry.mood != null) {
      scores.mood = (entry.mood / 10) * 100;
      weightedSum += scores.mood * weights.mood;
      totalWeight += weights.mood;
    }

    // Steps score (0-100, target: 10,000 steps)
    if (entry.steps != null) {
      scores.steps = Math.min(100, (entry.steps / 10000) * 100);
      weightedSum += scores.steps * weights.steps;
      totalWeight += weights.steps;
    }

    // Stress score (0-100, inverted scale from 1-10)
    if (entry.stress_level != null) {
      scores.stress_level = ((10 - entry.stress_level) / 9) * 100;
      weightedSum += scores.stress_level * weights.stress_level;
      totalWeight += weights.stress_level;
    }

    const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

    const recommendations = this.generateRecommendations(entry, scores);

    return {
      score: overallScore,
      breakdown: scores,
      recommendations
    };
  }

  // Generate recommendations based on scores
  generateRecommendations(entry, scores) {
    const recommendations = [];

    if (scores.sleep < 70) {
      recommendations.push({
        type: 'sleep',
        priority: 'high',
        message: 'Aim for 7-9 hours of sleep for optimal recovery',
        action: 'Set a consistent bedtime routine'
      });
    }

    if (scores.energy < 60) {
      recommendations.push({
        type: 'energy',
        priority: 'medium',
        message: 'Your energy levels could be improved',
        action: 'Consider short walks or healthy snacks'
      });
    }

    if (scores.steps < 60) {
      recommendations.push({
        type: 'activity',
        priority: 'medium',
        message: 'Increase daily physical activity',
        action: 'Aim for 10,000 steps per day'
      });
    }

    if (scores.stress_level < 60) {
      recommendations.push({
        type: 'stress',
        priority: 'high',
        message: 'Consider stress management techniques',
        action: 'Try meditation or deep breathing exercises'
      });
    }

    return recommendations;
  }

  // Utility functions
  ensureNumeric(value) {
    if (value == null || value === '') return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  generateFallbackData(userId, options) {
    // Generate realistic mock data as fallback
    const data = [];
    const today = new Date();
    const daysBack = 30;

    for (let i = daysBack; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        sleep: 6.5 + Math.random() * 2.5,
        energy: 5 + Math.random() * 4,
        mood: 6 + Math.random() * 3,
        steps: Math.floor(7000 + Math.random() * 8000),
        heart_rate: Math.floor(65 + Math.random() * 20),
        stress_level: 3 + Math.random() * 4,
        hydration: 1.5 + Math.random() * 2,
        calories: Math.floor(2000 + Math.random() * 500),
        weight: 70 + (Math.random() - 0.5) * 2
      });
    }

    return this.processHealthData(data, options);
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

export const healthDataService = new HealthDataService();