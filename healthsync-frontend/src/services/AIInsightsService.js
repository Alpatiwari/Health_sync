import { api } from './api';

class AIInsightsService {
  // Get personalized recommendations
  async getRecommendations(userId, context = {}) {
    try {
      return await api.post('/ai-insights/recommendations', { userId, context });
    } catch (error) {
      throw new Error(`Failed to get recommendations: ${error.message}`);
    }
  }

  // Get correlations between metrics
  async getCorrelations(metrics = [], timeRange = 30) {
    try {
      const params = { metrics: metrics.join(','), days: timeRange };
      return await api.get('/ai-insights/correlations', params);
    } catch (error) {
      throw new Error(`Failed to get correlations: ${error.message}`);
    }
  }

  // Calculate specific correlation
  async calculateCorrelation(metric1, metric2, timeRange = 30) {
    try {
      const data = { metric1, metric2, timeRange };
      return await api.post('/ai-insights/correlations/calculate', data);
    } catch (error) {
      throw new Error(`Failed to calculate correlation: ${error.message}`);
    }
  }

  // Get predictions
  async getPredictions(metrics = [], horizon = 7) {
    try {
      const params = { metrics: metrics.join(','), horizon };
      return await api.get('/ai-insights/predictions', params);
    } catch (error) {
      throw new Error(`Failed to get predictions: ${error.message}`);
    }
  }

  // Generate prediction for specific metric
  async generatePrediction(metric, historicalData, horizon = 7) {
    try {
      const data = { metric, historicalData, horizon };
      return await api.post('/ai-insights/predictions/generate', data);
    } catch (error) {
      throw new Error(`Failed to generate prediction: ${error.message}`);
    }
  }

  // Update prediction accuracy
  async updatePredictionAccuracy(predictionId, actualValue) {
    try {
      const data = { actualValue };
      return await api.patch(`/ai-insights/predictions/${predictionId}/accuracy`, data);
    } catch (error) {
      throw new Error(`Failed to update prediction accuracy: ${error.message}`);
    }
  }

  // Get micro-moment suggestions
  async getMicroMomentSuggestions(userId, currentContext = {}) {
    try {
      return await api.post('/ai-insights/micro-moments', { userId, currentContext });
    } catch (error) {
      throw new Error(`Failed to get micro-moment suggestions: ${error.message}`);
    }
  }

  // Analyze patterns
  async analyzePatterns(metricType, dateRange = 30) {
    try {
      const params = { days: dateRange };
      return await api.get(`/ai-insights/patterns/${metricType}`, params);
    } catch (error) {
      throw new Error(`Failed to analyze patterns: ${error.message}`);
    }
  }

  // Get anomaly detection
  async detectAnomalies(metricType, sensitivity = 'medium') {
    try {
      const params = { sensitivity };
      return await api.get(`/ai-insights/anomalies/${metricType}`, params);
    } catch (error) {
      throw new Error(`Failed to detect anomalies: ${error.message}`);
    }
  }

  // Get health score
  async getHealthScore(userId, date = null) {
    try {
      const params = date ? { date } : {};
      return await api.get(`/ai-insights/health-score/${userId}`, params);
    } catch (error) {
      throw new Error(`Failed to get health score: ${error.message}`);
    }
  }

  // Get trend analysis
  async getTrendAnalysis(metrics, timeframe = 'month') {
    try {
      const data = { metrics, timeframe };
      return await api.post('/ai-insights/trends', data);
    } catch (error) {
      throw new Error(`Failed to get trend analysis: ${error.message}`);
    }
  }

  // Get goal progress analysis
  async getGoalProgress(goalId) {
    try {
      return await api.get(`/ai-insights/goals/${goalId}/progress`);
    } catch (error) {
      throw new Error(`Failed to get goal progress: ${error.message}`);
    }
  }

  // Get risk assessment
  async getRiskAssessment(userId, riskFactors = []) {
    try {
      const data = { userId, riskFactors };
      return await api.post('/ai-insights/risk-assessment', data);
    } catch (error) {
      throw new Error(`Failed to get risk assessment: ${error.message}`);
    }
  }

  // Generate insights report
  async generateInsightsReport(userId, reportType = 'weekly') {
    try {
      const data = { userId, reportType };
      return await api.post('/ai-insights/reports/generate', data);
    } catch (error) {
      throw new Error(`Failed to generate insights report: ${error.message}`);
    }
  }

  // Get behavioral insights
  async getBehavioralInsights(userId, timeRange = 30) {
    try {
      const params = { days: timeRange };
      return await api.get(`/ai-insights/behavioral/${userId}`, params);
    } catch (error) {
      throw new Error(`Failed to get behavioral insights: ${error.message}`);
    }
  }

  // Predict optimal timing
  async predictOptimalTiming(activity, userId) {
    try {
      const data = { activity, userId };
      return await api.post('/ai-insights/optimal-timing', data);
    } catch (error) {
      throw new Error(`Failed to predict optimal timing: ${error.message}`);
    }
  }

  // Get personalized alerts
  async getPersonalizedAlerts(userId) {
    try {
      return await api.get(`/ai-insights/alerts/${userId}`);
    } catch (error) {
      throw new Error(`Failed to get personalized alerts: ${error.message}`);
    }
  }
}

export const aiInsightsService = new AIInsightsService();
export default aiInsightsService;