// ActivityChart.js
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ActivityChart = ({ data = [], loading = false }) => {
  if (loading) {
    return <div className="p-4">Loading activity data...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="p-4">No activity data available</div>;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="steps" stroke="#8884d8" />
          <Line type="monotone" dataKey="distance" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;