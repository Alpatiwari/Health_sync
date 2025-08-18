// frontend/src/components/MicroMomentTrigger.js
import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Clock, Brain, Target, Play, Pause, CheckCircle, AlertCircle, Lightbulb, Activity, Heart, Coffee } from 'lucide-react';

const MicroMomentTrigger = ({ user, healthData }) => {
  const [currentMoment, setCurrentMoment] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [completedMoments, setCompletedMoments] = useState([]);
  const [upcomingMoments, setUpcomingMoments] = useState([]);
  const [liveMetrics, setLiveMetrics] = useState({
    heartRate: 72,
    stressLevel: 3,
    focusScore: 7,
    energyLevel: 6
  });

  const generateUpcomingMoments = useCallback(() => {
    const moments = [
      {
        id: 1,
        type: 'energy_boost',
        title: 'Energy Reset Breathing',
        description: 'Quick 4-7-8 breathing to boost alertness',
        duration: 120, // seconds
        trigger: 'Low energy detected',
        icon: Zap,
        color: 'bg-yellow-500',
        instructions: [
          'Sit comfortably with your back straight',
          'Inhale for 4 seconds through your nose',
          'Hold your breath for 7 seconds',
          'Exhale for 8 seconds through your mouth',
          'Repeat this cycle 4 times'
        ],
        benefits: 'Increases alertness and mental clarity',
        scheduledTime: '2:30 PM'
      },
      {
        id: 2,
        type: 'stress_relief',
        title: 'Micro Meditation',
        description: 'Brief mindfulness moment to reduce tension',
        duration: 180,
        trigger: 'Elevated stress levels',
        icon: Brain,
        color: 'bg-purple-500',
        instructions: [
          'Close your eyes gently',
          'Take three deep, slow breaths',
          'Focus on the sensation of breathing',
          'If thoughts arise, gently return to breath',
          'End with a moment of gratitude'
        ],
        benefits: 'Reduces stress and improves focus',
        scheduledTime: 'Now'
      },
      {
        id: 3,
        type: 'movement',
        title: 'Desk Stretch Sequence',
        description: 'Quick stretches to combat sedentary fatigue',
        duration: 300,
        trigger: 'Prolonged sitting detected',
        icon: Activity,
        color: 'bg-green-500',
        instructions: [
          'Stand up and roll your shoulders back',
          'Stretch arms overhead and hold for 10 seconds',
          'Twist your torso gently left and right',
          'Touch your toes or reach toward the floor',
          'Neck rolls - 5 in each direction'
        ],
        benefits: 'Improves circulation and reduces muscle tension',
        scheduledTime: '4:15 PM'
      },
      {
        id: 4,
        type: 'hydration',
        title: 'Mindful Hydration',
        description: 'Intentional water break with awareness',
        duration: 60,
        trigger: 'Hydration reminder',
        icon: Coffee,
        color: 'bg-blue-500',
        instructions: [
          'Get a full glass of water',
          'Hold it with both hands',
          'Take slow, deliberate sips',
          'Notice the temperature and taste',
          'Finish the entire glass mindfully'
        ],
        benefits: 'Improves hydration and provides mental reset',
        scheduledTime: '3:45 PM'
      }
    ];
    setUpcomingMoments(moments);
  }, []);

  const updateLiveMetrics = useCallback(() => {
    setLiveMetrics(prev => ({
      heartRate: Math.max(60, Math.min(100, prev.heartRate + (Math.random() - 0.5) * 4)),
      stressLevel: Math.max(1, Math.min(10, prev.stressLevel + (Math.random() - 0.5) * 0.5)),
      focusScore: Math.max(1, Math.min(10, prev.focusScore + (Math.random() - 0.5) * 0.3)),
      energyLevel: Math.max(1, Math.min(10, prev.energyLevel + (Math.random() - 0.5) * 0.2))
    }));
  }, []);

  const completeMoment = useCallback(() => {
    if (currentMoment) {
      setCompletedMoments(prev => [...prev, {
        ...currentMoment,
        completedAt: new Date(),
        actualDuration: timer
      }]);
    }
    setCurrentMoment(null);
    setIsActive(false);
    setTimer(0);
  }, [currentMoment, timer]);

  const triggerMoment = useCallback((moment) => {
    if (moment && !isActive) {
      setCurrentMoment(moment);
      // Auto-start after 3 seconds unless user intervenes
      setTimeout(() => {
        if (!isActive && currentMoment === moment) {
          setIsActive(true);
        }
      }, 3000);
    }
  }, [isActive, currentMoment]);

  const checkForTriggers = useCallback(() => {
    // Simulate trigger conditions
    if (liveMetrics.stressLevel > 7 && !currentMoment) {
      triggerMoment(upcomingMoments.find(m => m.type === 'stress_relief'));
    } else if (liveMetrics.energyLevel < 4 && !currentMoment) {
      triggerMoment(upcomingMoments.find(m => m.type === 'energy_boost'));
    }
  }, [liveMetrics.stressLevel, liveMetrics.energyLevel, currentMoment, upcomingMoments, triggerMoment]);

  useEffect(() => {
    generateUpcomingMoments();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateLiveMetrics();
      checkForTriggers();
    }, 5000);

    return () => clearInterval(interval);
  }, [healthData, generateUpcomingMoments, updateLiveMetrics, checkForTriggers]);

  useEffect(() => {
    let interval = null;
    if (isActive && currentMoment) {
      interval = setInterval(() => {
        setTimer(timer => {
          if (timer >= currentMoment.duration - 1) {
            completeMoment();
            return 0;
          }
          return timer + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, currentMoment, completeMoment]);

  const startMoment = (moment) => {
    setCurrentMoment(moment);
    setIsActive(true);
    setTimer(0);
  };

  const pauseMoment = () => {
    setIsActive(false);
  };

  const resumeMoment = () => {
    setIsActive(true);
  };

  const skipMoment = () => {
    setCurrentMoment(null);
    setIsActive(false);
    setTimer(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const ActiveMomentCard = () => {
    if (!currentMoment) return null;

    const progress = (timer / currentMoment.duration) * 100;
    const Icon = currentMoment.icon;

    return (
      <div className="bg-white rounded-xl shadow-2xl border-2 border-blue-500 p-6 animate-pulse-subtle">
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${currentMoment.color} mb-4`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{currentMoment.title}</h3>
          <p className="text-gray-600">{currentMoment.trigger}</p>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {formatTime(currentMoment.duration - timer)}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Follow these steps:</h4>
          <div className="space-y-2">
            {currentMoment.instructions.map((instruction, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                </div>
                <p className="text-sm text-gray-700">{instruction}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex space-x-3">
          {!isActive ? (
            <button
              onClick={resumeMoment}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Resume</span>
            </button>
          ) : (
            <button
              onClick={pauseMoment}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-700 transition-colors"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>
          )}
          <button
            onClick={completeMoment}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Complete</span>
          </button>
          <button
            onClick={skipMoment}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Skip
          </button>
        </div>
      </div>
    );
  };

  const MomentCard = ({ moment, isUpcoming = true }) => {
    const Icon = moment.icon;
    
    return (
      <div className="bg-white rounded-lg p-4 shadow border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${moment.color} flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold text-gray-900 truncate">{moment.title}</h4>
              {isUpcoming && (
                <span className="text-sm text-gray-500">{moment.scheduledTime}</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{moment.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {formatTime(moment.duration)} • {moment.benefits}
              </span>
              {isUpcoming ? (
                <button
                  onClick={() => startMoment(moment)}
                  className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                >
                  Start Now
                </button>
              ) : (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MetricCard = ({ label, value, icon: Icon, color, status }) => (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-1 rounded ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          status === 'good' ? 'bg-green-100 text-green-800' :
          status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {status}
        </span>
      </div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Live Micro-Moments</h2>
        <p className="text-green-100">Real-time wellness interventions powered by your data</p>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Heart Rate"
          value={Math.round(liveMetrics.heartRate)}
          icon={Heart}
          color="bg-red-500"
          status={liveMetrics.heartRate > 80 ? 'warning' : 'good'}
        />
        <MetricCard
          label="Stress Level"
          value={liveMetrics.stressLevel.toFixed(1)}
          icon={AlertCircle}
          color="bg-orange-500"
          status={liveMetrics.stressLevel > 7 ? 'alert' : liveMetrics.stressLevel > 5 ? 'warning' : 'good'}
        />
        <MetricCard
          label="Focus Score"
          value={liveMetrics.focusScore.toFixed(1)}
          icon={Target}
          color="bg-purple-500"
          status={liveMetrics.focusScore > 7 ? 'good' : 'warning'}
        />
        <MetricCard
          label="Energy Level"
          value={liveMetrics.energyLevel.toFixed(1)}
          icon={Zap}
          color="bg-yellow-500"
          status={liveMetrics.energyLevel > 6 ? 'good' : liveMetrics.energyLevel > 4 ? 'warning' : 'alert'}
        />
      </div>

      {/* Active Moment */}
      {currentMoment && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
            Active Micro-Moment
          </h3>
          <ActiveMomentCard />
        </div>
      )}

      {/* Upcoming Moments */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-500" />
          Suggested Moments
        </h3>
        <div className="space-y-3">
          {upcomingMoments.map((moment) => (
            <MomentCard key={moment.id} moment={moment} />
          ))}
        </div>
      </div>

      {/* Completed Moments */}
      {completedMoments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            Completed Today ({completedMoments.length})
          </h3>
          <div className="space-y-3">
            {completedMoments.slice(-3).map((moment, index) => (
              <MomentCard key={`completed-${index}`} moment={moment} isUpcoming={false} />
            ))}
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Wellness Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">{completedMoments.length}</div>
            <div className="text-sm text-gray-600">Moments Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {completedMoments.reduce((acc, m) => acc + Math.floor(m.duration / 60), 0)}
            </div>
            <div className="text-sm text-gray-600">Minutes of Wellness</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">85%</div>
            <div className="text-sm text-gray-600">Wellness Score</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MicroMomentTrigger;