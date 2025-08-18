import React, { useMemo, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { calculateCorrelation } from '../../utils/dataProcessing';

const CorrelationChart = ({ 
  data, 
  xMetric, 
  yMetric, 
  timeRange = '30d',
  width = '100%',
  height = 400,
  showTrendLine = true,
  colorScheme = 'default'
}) => {
  const [selectedPoints, setSelectedPoints] = useState([]);

  // Color schemes for different correlation strengths
  const colorSchemes = {
    default: {
      strong: '#22c55e',
      moderate: '#f59e0b', 
      weak: '#ef4444',
      neutral: '#6b7280'
    },
    health: {
      strong: '#10b981',
      moderate: '#f59e0b',
      weak: '#f87171', 
      neutral: '#9ca3af'
    }
  };

  const colors = colorSchemes[colorScheme] || colorSchemes.default;

  // Process scatter plot data
  const scatterData = useMemo(() => {
    if (!data || !data.correlations) return [];
    
    return data.correlations.scatterData?.map((point, index) => ({
      x: point[xMetric] || 0,
      y: point[yMetric] || 0,
      date: point.date,
      id: index,
      // Additional metadata for tooltip
      sleepQuality: point.sleepQuality,
      stressLevel: point.stressLevel,
      activityLevel: point.activityLevel,
      mood: point.mood,
      ...point
    })) || [];
  }, [data, xMetric, yMetric]);

  // Calculate correlation coefficient
  const correlationStats = useMemo(() => {
    if (scatterData.length === 0) return null;
    
    const xValues = scatterData.map(d => d.x);
    const yValues = scatterData.map(d => d.y);
    
    const correlation = calculateCorrelation(xValues, yValues);
    
    return {
      coefficient: correlation,
      strength: getCorrelationStrength(correlation),
      direction: correlation > 0 ? 'positive' : 'negative',
      significance: getSignificanceLevel(Math.abs(correlation), scatterData.length)
    };
  }, [scatterData]);

  // Get correlation strength category
  const getCorrelationStrength = (correlation) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return 'strong';
    if (abs >= 0.4) return 'moderate';
    if (abs >= 0.2) return 'weak';
    return 'negligible';
  };

  // Get statistical significance
  const getSignificanceLevel = (correlation, n) => {
    if (n < 10) return 'insufficient data';
    if (correlation >= 0.7) return 'very significant';
    if (correlation >= 0.5) return 'significant';
    if (correlation >= 0.3) return 'moderate significance';
    return 'low significance';
  };

  // Get color for correlation strength
  const getPointColor = (correlation) => {
    const strength = getCorrelationStrength(correlation);
    return colors[strength] || colors.neutral;
  };

  // Calculate trend line data
  const trendLineData = useMemo(() => {
    if (!showTrendLine || scatterData.length < 2) return [];
    
    const xValues = scatterData.map(d => d.x);
    const yValues = scatterData.map(d => d.y);
    
    // Simple linear regression
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    
    return [
      { x: minX, y: slope * minX + intercept },
      { x: maxX, y: slope * maxX + intercept }
    ];
  }, [scatterData, showTrendLine]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="correlation-tooltip">
          <p className="tooltip-title">{`${formatMetricName(xMetric)} vs ${formatMetricName(yMetric)}`}</p>
          <p className="tooltip-value">{`${formatMetricName(xMetric)}: ${data.x.toFixed(2)}`}</p>
          <p className="tooltip-value">{`${formatMetricName(yMetric)}: ${data.y.toFixed(2)}`}</p>
          {data.date && <p className="tooltip-date">{`Date: ${new Date(data.date).toLocaleDateString()}`}</p>}
          {data.mood && <p className="tooltip-extra">{`Mood: ${data.mood}`}</p>}
          {data.stressLevel && <p className="tooltip-extra">{`Stress: ${data.stressLevel}/10`}</p>}
        </div>
      );
    }
    return null;
  };

  // Format metric names for display
  const formatMetricName = (metric) => {
    const names = {
      sleepHours: 'Sleep Duration',
      sleepQuality: 'Sleep Quality',
      stepsCount: 'Steps',
      heartRate: 'Heart Rate',
      stressLevel: 'Stress Level',
      mood: 'Mood Score',
      activityLevel: 'Activity Level',
      caloriesBurned: 'Calories Burned',
      exerciseMinutes: 'Exercise Minutes'
    };
    return names[metric] || metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  // Handle point click
  const handlePointClick = (data, index) => {
    setSelectedPoints(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  if (!scatterData.length) {
    return (
      <div className="correlation-chart-empty">
        <p>No correlation data available for the selected metrics and time range.</p>
      </div>
    );
  }

  return (
    <div className="correlation-chart-container">
      {/* Correlation Statistics Header */}
      {correlationStats && (
        <div className="correlation-stats">
          <div className="stat-item">
            <span className="stat-label">Correlation:</span>
            <span className={`stat-value ${correlationStats.strength}`}>
              {correlationStats.coefficient.toFixed(3)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Strength:</span>
            <span className={`stat-strength ${correlationStats.strength}`}>
              {correlationStats.strength}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Direction:</span>
            <span className={`stat-direction ${correlationStats.direction}`}>
              {correlationStats.direction}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Significance:</span>
            <span className="stat-significance">
              {correlationStats.significance}
            </span>
          </div>
        </div>
      )}

      {/* Chart */}
      <ResponsiveContainer width={width} height={height}>
        <ScatterChart
          data={scatterData}
          margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            type="number" 
            dataKey="x"
            name={formatMetricName(xMetric)}
            domain={['dataMin - 5%', 'dataMax + 5%']}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            type="number" 
            dataKey="y"
            name={formatMetricName(yMetric)}
            domain={['dataMin - 5%', 'dataMax + 5%']}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Main scatter plot */}
          <Scatter 
            name="Data Points"
            data={scatterData}
            fill={getPointColor(correlationStats?.coefficient || 0)}
          >
            {scatterData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={selectedPoints.includes(index) ? '#ff6b6b' : getPointColor(correlationStats?.coefficient || 0)}
                onClick={() => handlePointClick(entry, index)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </Scatter>

          {/* Trend line */}
          {showTrendLine && trendLineData.length > 0 && (
            <Scatter
              name="Trend Line"
              data={trendLineData}
              fill="none"
              line={{ stroke: '#8884d8', strokeWidth: 2, strokeDasharray: '5 5' }}
              shape="none"
            />
          )}
          
          <Legend />
        </ScatterChart>
      </ResponsiveContainer>

      {/* Insights Panel */}
      <div className="correlation-insights">
        <h4>Key Insights:</h4>
        <ul>
          {correlationStats && (
            <>
              <li>
                There is a <strong>{correlationStats.strength}</strong> {correlationStats.direction} 
                correlation (r = {correlationStats.coefficient.toFixed(3)}) between {formatMetricName(xMetric)} 
                and {formatMetricName(yMetric)}.
              </li>
              {correlationStats.strength === 'strong' && (
                <li>
                  This suggests a meaningful relationship between these metrics that could inform 
                  your health optimization strategies.
                </li>
              )}
              {correlationStats.strength === 'weak' && (
                <li>
                  The weak correlation suggests these metrics may not be strongly related, 
                  or other factors may be influencing the relationship.
                </li>
              )}
            </>
          )}
          <li>
            Based on {scatterData.length} data points collected over the {timeRange} period.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CorrelationChart;