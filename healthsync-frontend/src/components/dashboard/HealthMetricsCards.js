// src/components/dashboard/HealthMetricsCards.js
import React from 'react';
import {
  FiMoon,
  FiActivity,
  FiHeart,
  FiZap,
  FiSmile,
  FiDroplet
} from 'react-icons/fi';

const HealthMetricsCards = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="metrics-empty">
        No health data available. Connect your devices to start tracking.
      </div>
    );
  }

  const latest = data[data.length - 1];

  const metrics = [
    {
      title: 'Sleep',
      value: latest.sleep,
      unit: 'hours',
      icon: <FiMoon size={24} />,
      color: 'var(--accent-primary)'
    },
    {
      title: 'Steps',
      value: latest.steps.toLocaleString(),
      unit: 'steps',
      icon: <FiActivity size={24} />,
      color: 'var(--success)'
    },
    {
      title: 'Heart Rate',
      value: latest.heartRate,
      unit: 'bpm',
      icon: <FiHeart size={24} />,
      color: 'var(--error)'
    },
    {
      title: 'Energy',
      value: latest.energy,
      unit: '/10',
      icon: <FiZap size={24} />,
      color: 'var(--warning)'
    },
    {
      title: 'Mood',
      value: latest.mood,
      unit: '/10',
      icon: <FiSmile size={24} />,
      color: 'var(--accent-secondary)'
    },
    {
      title: 'Hydration',
      value: latest.water,
      unit: 'ml',
      icon: <FiDroplet size={24} />,
      color: '#3b82f6'
    }
  ];

  return (
    <div className="metrics-grid">
      {metrics.map((metric, index) => (
        <div key={index} className="metric-card">
          <div className="metric-icon" style={{ color: metric.color }}>
            {metric.icon}
          </div>
          <div className="metric-content">
            <h4 className="metric-title">{metric.title}</h4>
            <div className="metric-value">
              {metric.value} <span className="metric-unit">{metric.unit}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HealthMetricsCards;