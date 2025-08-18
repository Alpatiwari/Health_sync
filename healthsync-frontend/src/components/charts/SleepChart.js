import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SleepChart = ({ data = [], loading = false }) => {
  const [chartType, setChartType] = useState('line');

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => ({
      ...item,
      quality: item.sleepQuality || 'Unknown',
      duration: item.sleepDuration || 0,
      efficiency: item.sleepEfficiency || 0
    }));
  }, [data]);

  if (loading) {
    return <div className="p-4">Loading sleep data...</div>;
  }

  if (!processedData || processedData.length === 0) {
    return <div className="p-4">No sleep data available</div>;
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => setChartType('line')}
          className={`px-3 py-1 rounded ${chartType === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Line Chart
        </button>
        <button
          onClick={() => setChartType('bar')}
          className={`px-3 py-1 rounded ${chartType === 'bar' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Bar Chart
        </button>
        <button
          onClick={() => setChartType('area')}
          className={`px-3 py-1 rounded ${chartType === 'area' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Area Chart
        </button>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="duration" stroke="#8884d8" name="Duration (hours)" />
            <Line type="monotone" dataKey="efficiency" stroke="#82ca9d" name="Efficiency %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SleepChart;