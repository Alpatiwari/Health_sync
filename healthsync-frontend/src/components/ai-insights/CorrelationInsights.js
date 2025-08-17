// frontend/src/components/CorrelationInsights.js
import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Brain, Lightbulb, Filter, Calendar, Activity, Zap, Heart, Moon } from 'lucide-react';

const CorrelationInsights = ({ correlations, healthData }) => {
  const [selectedCorrelation, setSelectedCorrelation] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (correlations.length > 0) {
      setSelectedCorrelation(correlations[0]);
      generateInsights();
    }
    filterDataByTimeRange();
  }, [correlations, healthData, timeRange]);

  const filterDataByTimeRange = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const filtered = healthData.filter(d => new Date(d.date) >= cutoff);
    setFilteredData(filtered);
  };

  const generateInsights = () => {
    const mockInsights = [
      {
        id: 1,
        type: 'strong_positive',
        title: 'Sleep Quality ↔ Energy Levels',
        correlation: 0.87,
        description: 'Strong positive correlation: Better sleep quality consistently leads to higher energy levels throughout the day.',
        actionable: 'Aim for 7-8 hours of quality sleep to maintain optimal energy',
        impact: 'High',
        confidence: 94
      },
      {
        id: 2,
        type: 'moderate_negative',
        title: 'Stress ↔ Sleep Quality',
        correlation: -0.62,
        description: 'Moderate negative correlation: Higher stress levels are associated with poorer sleep quality.',
        actionable: 'Practice relaxation techniques before bedtime on high-stress days',
        impact: 'Medium',
        confidence: 78
      },
      {
        id: 3,
        type: 'strong_positive',
        title: 'Physical Activity ↔ Mood',
        correlation: 0.73,
        description: 'Strong positive correlation: More physical activity correlates with better mood scores.',
        actionable: 'Increase daily steps by 2,000 to see measurable mood improvements',
        impact: 'High',
        confidence: 89
      },
      {
        id: 4,
        type: 'moderate_positive',
        title: 'Hydration ↔ Cognitive Performance',
        correlation: 0.58,
        description: 'Moderate positive correlation: Better hydration levels improve focus and cognitive tasks.',
        actionable: 'Maintain 2-3L water intake for optimal cognitive performance',
        impact: 'Medium',
        confidence: 71
      }
    ];
    setInsights(mockInsights);
  };

  const getCorrelationStrength = (value) => {
    const abs = Math.abs(value);
    if (abs >= 0.7) return 'Strong';
    if (abs >= 0.5) return 'Moderate';
    if (abs >= 0.3) return 'Weak';
    return 'Very Weak';
  };

  const getCorrelationColor = (value) => {
    const abs = Math.abs(value);
    if (abs >= 0.7) return value > 0 ? 'text-green-600' : 'text-red-600';
    if (abs >= 0.5) return value > 0 ? 'text-blue-600' : 'text-orange-600';
    return 'text-gray-600';
  };

  const generateScatterData = () => {
    return filteredData.map((d, index) => ({
      x: d.sleep,
      y: d.energy,
      name: d.date,
      mood: d.mood,
      steps: d.steps
    }));
  };

  const InsightCard = ({ insight }) => {
    const { type, title, correlation, description, actionable, impact, confidence } = insight;
    
    const getTypeIcon = () => {
      if (Math.abs(correlation) >= 0.7) return <TrendingUp className="w-5 h-5" />;
      return <Brain className="w-5 h-5" />;
    };

    const getImpactColor = () => {
      switch(impact) {
        case 'High': return 'bg-red-100 text-red-800';
        case 'Medium': return 'bg-yellow-100 text-yellow-800';
        case 'Low': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${correlation > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {getTypeIcon()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`text-sm font-medium ${getCorrelationColor(correlation)}`}>
                  r = {correlation.toFixed(2)} ({getCorrelationStrength(correlation)})
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor()}`}>
                  {impact} Impact
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Confidence</div>
            <div className="text-xl font-bold text-gray-900">{confidence}%</div>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4">{description}</p>
        
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-start space-x-2">
            <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-blue-900 mb-1">Actionable Insight</div>
              <div className="text-sm text-blue-800">{actionable}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MetricIcon = ({ metric }) => {
    const icons = {
      sleep: Moon,
      energy: Zap,
      mood: Heart,
      steps: Activity
    };
    const Icon = icons[metric] || Activity;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Correlation Insights</h2>
        <p className="text-purple-100">Discover hidden patterns in your health data</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Time Range:</label>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {filteredData.length} data points analyzed
          </div>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      {/* Interactive Scatter Plot */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Sleep vs Energy Correlation</h3>
          <div className="text-sm text-gray-600">
            Hover over points to see details
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart data={generateScatterData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              domain={[0, 12]} 
              name="Sleep Hours"
              label={{ value: 'Sleep Hours', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              type="number" 
              domain={[0, 10]} 
              name="Energy Level"
              label={{ value: 'Energy Level', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 shadow-lg rounded-lg border">
                      <p className="font-semibold">{data.name}</p>
                      <p>Sleep: {data.x}h</p>
                      <p>Energy: {data.y}/10</p>
                      <p>Mood: {data.mood}/10</p>
                      <p>Steps: {data.steps?.toLocaleString()}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter 
              dataKey="y" 
              fill="#3B82F6"
              fillOpacity={0.6}
              stroke="#1D4ED8"
              strokeWidth={1}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Analysis */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Multi-Metric Trend Analysis</h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="sleep" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              name="Sleep (hours)"
            />
            <Line 
              type="monotone" 
              dataKey="energy" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Energy (/10)"
            />
            <Line 
              type="monotone" 
              dataKey="mood" 
              stroke="#F59E0B" 
              strokeWidth={2}
              name="Mood (/10)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Statistical Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { metric: 'sleep', value: 7.2, change: '+5%', label: 'Avg Sleep' },
          { metric: 'energy', value: 6.8, change: '-2%', label: 'Avg Energy' },
          { metric: 'mood', value: 7.5, change: '+8%', label: 'Avg Mood' },
          { metric: 'steps', value: '9.2K', change: '+12%', label: 'Avg Steps' }
        ].map(({ metric, value, change, label }) => (
          <div key={metric} className="bg-white rounded-lg p-4 shadow border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <MetricIcon metric={metric} />
              <span className={`text-sm font-medium ${
                change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {change}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-600">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CorrelationInsights;