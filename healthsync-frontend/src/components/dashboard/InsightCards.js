// src/components/dashboard/InsightCards.js
import React, { useContext } from 'react';
import { HealthDataContext } from '../../context/HealthDataContext';

const InsightCards = ({ data, timeRange }) => {
  const insights = data?.insights || [];

  const getInsightIcon = (type) => {
    const iconClasses = "h-5 w-5";
    
    switch (type) {
      case 'correlation':
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'recommendation':
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      default:
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  if (!insights.length) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-gray-600">No insights available yet. Keep tracking your health data for personalized insights!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {insights.slice(0, 4).map((insight, index) => (
          <div key={index} className={`p-4 rounded-lg border-2 ${getPriorityColor(insight.priority)}`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {insight.title}
                </h3>
                <p className="text-sm text-gray-700 mb-2">
                  {insight.description}
                </p>
                {insight.actionable && (
                  <button className="text-xs bg-white text-gray-600 px-2 py-1 rounded border hover:bg-gray-50">
                    Take Action
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {insights.length > 4 && (
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All Insights ({insights.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default InsightCards;
