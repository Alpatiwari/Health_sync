import React, { useState, useEffect, useCallback } from 'react';
import { usePredictions } from '../hooks/usePredictions';
import { useCorrelations } from '../hooks/useCorrelations';
import CorrelationInsights from '../components/ai-insights/CorrelationInsights';
import PredictiveAnalysis from '../components/ai-insights/PredictiveAnalysis';
import MicroMomentSuggestions from '../components/ai-insights/MicroMomentSuggestions';
import PersonalizedRecommendations from '../components/ai-insights/PersonalizedRecommendations';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { aiInsightsService } from '../services/AIInsightsService';
import '../styles/components.css';

const Insights = () => {
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const { predictions, loading: predictionsLoading } = usePredictions();
  const { correlations, loading: correlationsLoading } = useCorrelations();

  const categories = [
    { value: 'all', label: 'All Insights', icon: '🔍' },
    { value: 'sleep', label: 'Sleep', icon: '😴' },
    { value: 'activity', label: 'Activity', icon: '🏃' },
    { value: 'nutrition', label: 'Nutrition', icon: '🥗' },
    { value: 'mood', label: 'Mood', icon: '😊' },
    { value: 'patterns', label: 'Patterns', icon: '📈' }
  ];

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      const response = await aiInsightsService.getPersonalizedInsights({
        category: selectedCategory,
        timeRange: '30d'
      });
      setInsights(response.insights || []);
      setRecommendations(response.recommendations || []);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      // Fallback to mock data
      setInsights(getMockInsights());
      setRecommendations(getMockRecommendations());
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const handleRefreshInsights = async () => {
    setRefreshing(true);
    await fetchInsights();
    setRefreshing(false);
  };

  const getMockInsights = () => [
    {
      id: 1,
      type: 'pattern',
      category: 'sleep',
      title: 'Sleep Quality Improves on Weekends',
      description: 'Your sleep quality is consistently 23% better on weekends compared to weekdays.',
      confidence: 0.89,
      impact: 'high',
      actionable: true,
      suggestion: 'Try maintaining your weekend sleep schedule on weekdays for better overall rest.',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      type: 'correlation',
      category: 'activity',
      title: 'Exercise Timing Affects Sleep',
      description: 'Morning workouts correlate with 18% better sleep quality compared to evening sessions.',
      confidence: 0.76,
      impact: 'medium',
      actionable: true,
      suggestion: 'Consider scheduling workouts earlier in the day for optimal sleep benefits.',
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      type: 'prediction',
      category: 'mood',
      title: 'Stress Levels May Rise This Week',
      description: 'Based on your patterns, stress levels might increase by 15% due to detected schedule changes.',
      confidence: 0.72,
      impact: 'medium',
      actionable: true,
      suggestion: 'Plan extra relaxation time and consider stress management techniques.',
      createdAt: new Date().toISOString()
    }
  ];

  const getMockRecommendations = () => [
    {
      id: 1,
      title: 'Optimize Your Morning Routine',
      description: 'Start your day with 5 minutes of light stretching to boost energy levels.',
      category: 'activity',
      priority: 'high',
      estimatedImpact: '+12% energy levels',
      timeCommitment: '5 minutes daily'
    },
    {
      id: 2,
      title: 'Hydration Reminder',
      description: 'Increase water intake by 200ml to improve afternoon focus.',
      category: 'nutrition',
      priority: 'medium',
      estimatedImpact: '+8% focus score',
      timeCommitment: '1 minute'
    }
  ];

  const getInsightIcon = (type) => {
    switch (type) {
      case 'pattern': return '📊';
      case 'correlation': return '🔗';
      case 'prediction': return '🔮';
      case 'anomaly': return '⚠️';
      default: return '💡';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return '#DC2626';
      case 'medium': return '#D97706';
      case 'low': return '#059669';
      default: return '#6B7280';
    }
  };

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory);

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  return (
    <div className="insights-page">
      <div className="page-header">
        <div className="header-content">
          <h1>AI Health Insights</h1>
          <p>Personalized insights and recommendations powered by AI analysis</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={handleRefreshInsights} 
            className="btn btn-primary"
            disabled={refreshing}
          >
            {refreshing ? '🔄' : '↻'} Refresh Insights
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map(category => (
          <button
            key={category.value}
            className={`category-btn ${selectedCategory === category.value ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.value)}
          >
            <span className="category-icon">{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>

      <div className="insights-grid">
        {/* Main Insights */}
        <div className="insights-section">
          <div className="section-header">
            <h2>Latest Insights</h2>
            <span className="insights-count">{filteredInsights.length} insights</span>
          </div>

          <div className="insights-list">
            {filteredInsights.map(insight => (
              <div key={insight.id} className="insight-card">
                <div className="insight-header">
                  <div className="insight-type">
                    <span className="type-icon">{getInsightIcon(insight.type)}</span>
                    <span className="type-label">{insight.type}</span>
                  </div>
                  <div className="insight-meta">
                    <span 
                      className="impact-badge"
                      style={{ backgroundColor: getImpactColor(insight.impact) }}
                    >
                      {insight.impact} impact
                    </span>
                    <span className="confidence-score">
                      {(insight.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>

                <h3 className="insight-title">{insight.title}</h3>
                <p className="insight-description">{insight.description}</p>

                {insight.actionable && (
                  <div className="insight-suggestion">
                    <div className="suggestion-header">
                      <span className="suggestion-icon">💡</span>
                      <strong>Suggestion:</strong>
                    </div>
                    <p>{insight.suggestion}</p>
                  </div>
                )}

                <div className="insight-actions">
                  <button className="btn btn-sm btn-outline">
                    View Details
                  </button>
                  <button className="btn btn-sm btn-outline">
                    Save Insight
                  </button>
                </div>
              </div>
            ))}

            {filteredInsights.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No insights found</h3>
                <p>We're analyzing your data to generate new insights. Check back later!</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Components Sidebar */}
        <div className="ai-components-sidebar">
          {/* Correlations */}
          <div className="component-section">
            {!correlationsLoading && correlations.length > 0 && (
              <CorrelationInsights correlations={correlations} />
            )}
          </div>

          {/* Predictions */}
          <div className="component-section">
            {!predictionsLoading && predictions.length > 0 && (
              <PredictiveAnalysis predictions={predictions} />
            )}
          </div>

          {/* Micro Moments */}
          <div className="component-section">
            <MicroMomentSuggestions />
          </div>
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className="recommendations-section">
        <div className="section-header">
          <h2>Personalized Recommendations</h2>
          <p>Action items tailored to your health patterns</p>
        </div>

        <div className="recommendations-grid">
          {recommendations.map(recommendation => (
            <div key={recommendation.id} className="recommendation-card">
              <div className="recommendation-header">
                <div className="rec-priority">
                  <span className={`priority-indicator priority-${recommendation.priority}`}>
                    {recommendation.priority}
                  </span>
                </div>
                <div className="rec-category">
                  {categories.find(c => c.value === recommendation.category)?.icon}
                </div>
              </div>

              <h3>{recommendation.title}</h3>
              <p>{recommendation.description}</p>

              <div className="rec-metrics">
                <div className="metric">
                  <label>Expected Impact</label>
                  <span className="metric-value">{recommendation.estimatedImpact}</span>
                </div>
                <div className="metric">
                  <label>Time Commitment</label>
                  <span className="metric-value">{recommendation.timeCommitment}</span>
                </div>
              </div>

              <div className="rec-actions">
                <button className="btn btn-primary btn-sm">
                  Try This
                </button>
                <button className="btn btn-outline btn-sm">
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>

        {recommendations.length === 0 && (
          <div className="empty-recommendations">
            <p>Generating personalized recommendations based on your health data...</p>
          </div>
        )}
      </div>

      {/* Full AI Components */}
      <div className="full-components">
        <PersonalizedRecommendations />
      </div>
    </div>
  );
};

export default Insights;