// src/components/ai-insights/MicroMomentSuggestions.js
import React, { useState, useEffect, useCallback } from 'react';

const MicroMomentSuggestions = ({ 
  userProfile = {}, 
  recentMetrics = [], 
  onSuggestionAction = () => {} 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completedSuggestions, setCompletedSuggestions] = useState(new Set());

  const generateSuggestions = useCallback(() => {
    const currentTime = new Date();
    const hour = currentTime.getHours();
    const mockSuggestions = [];

    // Time-based suggestions
    if (hour >= 6 && hour <= 9) {
      mockSuggestions.push({
        id: 'morning-hydration',
        type: 'hydration',
        title: 'Morning Hydration',
        description: 'Start your day with a glass of water to kickstart your metabolism.',
        priority: 'high',
        timeEstimate: '1 min',
        icon: '💧',
        category: 'wellness'
      });
    }

    if (hour >= 12 && hour <= 14) {
      mockSuggestions.push({
        id: 'lunch-walk',
        type: 'movement',
        title: 'Post-Lunch Walk',
        description: 'Take a 10-minute walk after lunch to aid digestion and boost energy.',
        priority: 'medium',
        timeEstimate: '10 min',
        icon: '🚶‍♂️',
        category: 'activity'
      });
    }

    // Activity-based suggestions
    const lastActivity = recentMetrics.find(m => m.type === 'activity');
    if (!lastActivity || (Date.now() - new Date(lastActivity.timestamp).getTime()) > 2 * 60 * 60 * 1000) {
      mockSuggestions.push({
        id: 'movement-break',
        type: 'movement',
        title: 'Movement Break',
        description: 'You\'ve been inactive for a while. Try some light stretching or a short walk.',
        priority: 'high',
        timeEstimate: '5 min',
        icon: '🤸‍♂️',
        category: 'activity'
      });
    }

    // Hydration suggestions
    const lastHydration = recentMetrics.find(m => m.type === 'hydration');
    if (!lastHydration || (Date.now() - new Date(lastHydration.timestamp).getTime()) > 2 * 60 * 60 * 1000) {
      mockSuggestions.push({
        id: 'hydration-reminder',
        type: 'hydration',
        title: 'Stay Hydrated',
        description: 'You haven\'t logged water intake recently. Consider drinking a glass of water.',
        priority: 'medium',
        timeEstimate: '1 min',
        icon: '💧',
        category: 'wellness'
      });
    }

    // Mindfulness suggestions
    if (hour >= 15 && hour <= 17) {
      mockSuggestions.push({
        id: 'afternoon-mindfulness',
        type: 'mindfulness',
        title: 'Mindful Moment',
        description: 'Take a few minutes for deep breathing to combat afternoon stress.',
        priority: 'low',
        timeEstimate: '3 min',
        icon: '🧘‍♀️',
        category: 'mental-health'
      });
    }

    // Sleep preparation
    if (hour >= 21) {
      mockSuggestions.push({
        id: 'sleep-prep',
        type: 'sleep',
        title: 'Sleep Preparation',
        description: 'Start winding down for better sleep quality. Consider reducing screen time.',
        priority: 'medium',
        timeEstimate: '5 min',
        icon: '🌙',
        category: 'sleep'
      });
    }

    // Filter out completed suggestions
    const activeSuggestions = mockSuggestions.filter(s => !completedSuggestions.has(s.id));
    
    setSuggestions(activeSuggestions);
    setLoading(false);
  }, [recentMetrics, completedSuggestions]);

  useEffect(() => {
    const timer = setTimeout(generateSuggestions, 1000);
    
    // Regenerate suggestions every 30 minutes
    const interval = setInterval(generateSuggestions, 30 * 60 * 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [generateSuggestions]);

  const handleSuggestionComplete = (suggestionId) => {
    setCompletedSuggestions(prev => new Set([...prev, suggestionId]));
    onSuggestionAction(suggestionId, 'completed');
  };

  const handleSuggestionDismiss = (suggestionId) => {
    setCompletedSuggestions(prev => new Set([...prev, suggestionId]));
    onSuggestionAction(suggestionId, 'dismissed');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4757';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#747d8c';
    }
  };

  if (loading) {
    return (
      <div className="micro-moment-suggestions loading">
        <div className="loading-spinner">Loading suggestions...</div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="micro-moment-suggestions empty">
        <div className="empty-state">
          <span className="empty-icon">✨</span>
          <p>Great job! You're on track with your health goals.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="micro-moment-suggestions">
      <div className="suggestions-header">
        <h3>Micro-Moment Suggestions</h3>
        <span className="suggestions-count">{suggestions.length} active</span>
      </div>
      
      <div className="suggestions-list">
        {suggestions.map((suggestion) => (
          <div 
            key={suggestion.id} 
            className={`suggestion-card priority-${suggestion.priority}`}
            style={{ borderLeftColor: getPriorityColor(suggestion.priority) }}
          >
            <div className="suggestion-header">
              <span className="suggestion-icon">{suggestion.icon}</span>
              <div className="suggestion-title-group">
                <h4 className="suggestion-title">{suggestion.title}</h4>
                <span className="suggestion-category">{suggestion.category}</span>
              </div>
              <span className="time-estimate">{suggestion.timeEstimate}</span>
            </div>
            
            <p className="suggestion-description">{suggestion.description}</p>
            
            <div className="suggestion-actions">
              <button 
                className="action-btn complete-btn"
                onClick={() => handleSuggestionComplete(suggestion.id)}
              >
                Complete
              </button>
              <button 
                className="action-btn dismiss-btn"
                onClick={() => handleSuggestionDismiss(suggestion.id)}
              >
                Not Now
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .micro-moment-suggestions {
          background: #fff;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin: 16px 0;
        }

        .suggestions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #eee;
        }

        .suggestions-header h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.2em;
        }

        .suggestions-count {
          background: #3498db;
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8em;
        }

        .suggestion-card {
          background: #f8f9fa;
          border-radius: 6px;
          padding: 16px;
          margin-bottom: 12px;
          border-left: 4px solid #ccc;
          transition: all 0.2s ease;
        }

        .suggestion-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transform: translateY(-1px);
        }

        .suggestion-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 8px;
        }

        .suggestion-icon {
          font-size: 1.5em;
        }

        .suggestion-title-group {
          flex: 1;
        }

        .suggestion-title {
          margin: 0;
          color: #2c3e50;
          font-size: 1em;
        }

        .suggestion-category {
          color: #7f8c8d;
          font-size: 0.8em;
          text-transform: uppercase;
        }

        .time-estimate {
          background: #e9ecef;
          color: #495057;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.8em;
        }

        .suggestion-description {
          color: #5a6c7d;
          margin: 8px 0 16px 0;
          line-height: 1.4;
        }

        .suggestion-actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9em;
          transition: background-color 0.2s;
        }

        .complete-btn {
          background: #27ae60;
          color: white;
        }

        .complete-btn:hover {
          background: #229f56;
        }

        .dismiss-btn {
          background: #95a5a6;
          color: white;
        }

        .dismiss-btn:hover {
          background: #7f8c8d;
        }

        .loading, .empty {
          text-align: center;
          padding: 40px;
          color: #7f8c8d;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .empty-icon {
          font-size: 2em;
        }

        .loading-spinner {
          color: #3498db;
        }

        @media (max-width: 768px) {
          .suggestion-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .suggestion-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default MicroMomentSuggestions;