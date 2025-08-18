import React, { useState } from 'react';
import { useHealthData } from '../hooks/useHealthData';
import { useCorrelations } from '../hooks/useCorrelations';
import SleepChart from '../components/charts/SleepChart';
import ActivityChart from '../components/charts/ActivityChart';
import NutritionChart from '../components/charts/NutritionChart';
import CorrelationChart from '../components/charts/CorrelationChart';
import TrendAnalysis from '../components/charts/TrendAnalysis';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/components.css';

const Analytics = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedMetrics, setSelectedMetrics] = useState(['sleep', 'activity', 'nutrition']);
  const [activeTab, setActiveTab] = useState('trends');
  
  const { healthData, loading: dataLoading } = useHealthData(selectedTimeRange);
  const { correlations, loading: correlationLoading } = useCorrelations(selectedTimeRange);

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '365d', label: 'Last Year' }
  ];

  const metricOptions = [
    { value: 'sleep', label: 'Sleep Quality', color: '#4F46E5' },
    { value: 'activity', label: 'Physical Activity', color: '#059669' },
    { value: 'nutrition', label: 'Nutrition', color: '#DC2626' },
    { value: 'mood', label: 'Mood', color: '#7C2D12' },
    { value: 'stress', label: 'Stress Level', color: '#B91C1C' }
  ];

  const handleMetricToggle = (metric) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const handleExportData = () => {
    // Export analytics data as CSV
    const csvData = healthData.map(item => ({
      date: item.date,
      sleep_score: item.sleepScore,
      activity_minutes: item.activityMinutes,
      nutrition_score: item.nutritionScore,
      mood_rating: item.moodRating,
      stress_level: item.stressLevel
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `health-analytics-${selectedTimeRange}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (dataLoading || correlationLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Health Analytics</h1>
          <p>Deep dive into your health data trends and patterns</p>
        </div>
        <div className="header-actions">
          <button onClick={handleExportData} className="btn btn-outline">
            Export Data
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="analytics-controls">
        <div className="time-range-selector">
          <label>Time Range:</label>
          <select 
            value={selectedTimeRange} 
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="select-input"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="metrics-selector">
          <label>Metrics to Display:</label>
          <div className="metrics-checkboxes">
            {metricOptions.map(metric => (
              <label key={metric.value} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedMetrics.includes(metric.value)}
                  onChange={() => handleMetricToggle(metric.value)}
                />
                <span style={{ color: metric.color }}>●</span>
                {metric.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          Trends
        </button>
        <button 
          className={`tab-btn ${activeTab === 'correlations' ? 'active' : ''}`}
          onClick={() => setActiveTab('correlations')}
        >
          Correlations
        </button>
        <button 
          className={`tab-btn ${activeTab === 'detailed' ? 'active' : ''}`}
          onClick={() => setActiveTab('detailed')}
        >
          Detailed Analysis
        </button>
      </div>

      {/* Content Area */}
      <div className="analytics-content">
        {activeTab === 'trends' && (
          <div className="trends-section">
            <div className="chart-grid">
              <div className="chart-container">
                <TrendAnalysis 
                  data={healthData} 
                  metrics={selectedMetrics}
                  timeRange={selectedTimeRange}
                />
              </div>
            </div>
            
            <div className="individual-charts">
              {selectedMetrics.includes('sleep') && (
                <div className="chart-wrapper">
                  <SleepChart data={healthData} timeRange={selectedTimeRange} />
                </div>
              )}
              {selectedMetrics.includes('activity') && (
                <div className="chart-wrapper">
                  <ActivityChart data={healthData} timeRange={selectedTimeRange} />
                </div>
              )}
              {selectedMetrics.includes('nutrition') && (
                <div className="chart-wrapper">
                  <NutritionChart data={healthData} timeRange={selectedTimeRange} />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'correlations' && (
          <div className="correlations-section">
            <div className="section-header">
              <h2>Health Metric Correlations</h2>
              <p>Discover relationships between different aspects of your health</p>
            </div>
            
            <div className="correlation-grid">
              {correlations.map((correlation, index) => (
                <CorrelationChart 
                  key={index}
                  data={correlation}
                  timeRange={selectedTimeRange}
                />
              ))}
            </div>

            <div className="correlation-insights">
              <h3>Key Findings</h3>
              <div className="insight-cards">
                {correlations
                  .filter(c => Math.abs(c.strength) > 0.5)
                  .map((insight, index) => (
                    <div key={index} className="insight-card">
                      <div className="insight-strength">
                        <span className={`strength-indicator ${
                          insight.strength > 0.7 ? 'strong' : 
                          insight.strength > 0.3 ? 'moderate' : 'weak'
                        }`}>
                          {insight.strength > 0.7 ? 'Strong' : 
                           insight.strength > 0.3 ? 'Moderate' : 'Weak'} Correlation
                        </span>
                      </div>
                      <h4>{insight.metric1} & {insight.metric2}</h4>
                      <p>{insight.description}</p>
                      <div className="correlation-value">
                        r = {insight.strength.toFixed(2)}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {activeTab === 'detailed' && (
          <div className="detailed-section">
            <div className="section-header">
              <h2>Detailed Health Analysis</h2>
              <p>Comprehensive breakdown of your health metrics</p>
            </div>

            <div className="detailed-stats">
              <div className="stat-categories">
                {metricOptions
                  .filter(metric => selectedMetrics.includes(metric.value))
                  .map(metric => (
                    <div key={metric.value} className="stat-category">
                      <div className="category-header">
                        <span 
                          className="category-indicator"
                          style={{ backgroundColor: metric.color }}
                        ></span>
                        <h3>{metric.label}</h3>
                      </div>
                      
                      <div className="category-stats">
                        <div className="stat-item">
                          <label>Average</label>
                          <value>
                            {healthData.length > 0 && 
                             (healthData.reduce((sum, item) => 
                               sum + (item[metric.value + 'Score'] || item[metric.value] || 0), 0
                             ) / healthData.length).toFixed(1)
                            }
                          </value>
                        </div>
                        
                        <div className="stat-item">
                          <label>Best Day</label>
                          <value>
                            {healthData.length > 0 && 
                             Math.max(...healthData.map(item => 
                               item[metric.value + 'Score'] || item[metric.value] || 0
                             )).toFixed(1)
                            }
                          </value>
                        </div>
                        
                        <div className="stat-item">
                          <label>Trend</label>
                          <value className="trend-indicator">
                            {/* Calculate trend direction */}
                            {healthData.length > 1 && (
                              healthData[healthData.length - 1][metric.value + 'Score'] > 
                              healthData[0][metric.value + 'Score'] ? '↗️' : '↘️'
                            )}
                          </value>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            <div className="data-table">
              <h3>Raw Data</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      {selectedMetrics.map(metric => (
                        <th key={metric}>
                          {metricOptions.find(m => m.value === metric)?.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {healthData.slice(-20).reverse().map((item, index) => (
                      <tr key={index}>
                        <td>{new Date(item.date).toLocaleDateString()}</td>
                        {selectedMetrics.map(metric => (
                          <td key={metric}>
                            {item[metric + 'Score'] || item[metric] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;