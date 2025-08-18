import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TrendAnalysis = ({ data = [], metrics = [] }) => {
  const [timeWindow, setTimeWindow] = useState('week');

  const formatDateForDisplay = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Move groupDataByTimeWindow inside useMemo
    const groupDataByTimeWindow = (rawData, window) => {
      // Your grouping logic here
      return rawData; // Simplified for now
    };

    return groupDataByTimeWindow(data, timeWindow);
  }, [data, timeWindow]);

  const seasonalityAnalysis = useMemo(() => {
    if (!data || data.length === 0) return { hasSeasonality: false };

    // Move detectSeasonality inside useMemo
    const detectSeasonality = (data) => {
      // Your seasonality logic here
      return { hasSeasonality: false, period: null };
    };

    return detectSeasonality(data);
  }, [data]);

  const trendMetrics = useMemo(() => {
    if (!processedData || processedData.length < 2) return {};

    return metrics.reduce((acc, metric) => {
      const values = processedData.map(item => item[metric]).filter(val => val !== null);
      if (values.length < 2) return acc;

      const firstValue = values[0];
      const lastValue = values[values.length - 1];
      const trend = lastValue > firstValue ? 'increasing' : 'decreasing';

      acc[metric] = { trend, change: lastValue - firstValue };
      return acc;
    }, {});
  }, [processedData, metrics]);

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Trend Analysis</h3>
        <div className="flex space-x-2 mb-4">
          {['day', 'week', 'month'].map(window => (
            <button
              key={window}
              onClick={() => setTimeWindow(window)}
              className={`px-3 py-1 rounded ${timeWindow === window ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              {window.charAt(0).toUpperCase() + window.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDateForDisplay} />
            <YAxis />
            <Tooltip />
            <Legend />
            {metrics.map((metric, index) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={`hsl(${index * 60}, 70%, 50%)`}
                name={metric.charAt(0).toUpperCase() + metric.slice(0)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded">
          <h4 className="font-semibold">Trend Summary</h4>
          {Object.entries(trendMetrics).map(([metric, data]) => (
            <div key={metric} className="mt-2">
              <span className="font-medium">{metric}: </span>
              <span className={data.trend === 'increasing' ? 'text-green-600' : 'text-red-600'}>
                {data.trend} ({data.change > 0 ? '+' : ''}{data.change.toFixed(2)})
              </span>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-gray-50 rounded">
          <h4 className="font-semibold">Seasonality Analysis</h4>
          <p className={seasonalityAnalysis.hasSeasonality ? 'text-green-600' : 'text-gray-600'}>
            {seasonalityAnalysis.hasSeasonality 
              ? `Seasonal pattern detected (${seasonalityAnalysis.period})`
              : 'No clear seasonal pattern'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalysis;
