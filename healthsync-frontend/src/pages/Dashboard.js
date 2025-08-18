// frontend/src/components/Dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Brain, Zap, AlertTriangle, TrendingUp, Calendar, Heart, Lightbulb, ArrowUp, ArrowDown } from 'lucide-react';

const Dashboard = ({ healthData, predictions, correlations, user }) => {
  const [liveInsights, setLiveInsights] = useState([]);
  const [healthScore, setHealthScore] = useState(0);

  // Memoized function to calculate health score
  const calculateHealthScore = useCallback(() => {
    if (!healthData.length) return;
    
    const latest = healthData[healthData.length - 1];
    const score = Math.min(100, Math.max(0, 
      (latest.sleep / 8 * 25) +
      (Math.min(latest.steps, 12000) / 12000 * 25) +
      (latest.energy / 10 * 25) +
      (latest.mood / 10 * 25)
    ));
    setHealthScore(Math.round(score));
  }, [healthData]);

  // Memoized function to generate live insights
  const generateLiveInsights = useCallback(() => {
    const insights = [
      {
        icon: Brain,
        title: 'Energy Forecast',
        message: `73% chance of energy dip at 2:30 PM based on your sleep pattern`,
        action: 'Schedule light walk before meetings',
        priority: 'high',
        time: '2 hours'
      },
      {
        icon: TrendingUp,
        title: 'Pattern Detected',
        message: 'Your mood improves 40% on days with 10k+ steps',
        action: 'Aim for 2k more steps today',
        priority: 'medium',
        time: 'now'
      },
      {
        icon: Lightbulb,
        title: 'Micro-Moment',
        message: 'Prime time for focused work based on your energy curve',
        action: 'Block calendar for deep work',
        priority: 'low',
        time: '30 minutes'
      }
    ];
    setLiveInsights(insights);
  }, []);

  // Include both functions in the dependency array
  useEffect(() => {
    calculateHealthScore();
    generateLiveInsights();
  }, [healthData, predictions, calculateHealthScore, generateLiveInsights]);

  const MetricCard = ({ title, value, unit, trend, icon: Icon, color, prediction }) => (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          <span className="text-sm text-gray-500">{unit}</span>
        </div>
        {prediction && (
          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            Predicted: {prediction}
          </div>
        )}
      </div>
    </div>
  );

  const InsightCard = ({ insight }) => {
    const { icon: Icon, title, message, action, priority, time } = insight;
    const priorityColors = {
      high: 'border-red-200 bg-red-50',
      medium: 'border-yellow-200 bg-yellow-50',
      low: 'border-blue-200 bg-blue-50'
    };

    return (
      <div className={`border rounded-lg p-4 ${priorityColors[priority]}`}>
        <div className="flex items-start space-x-3">
          <Icon className="w-5 h-5 mt-0.5 text-gray-600" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
              <span className="text-xs text-gray-500">{time}</span>
            </div>
            <p className="text-sm text-gray-700 mb-2">{message}</p>
            <button className="text-xs bg-white px-3 py-1 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
              {action}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!healthData.length) {
    return (
      <div className="text-center py-12">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Health Data</h3>
        <p className="text-gray-600">Connect your devices to start tracking</p>
      </div>
    );
  }

  const latest = healthData[healthData.length - 1];

  return (
    <div className="space-y-8">
      {/* Header with Health Score */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'User'}</h2>
            <p className="text-blue-100">Your personalized health intelligence dashboard</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{healthScore}</div>
            <div className="text-sm text-blue-100">Health Score</div>
          </div>
        </div>
      </div>

      {/* Live Insights */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
          Live Insights & Predictions
        </h3>
        <div className="space-y-3">
          {liveInsights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))}
        </div>
      </div>

      {/* Current Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Sleep Quality"
          value={latest.sleep}
          unit="hours"
          trend={5}
          icon={Activity}
          color="bg-blue-500"
          prediction="7.2h tomorrow"
        />
        <MetricCard
          title="Energy Level"
          value={latest.energy}
          unit="/10"
          trend={-2}
          icon={Zap}
          color="bg-yellow-500"
          prediction="6.8/10 at 3PM"
        />
        <MetricCard
          title="Daily Steps"
          value={latest.steps.toLocaleString()}
          unit="steps"
          trend={12}
          icon={TrendingUp}
          color="bg-green-500"
          prediction="11.2k today"
        />
        <MetricCard
          title="Mood Score"
          value={latest.mood}
          unit="/10"
          trend={8}
          icon={Heart}
          color="bg-pink-500"
          prediction="8.1/10 evening"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Energy Trend */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Energy Trend (14 Days)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={healthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="energy" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="#EF4444" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sleep vs Performance */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Sleep Impact on Performance</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={healthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sleep" fill="#8B5CF6" />
              <Bar dataKey="energy" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Calendar className="w-6 h-6 text-blue-600 mb-2" />
            <div className="font-medium">Sync Calendar</div>
            <div className="text-sm text-gray-600">Update your schedule context</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <Brain className="w-6 h-6 text-purple-600 mb-2" />
            <div className="font-medium">Run Analysis</div>
            <div className="text-sm text-gray-600">Generate new correlations</div>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <AlertTriangle className="w-6 h-6 text-orange-600 mb-2" />
            <div className="font-medium">Set Alerts</div>
            <div className="text-sm text-gray-600">Configure health notifications</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;