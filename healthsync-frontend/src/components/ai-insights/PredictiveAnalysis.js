// frontend/src/components/PredictiveAnalysis.js
import React, { useState, useEffect, useCallback } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Line } from 'recharts';
import { Brain, TrendingUp, AlertTriangle, Target, Clock, Zap, Activity, Heart, Moon } from 'lucide-react';

const PredictiveAnalysis = ({ predictions, healthData, user }) => {
  const [selectedMetric, setSelectedMetric] = useState('energy');
  const [timeHorizon, setTimeHorizon] = useState('24h');
  const [predictionData, setPredictionData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [accuracy, setAccuracy] = useState({});

  const getBaseValue = useCallback((metric) => {
    const latest = healthData[healthData.length - 1];
    if (!latest) return 5;
    
    switch(metric) {
      case 'energy': return latest.energy || 6;
      case 'mood': return latest.mood || 7;
      case 'sleep': return 7.5;
      case 'activity': return latest.steps / 1000 || 8;
      default: return 5;
    }
  }, [healthData]);

  const getCurrentValue = useCallback((metric) => {
    const latest = healthData[healthData.length - 1];
    if (!latest) return 5;
    
    switch(metric) {
      case 'energy': return latest.energy || 6;
      case 'mood': return latest.mood || 7;
      case 'sleep': return latest.sleep || 7;
      case 'activity': return latest.steps / 1000 || 8;
      default: return 5;
    }
  }, [healthData]);

  const getMaxValue = useCallback((metric) => {
    switch(metric) {
      case 'energy': return 10;
      case 'mood': return 10;
      case 'sleep': return 12;
      case 'activity': return 20;
      default: return 10;
    }
  }, []);

  const getTrendFactor = useCallback((index, horizon) => {
    if (selectedMetric === 'energy') {
      if (horizon === '24h') {
        // Energy dips in afternoon, peaks in morning
        const hour = index;
        if (hour >= 6 && hour <= 10) return 1.5; // Morning peak
        if (hour >= 14 && hour <= 16) return -2; // Afternoon dip
        if (hour >= 20) return -1; // Evening decline
        return 0;
      }
    }
    
    // General slight decline over time with some variation
    return Math.sin(index * 0.5) * 0.8 - index * 0.05;
  }, [selectedMetric]);

  const generatePredictions = useCallback(() => {
    const now = new Date();
    const predictions = [];
    
    // Generate predictions based on time horizon
    for (let i = 0; i < (timeHorizon === '24h' ? 24 : timeHorizon === '7d' ? 7 : 30); i++) {
      const futureTime = new Date(now);
      
      if (timeHorizon === '24h') {
        futureTime.setHours(now.getHours() + i);
      } else if (timeHorizon === '7d') {
        futureTime.setDate(now.getDate() + i);
      } else {
        futureTime.setDate(now.getDate() + i);
      }

      const baseValue = getBaseValue(selectedMetric);
      const trend = getTrendFactor(i, timeHorizon);
      const noise = (Math.random() - 0.5) * 0.3;
      
      predictions.push({
        time: timeHorizon === '24h' 
          ? futureTime.getHours() + ':00'
          : futureTime.toISOString().split('T')[0],
        predicted: Math.max(0, Math.min(getMaxValue(selectedMetric), baseValue + trend + noise)),
        confidence: Math.max(60, 95 - i * 2),
        actual: i === 0 ? getCurrentValue(selectedMetric) : null,
        timestamp: futureTime.getTime()
      });
    }
    
    setPredictionData(predictions);
  }, [selectedMetric, timeHorizon, getBaseValue, getTrendFactor, getMaxValue, getCurrentValue]);

  const generateAlerts = useCallback(() => {
    const mockAlerts = [
      {
        id: 1,
        type: 'warning',
        title: 'Energy Dip Predicted',
        message: 'Your energy is likely to drop to 4/10 around 2:30 PM today',
        time: '2:30 PM',
        probability: 78,
        suggestion: 'Schedule a 10-minute walk or light snack before 2 PM',
        priority: 'high'
      },
      {
        id: 2,
        type: 'opportunity',
        title: 'Peak Performance Window',
        message: 'Optimal focus window predicted between 9-11 AM',
        time: '9:00 AM',
        probability: 85,
        suggestion: 'Block this time for your most important tasks',
        priority: 'medium'
      },
      {
        id: 3,
        type: 'caution',
        title: 'Sleep Quality Risk',
        message: 'Based on your stress levels, sleep quality may be compromised tonight',
        time: 'Tonight',
        probability: 65,
        suggestion: 'Consider relaxation exercises 1 hour before bed',
        priority: 'medium'
      },
      {
        id: 4,
        type: 'positive',
        title: 'Mood Boost Expected',
        message: 'Your mood is predicted to improve significantly this evening',
        time: '6:00 PM',
        probability: 72,
        suggestion: 'Great time for social activities or creative work',
        priority: 'low'
      }
    ];
    setAlerts(mockAlerts);
  }, []);

  const calculateAccuracy = useCallback(() => {
    // Mock accuracy data based on historical performance
    setAccuracy({
      energy: 82,
      mood: 75,
      sleep: 88,
      activity: 79,
      overall: 81
    });
  }, []);

  useEffect(() => {
    generatePredictions();
    generateAlerts();
    calculateAccuracy();
  }, [selectedMetric, timeHorizon, healthData, generatePredictions, generateAlerts, calculateAccuracy]);

  const AlertCard = ({ alert }) => {
    const { type, title, message, time, probability, suggestion, priority } = alert;
    
    const getTypeColor = () => {
      switch(type) {
        case 'warning': return 'bg-red-50 border-red-200';
        case 'opportunity': return 'bg-green-50 border-green-200';
        case 'caution': return 'bg-yellow-50 border-yellow-200';
        case 'positive': return 'bg-blue-50 border-blue-200';
        default: return 'bg-gray-50 border-gray-200';
      }
    };

    const getTypeIcon = () => {
      switch(type) {
        case 'warning': return <AlertTriangle className="w-5 h-5 text-red-600" />;
        case 'opportunity': return <Target className="w-5 h-5 text-green-600" />;
        case 'caution': return <Clock className="w-5 h-5 text-yellow-600" />;
        case 'positive': return <TrendingUp className="w-5 h-5 text-blue-600" />;
        default: return <Brain className="w-5 h-5 text-gray-600" />;
      }
    };

    const getPriorityBadge = () => {
      const colors = {
        high: 'bg-red-100 text-red-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-green-100 text-green-800'
      };
      return colors[priority] || colors.medium;
    };

    return (
      <div className={`border rounded-lg p-4 ${getTypeColor()}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getTypeIcon()}
            <div>
              <h4 className="font-semibold text-gray-900">{title}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-600">{time}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge()}`}>
                  {priority}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Probability</div>
            <div className="text-lg font-bold text-gray-900">{probability}%</div>
          </div>
        </div>
        
        <p className="text-gray-700 mb-3">{message}</p>
        
        <div className="bg-white rounded p-3 border border-gray-200">
          <div className="text-sm font-medium text-gray-900 mb-1">Suggested Action</div>
          <div className="text-sm text-gray-700">{suggestion}</div>
        </div>
      </div>
    );
  };

  const MetricSelector = ({ metric, label, icon: Icon, isSelected, onClick }) => (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg border transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 text-blue-700' 
          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center space-x-2">
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </button>
  );

  const getMetricIcon = (metric) => {
    const icons = {
      energy: Zap,
      mood: Heart,
      sleep: Moon,
      activity: Activity
    };
    return icons[metric] || Activity;
  };

  const getMetricUnit = (metric) => {
    switch(metric) {
      case 'energy': return '/10';
      case 'mood': return '/10';
      case 'sleep': return 'hours';
      case 'activity': return 'k steps';
      default: return '';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Predictive Health Analysis</h2>
        <p className="text-indigo-100">AI-powered predictions and personalized recommendations</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Predict:</label>
            <div className="flex flex-wrap gap-2">
              <MetricSelector
                metric="energy"
                label="Energy"
                icon={Zap}
                isSelected={selectedMetric === 'energy'}
                onClick={() => setSelectedMetric('energy')}
              />
              <MetricSelector
                metric="mood"
                label="Mood"
                icon={Heart}
                isSelected={selectedMetric === 'mood'}
                onClick={() => setSelectedMetric('mood')}
              />
              <MetricSelector
                metric="sleep"
                label="Sleep"
                icon={Moon}
                isSelected={selectedMetric === 'sleep'}
                onClick={() => setSelectedMetric('sleep')}
              />
              <MetricSelector
                metric="activity"
                label="Activity"
                icon={Activity}
                isSelected={selectedMetric === 'activity'}
                onClick={() => setSelectedMetric('activity')}
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Time Horizon:</label>
            <select 
              value={timeHorizon} 
              onChange={(e) => setTimeHorizon(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="24h">Next 24 hours</option>
              <option value="7d">Next 7 days</option>
              <option value="30d">Next 30 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prediction Chart */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {React.createElement(getMetricIcon(selectedMetric), { className: "w-6 h-6 text-blue-600" })}
            <h3 className="text-xl font-semibold text-gray-900">
              {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Predictions
            </h3>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Accuracy</div>
            <div className="text-lg font-bold text-green-600">{accuracy[selectedMetric] || 80}%</div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={predictionData}>
            <defs>
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis 
              domain={[0, getMaxValue(selectedMetric)]}
              label={{ value: getMetricUnit(selectedMetric), angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 shadow-lg rounded-lg border">
                      <p className="font-semibold">{label}</p>
                      <p>Predicted: {data.predicted.toFixed(1)}{getMetricUnit(selectedMetric)}</p>
                      <p>Confidence: {data.confidence.toFixed(0)}%</p>
                      {data.actual && <p>Actual: {data.actual.toFixed(1)}{getMetricUnit(selectedMetric)}</p>}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#confidenceGradient)"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Predictive Alerts */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
          Predictive Alerts & Recommendations
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      </div>

      {/* Model Performance */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Model Performance & Accuracy</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {Object.entries(accuracy).map(([metric, acc]) => (
            <div key={metric} className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{acc}%</div>
              <div className="text-sm text-gray-600 capitalize">{metric}</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${acc}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={[
            { metric: 'Energy', accuracy: accuracy.energy || 82, predictions: 156 },
            { metric: 'Mood', accuracy: accuracy.mood || 75, predictions: 142 },
            { metric: 'Sleep', accuracy: accuracy.sleep || 88, predictions: 98 },
            { metric: 'Activity', accuracy: accuracy.activity || 79, predictions: 134 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="metric" />
            <YAxis />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 shadow-lg rounded-lg border">
                      <p className="font-semibold">{label}</p>
                      <p>Accuracy: {data.accuracy}%</p>
                      <p>Predictions made: {data.predictions}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="accuracy" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Prediction Confidence */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Confidence Over Time</h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={predictionData}>
            <defs>
              <linearGradient id="confidenceArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={[0, 100]} label={{ value: 'Confidence %', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="confidence"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#confidenceArea)"
            />
          </AreaChart>
        </ResponsiveContainer>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>
            Confidence decreases over time as predictions extend further into the future. 
            Near-term predictions (next few hours) maintain high accuracy while longer-term 
            forecasts become more uncertain due to increased variability in external factors.
          </p>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Key Predictive Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-900">Pattern Recognition</h4>
              <p className="text-sm text-gray-600 mt-1">
                Your energy follows a consistent circadian pattern with peaks at 9-11 AM 
                and dips around 2-4 PM. Planning activities around these patterns can 
                improve productivity by up to 35%.
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-900">Sleep Impact</h4>
              <p className="text-sm text-gray-600 mt-1">
                Sleep quality strongly predicts next-day energy levels (87% correlation). 
                Going to bed 30 minutes earlier could increase your average energy by 1.2 points.
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-gray-900">Activity Correlation</h4>
              <p className="text-sm text-gray-600 mt-1">
                Physical activity shows a 6-hour delayed positive effect on mood. 
                Morning workouts consistently improve afternoon mood scores by 15-20%.
              </p>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-gray-900">Optimization Opportunity</h4>
              <p className="text-sm text-gray-600 mt-1">
                Your data suggests optimal performance windows that you're currently 
                underutilizing. Restructuring your schedule could improve overall 
                well-being by 25%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalysis;