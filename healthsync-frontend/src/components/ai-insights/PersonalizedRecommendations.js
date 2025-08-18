import React, { useState, useEffect, useCallback } from 'react';
import { useHealthData } from '../../hooks/useHealthData';
import { aiInsightsService } from '../../services/AIInsightsService';
import LoadingSpinner from '../common/LoadingSpinner';
import '../../styles/components.css';

const PersonalizedRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [implementedRecs, setImplementedRecs] = useState(new Set());
  const [dismissedRecs, setDismissedRecs] = useState(new Set());
  const [expandedRec, setExpandedRec] = useState(null);
  
  const { healthData } = useHealthData('30d');

  const categories = [
    { value: 'all', label: 'All Recommendations', icon: '💡', color: '#6366F1' },
    { value: 'sleep', label: 'Sleep', icon: '😴', color: '#8B5CF6' },
    { value: 'activity', label: 'Exercise', icon: '🏃‍♀️', color: '#10B981' },
    { value: 'nutrition', label: 'Nutrition', icon: '🥗', color: '#F59E0B' },
    { value: 'mental', label: 'Mental Health', icon: '🧘‍♀️', color: '#EF4444' },
    { value: 'habits', label: 'Daily Habits', icon: '📅', color: '#06B6D4' }
  ];

  // Fixed: Wrap fetchRecommendations in useCallback with proper dependencies
  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock data function moved inside useCallback to avoid dependencies
      const getMockRecommendations = () => [
        {
          id: 'rec_001',
          category: 'sleep',
          priority: 'high',
          title: 'Optimize Your Sleep Schedule',
          description: 'Based on your sleep patterns, going to bed 30 minutes earlier could improve your sleep quality by 15%.',
          aiReasoning: 'Your data shows inconsistent bedtimes with better sleep quality on days when you sleep before 11 PM. Your average sleep latency is 18 minutes, which could be reduced with a consistent routine.',
          actionSteps: [
            'Set a consistent bedtime alarm 30 minutes before your target sleep time',
            'Create a wind-down routine starting 1 hour before bed',
            'Avoid screens 30 minutes before bedtime',
            'Keep your bedroom temperature between 65-68°F'
          ],
          estimatedImpact: {
            metric: 'Sleep Quality Score',
            improvement: '+15%',
            timeframe: '2 weeks'
          },
          difficulty: 'easy',
          timeCommitment: '30 minutes daily',
          scientificBasis: 'Studies show that consistent sleep schedules help regulate circadian rhythms, leading to improved sleep quality and duration.',
          personalizedFor: ['inconsistent_bedtime', 'poor_sleep_quality'],
          relatedMetrics: ['sleep_duration', 'sleep_efficiency', 'morning_energy'],
          successMetrics: {
            primary: 'Sleep quality score improvement',
            secondary: ['Reduced sleep latency', 'More consistent wake times']
          }
        },
        {
          id: 'rec_002',
          category: 'activity',
          priority: 'high',
          title: 'Morning Movement Boost',
          description: 'Adding 10 minutes of morning stretching could increase your daily energy levels by 20%.',
          aiReasoning: 'Your activity data shows lower energy levels on days with no morning movement. Correlation analysis indicates a strong relationship between morning activity and afternoon productivity.',
          actionSteps: [
            'Wake up 10 minutes earlier',
            'Perform 5 basic stretching exercises',
            'Include 2-3 minutes of light cardio',
            'Track energy levels throughout the day'
          ],
          estimatedImpact: {
            metric: 'Energy Level',
            improvement: '+20%',
            timeframe: '1 week'
          },
          difficulty: 'easy',
          timeCommitment: '10 minutes daily',
          scientificBasis: 'Morning exercise increases blood flow and releases endorphins, leading to sustained energy throughout the day.',
          personalizedFor: ['low_morning_energy', 'sedentary_mornings'],
          relatedMetrics: ['daily_energy', 'productivity_score', 'mood'],
          successMetrics: {
            primary: 'Increased morning energy ratings',
            secondary: ['Better mood scores', 'Higher activity levels']
          }
        },
        {
          id: 'rec_003',
          category: 'nutrition',
          priority: 'medium',
          title: 'Hydration Timing Optimization',
          description: 'Drinking water 30 minutes before meals could improve your digestion and energy levels.',
          aiReasoning: 'Your meal timing data and energy dips suggest dehydration may be affecting your post-meal energy. Optimal hydration timing can improve nutrient absorption.',
          actionSteps: [
            'Set reminders 30 minutes before main meals',
            'Drink 8-10 oz of water each time',
            'Track how you feel after meals',
            'Monitor afternoon energy levels'
          ],
          estimatedImpact: {
            metric: 'Post-meal Energy',
            improvement: '+12%',
            timeframe: '10 days'
          },
          difficulty: 'easy',
          timeCommitment: '2 minutes per meal',
          scientificBasis: 'Proper hydration before meals aids digestion and prevents post-meal fatigue caused by blood being diverted to digestive processes.',
          personalizedFor: ['post_meal_fatigue', 'low_water_intake'],
          relatedMetrics: ['hydration_level', 'energy_stability', 'digestive_comfort'],
          successMetrics: {
            primary: 'Reduced post-meal energy dips',
            secondary: ['Better hydration scores', 'Improved digestion ratings']
          }
        },
        {
          id: 'rec_004',
          category: 'mental',
          priority: 'medium',
          title: 'Stress-Break Micro-Moments',
          description: 'Taking 2-minute breathing breaks every 2 hours could reduce your stress levels by 25%.',
          aiReasoning: 'Your stress patterns show peaks during mid-morning and afternoon. Short, frequent breaks have been shown to be more effective than longer, infrequent ones for your stress profile.',
          actionSteps: [
            'Set hourly reminders for breathing breaks',
            'Practice 4-7-8 breathing technique',
            'Find a quiet space or use noise-canceling headphones',
            'Track stress levels before and after breaks'
          ],
          estimatedImpact: {
            metric: 'Stress Level',
            improvement: '-25%',
            timeframe: '1 week'
          },
          difficulty: 'easy',
          timeCommitment: '2 minutes every 2 hours',
          scientificBasis: 'Regular breathing exercises activate the parasympathetic nervous system, reducing cortisol levels and improving stress resilience.',
          personalizedFor: ['high_stress_periods', 'work_related_stress'],
          relatedMetrics: ['stress_level', 'heart_rate_variability', 'focus_score'],
          successMetrics: {
            primary: 'Lower average stress scores',
            secondary: ['Improved HRV', 'Better focus ratings']
          }
        },
        {
          id: 'rec_005',
          category: 'habits',
          priority: 'low',
          title: 'Digital Sunset Routine',
          description: 'Implementing a "digital sunset" 1 hour before bed could improve both sleep quality and morning mood.',
          aiReasoning: 'Screen time data correlates with poor sleep quality on 78% of your tracked days. Blue light exposure in the evening disrupts your natural circadian rhythm.',
          actionSteps: [
            'Set all devices to "Do Not Disturb" mode',
            'Use blue light filters or glasses',
            'Replace screen time with reading or gentle activities',
            'Charge devices outside the bedroom'
          ],
          estimatedImpact: {
            metric: 'Sleep Quality + Morning Mood',
            improvement: '+18% + +22%',
            timeframe: '2 weeks'
          },
          difficulty: 'medium',
          timeCommitment: 'Habit change, no extra time',
          scientificBasis: 'Blue light suppresses melatonin production, delaying sleep onset and reducing sleep quality. Digital detox before bed improves both sleep and next-day cognitive performance.',
          personalizedFor: ['evening_screen_time', 'poor_sleep_onset'],
          relatedMetrics: ['sleep_quality', 'morning_mood', 'sleep_latency'],
          successMetrics: {
            primary: 'Faster sleep onset times',
            secondary: ['Better morning mood', 'Improved sleep efficiency']
          }
        }
      ];

      // Try to fetch from AI service first, fall back to mock data
      try {
        const aiRecommendations = await aiInsightsService.getPersonalizedRecommendations({
          healthData,
          category: selectedCategory === 'all' ? null : selectedCategory,
          timeRange: '30d'
        });
        setRecommendations(aiRecommendations || getMockRecommendations());
      } catch (apiError) {
        console.log('Using mock recommendations as fallback');
        setRecommendations(getMockRecommendations());
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Fallback to mock data on error
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, healthData]); // Added proper dependencies

  // Fixed: Separate useEffect for initial load and user preferences
  useEffect(() => {
    const loadUserPreferences = () => {
      const implemented = JSON.parse(localStorage.getItem('implementedRecommendations') || '[]');
      const dismissed = JSON.parse(localStorage.getItem('dismissedRecommendations') || '[]');
      setImplementedRecs(new Set(implemented));
      setDismissedRecs(new Set(dismissed));
    };

    loadUserPreferences();
  }, []); // Empty dependency - only run on mount

  // Fixed: Separate useEffect for fetching recommendations
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]); // Now fetchRecommendations is stable

  const handleImplementRecommendation = (recId) => {
    const newImplemented = new Set([...implementedRecs, recId]);
    setImplementedRecs(newImplemented);
    localStorage.setItem('implementedRecommendations', JSON.stringify([...newImplemented]));
    
    // Track implementation for analytics
    aiInsightsService.trackRecommendationAction(recId, 'implemented');
  };

  const handleDismissRecommendation = (recId) => {
    const newDismissed = new Set([...dismissedRecs, recId]);
    setDismissedRecs(newDismissed);
    localStorage.setItem('dismissedRecommendations', JSON.stringify([...newDismissed]));
    
    // Track dismissal for analytics
    aiInsightsService.trackRecommendationAction(recId, 'dismissed');
  };

  const handleUndoImplementation = (recId) => {
    const newImplemented = new Set(implementedRecs);
    newImplemented.delete(recId);
    setImplementedRecs(newImplemented);
    localStorage.setItem('implementedRecommendations', JSON.stringify([...newImplemented]));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '🟢';
      case 'medium': return '🟡';
      case 'hard': return '🔴';
      default: return '⚪';
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedCategory === 'all') return true;
    return rec.category === selectedCategory;
  }).filter(rec => !dismissedRecs.has(rec.id));

  if (loading) {
    return (
      <div className="personalized-recommendations">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="personalized-recommendations">
      <div className="recommendations-header">
        <div className="header-content">
          <h2>🎯 Personalized Recommendations</h2>
          <p>AI-powered suggestions tailored specifically to your health patterns</p>
        </div>
        
        <div className="recommendations-stats">
          <div className="stat-item">
            <span className="stat-number">{recommendations.length}</span>
            <span className="stat-label">Total Recommendations</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{implementedRecs.size}</span>
            <span className="stat-label">Implemented</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {recommendations.filter(r => r.priority === 'high').length}
            </span>
            <span className="stat-label">High Priority</span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map(category => (
          <button
            key={category.value}
            className={`category-btn ${selectedCategory === category.value ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.value)}
            style={{
              '--category-color': category.color
            }}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-label">{category.label}</span>
            <span className="category-count">
              {category.value === 'all' 
                ? filteredRecommendations.length
                : recommendations.filter(r => r.category === category.value && !dismissedRecs.has(r.id)).length
              }
            </span>
          </button>
        ))}
      </div>

      {/* Recommendations Grid */}
      <div className="recommendations-grid">
        {filteredRecommendations.map(recommendation => (
          <div 
            key={recommendation.id} 
            className={`recommendation-card ${
              implementedRecs.has(recommendation.id) ? 'implemented' : ''
            } ${expandedRec === recommendation.id ? 'expanded' : ''}`}
          >
            {/* Card Header */}
            <div className="rec-header">
              <div className="rec-category-badge">
                <span className="category-icon">
                  {categories.find(c => c.value === recommendation.category)?.icon}
                </span>
                <span className="category-name">
                  {categories.find(c => c.value === recommendation.category)?.label}
                </span>
              </div>
              
              <div className="rec-metadata">
                <span 
                  className="priority-badge"
                  style={{ backgroundColor: getPriorityColor(recommendation.priority) }}
                >
                  {recommendation.priority}
                </span>
                <span className="difficulty-badge">
                  {getDifficultyIcon(recommendation.difficulty)}
                  {recommendation.difficulty}
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="rec-content">
              <h3 className="rec-title">{recommendation.title}</h3>
              <p className="rec-description">{recommendation.description}</p>

              {/* Impact Preview */}
              <div className="impact-preview">
                <div className="impact-metric">
                  <span className="metric-name">{recommendation.estimatedImpact.metric}</span>
                  <span className="metric-improvement">{recommendation.estimatedImpact.improvement}</span>
                </div>
                <div className="impact-details">
                  <span className="time-commitment">⏱️ {recommendation.timeCommitment}</span>
                  <span className="timeframe">📅 {recommendation.estimatedImpact.timeframe}</span>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedRec === recommendation.id && (
                <div className="expanded-content">
                  {/* AI Reasoning */}
                  <div className="ai-reasoning">
                    <h4>🧠 Why This Recommendation?</h4>
                    <p>{recommendation.aiReasoning}</p>
                  </div>

                  {/* Action Steps */}
                  <div className="action-steps">
                    <h4>📋 Action Steps</h4>
                    <ol>
                      {recommendation.actionSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Scientific Basis */}
                  <div className="scientific-basis">
                    <h4>🔬 Scientific Background</h4>
                    <p>{recommendation.scientificBasis}</p>
                  </div>

                  {/* Success Metrics */}
                  <div className="success-metrics">
                    <h4>📊 How to Measure Success</h4>
                    <div className="metrics-list">
                      <div className="primary-metric">
                        <strong>Primary:</strong> {recommendation.successMetrics.primary}
                      </div>
                      <div className="secondary-metrics">
                        <strong>Secondary:</strong>
                        <ul>
                          {recommendation.successMetrics.secondary.map((metric, index) => (
                            <li key={index}>{metric}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Card Actions */}
            <div className="rec-actions">
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setExpandedRec(
                  expandedRec === recommendation.id ? null : recommendation.id
                )}
              >
                {expandedRec === recommendation.id ? 'Show Less' : 'Learn More'}
              </button>

              {!implementedRecs.has(recommendation.id) ? (
                <>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleImplementRecommendation(recommendation.id)}
                  >
                    ✅ I'll Try This
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => handleDismissRecommendation(recommendation.id)}
                  >
                    ❌ Not For Me
                  </button>
                </>
              ) : (
                <div className="implemented-status">
                  <span className="status-badge">✅ Implemented</span>
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleUndoImplementation(recommendation.id)}
                  >
                    Undo
                  </button>
                </div>
              )}
            </div>

            {/* Implementation Status */}
            {implementedRecs.has(recommendation.id) && (
              <div className="implementation-overlay">
                <div className="implementation-message">
                  <span className="success-icon">🎉</span>
                  <span>Great choice! Track your progress to see the impact.</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredRecommendations.length === 0 && (
        <div className="empty-recommendations">
          <div className="empty-icon">🎯</div>
          <h3>No recommendations available</h3>
          <p>
            {selectedCategory === 'all' 
              ? "We're analyzing your data to generate personalized recommendations."
              : `No recommendations for ${categories.find(c => c.value === selectedCategory)?.label} category yet.`
            }
          </p>
          <button 
            className="btn btn-outline"
            onClick={() => setSelectedCategory('all')}
          >
            View All Categories
          </button>
        </div>
      )}

      {/* Implementation Progress */}
      {implementedRecs.size > 0 && (
        <div className="implementation-progress">
          <h3>🚀 Your Implementation Progress</h3>
          <div className="progress-stats">
            <div className="progress-item">
              <span className="progress-number">{implementedRecs.size}</span>
              <span className="progress-label">Recommendations Implemented</span>
            </div>
            <div className="progress-item">
              <span className="progress-number">
                {Math.round((implementedRecs.size / recommendations.length) * 100)}%
              </span>
              <span className="progress-label">Implementation Rate</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalizedRecommendations;