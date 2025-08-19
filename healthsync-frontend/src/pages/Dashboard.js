// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  FiActivity,
  FiTrendingUp,
  FiHeart,
  FiAlertCircle,
  FiZap
} from 'react-icons/fi';
import HealthMetricsCards from '../components/dashboard/HealthMetricsCards';
import ActivityChart from '../components/charts/ActivityChart';
import TrendAnalysis from '../components/charts/TrendAnalysis';

const Dashboard = ({ healthData, predictions, correlations, user }) => {
  const [healthScore, setHealthScore] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (healthData && healthData.length) {
      const latest = healthData[healthData.length - 1];
      const score = Math.min(100, Math.max(0,
        (latest.sleep / 8 * 25) +
        (Math.min(latest.steps, 12000) / 12000 * 25) +
        (latest.energy / 10 * 25) +
        (latest.mood / 10 * 25)
      ));
      setHealthScore(Math.round(score));
    }
  }, [healthData]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome back, {user?.name || 'User'}</h1>
        <div className="health-score">
          <span className="score-value">{healthScore}</span>
          <span className="score-label">Health Score</span>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
        <button
          className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          AI Insights
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="dashboard-overview">
          <HealthMetricsCards data={healthData} />
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3 className="card-title">
                <FiActivity className="card-icon" /> Activity Trends
              </h3>
              <ActivityChart data={healthData} />
            </div>
            <div className="dashboard-card">
              <h3 className="card-title">
                <FiTrendingUp className="card-icon" /> Health Correlations
              </h3>
              <TrendAnalysis data={healthData} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="dashboard-activity">
          <div className="dashboard-card">
            <h3 className="card-title">
              <FiZap className="card-icon" /> Activity Details
            </h3>
            <div className="activity-metrics">
              {healthData && healthData.length > 0 && (
                <>
                  <div className="metric-item">
                    <span className="metric-label">Today's Steps</span>
                    <span className="metric-value">
                      {healthData[healthData.length - 1]?.steps || 0}
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Sleep Hours</span>
                    <span className="metric-value">
                      {healthData[healthData.length - 1]?.sleep || 0}h
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Energy Level</span>
                    <span className="metric-value">
                      {healthData[healthData.length - 1]?.energy || 0}/10
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="dashboard-insights">
          <div className="dashboard-card">
            <h3 className="card-title">
              <FiHeart className="card-icon" /> AI Health Insights
            </h3>
            <div className="insights-content">
              {correlations && correlations.length > 0 ? (
                correlations.map((correlation, index) => (
                  <div key={index} className="insight-item">
                    <div className="insight-icon">
                      <FiAlertCircle />
                    </div>
                    <div className="insight-content">
                      <h4>{correlation.title}</h4>
                      <p>{correlation.description}</p>
                      <span className="insight-strength">
                        Strength: {correlation.strength}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-insights">
                  <p>No correlations found yet. Add more health data to discover patterns!</p>
                </div>
              )}
              
              {predictions && predictions.length > 0 && (
                <div className="predictions-section">
                  <h4>Health Predictions</h4>
                  {predictions.map((prediction, index) => (
                    <div key={index} className="prediction-item">
                      <span className="prediction-metric">{prediction.metric}</span>
                      <span className="prediction-value">{prediction.predictedValue}</span>
                      <span className="prediction-confidence">
                        {prediction.confidence}% confidence
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;