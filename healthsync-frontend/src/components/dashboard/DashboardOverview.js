// src/components/dashboard/DashboardOverview.js
import React, { useContext, useState, useEffect } from 'react';
import { HealthDataContext } from '../../context/HealthDataContext';
import HealthMetricsCards from './HealthMetricsCards';
import InsightCards from './InsightCards';
import PredictiveAlerts from './PredictiveAlerts';
import LoadingSpinner from '../common/LoadingSpinner';

const DashboardOverview = () => {
  const { healthData, loading, error, refreshData } = useContext(HealthDataContext);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  const timeRanges = [
    { value: '1d', label: 'Last 24 hours' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
  ];

  useEffect(() => {
    refreshData(selectedTimeRange);
  }, [selectedTimeRange]);

  if (loading) {
    return <LoadingSpinner size="large" text="Loading your health dashboard..." />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load dashboard</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => refreshData(selectedTimeRange)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Dashboard</h1>
          <p className="text-gray-600">Your personalized health insights and metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => refreshData(selectedTimeRange)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Predictive Alerts */}
      <PredictiveAlerts />

      {/* Health Metrics Cards */}
      <HealthMetricsCards data={healthData} timeRange={selectedTimeRange} />

      {/* AI Insights */}
      <InsightCards data={healthData} timeRange={selectedTimeRange} />
    </div>
  );
};

export default DashboardOverview;