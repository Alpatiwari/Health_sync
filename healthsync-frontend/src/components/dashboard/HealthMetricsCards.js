/ src/components/dashboard/HealthMetricsCards.js
import React from 'react';
import { formatNumber, getMetricTrend, getTrendColor } from '../../utils/dataProcessing';

const HealthMetricsCards = ({ data, timeRange }) => {
  const metrics = [
    {
      title: 'Average Sleep',
      value: data?.sleep?.average || 0,
      unit: 'hours',
      trend: getMetricTrend(data?.sleep?.trend),
      icon: 'sleep',
      color: 'blue',
    },
    {
      title: 'Steps Today',
      value: data?.activity?.steps || 0,
      unit: 'steps',
      trend: getMetricTrend(data?.activity?.stepsTrend),
      icon: 'steps',
      color: 'green',
    },
    {
      title: 'Heart Rate',
      value: data?.vitals?.heartRate || 0,
      unit: 'bpm',
      trend: getMetricTrend(data?.vitals?.heartRateTrend),
      icon: 'heart',
      color: 'red',
    },
    {
      title: 'Calories Burned',
      value: data?.activity?.calories || 0,
      unit: 'cal',
      trend: getMetricTrend(data?.activity?.caloriesTrend),
      icon: 'fire',
      color: 'orange',
    },
    {
      title: 'Water Intake',
      value: data?.nutrition?.water || 0,
      unit: 'ml',
      trend: getMetricTrend(data?.nutrition?.waterTrend),
      icon: 'water',
      color: 'cyan',
    },
    {
      title: 'Mood Score',
      value: data?.wellbeing?.mood || 0,
      unit: '/10',
      trend: getMetricTrend(data?.wellbeing?.moodTrend),
      icon: 'mood',
      color: 'purple',
    },
  ];

  const getIcon = (iconName) => {
    const iconClasses = "h-6 w-6";
    
    const icons = {
      sleep: (
        <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ),
      steps: (
        <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      heart: (
        <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      fire: (
        <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      ),
      water: (
        <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
      mood: (
        <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };

    return icons[iconName] || icons.heart;
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Health Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${getColorClasses(metric.color)}`}>
                {getIcon(metric.icon)}
              </div>
              <div className={`flex items-center text-sm ${getTrendColor(metric.trend)}`}>
                {metric.trend > 0 ? (
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                ) : metric.trend < 0 ? (
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                ) : null}
                {Math.abs(metric.trend)}%
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">
                  {formatNumber(metric.value)}
                </span>
                <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HealthMetricsCards;
