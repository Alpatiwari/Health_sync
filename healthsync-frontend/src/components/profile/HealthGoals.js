import React, { useState, useEffect } from 'react';
import { useHealthData } from '../../hooks/useHealthData';
import LoadingSpinner from '../common/LoadingSpinner';

const HealthGoals = () => {
  const { healthGoals, updateHealthGoals, getGoalProgress } = useHealthData();
  const [goals, setGoals] = useState([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newGoal, setNewGoal] = useState({
    category: '',
    title: '',
    target: '',
    unit: '',
    deadline: '',
    frequency: 'daily',
    priority: 'medium'
  });

  const goalCategories = [
    { value: 'fitness', label: 'Fitness', icon: '🏃‍♂️' },
    { value: 'nutrition', label: 'Nutrition', icon: '🥗' },
    { value: 'sleep', label: 'Sleep', icon: '😴' },
    { value: 'weight', label: 'Weight Management', icon: '⚖️' },
    { value: 'mental', label: 'Mental Health', icon: '🧘‍♀️' },
    { value: 'medical', label: 'Medical', icon: '💊' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'one-time', label: 'One-time' }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#10B981' },
    { value: 'medium', label: 'Medium', color: '#F59E0B' },
    { value: 'high', label: 'High', color: '#EF4444' }
  ];

  useEffect(() => {
    if (healthGoals) {
      setGoals(healthGoals);
    }
  }, [healthGoals]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const goalWithId = {
        ...newGoal,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: 'active',
        progress: 0
      };

      const updatedGoals = [...goals, goalWithId];
      await updateHealthGoals(updatedGoals);
      setGoals(updatedGoals);
      
      setNewGoal({
        category: '',
        title: '',
        target: '',
        unit: '',
        deadline: '',
        frequency: 'daily',
        priority: 'medium'
      });
      setIsAddingGoal(false);
    } catch (error) {
      console.error('Error adding goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGoalStatus = async (goalId, newStatus) => {
    const updatedGoals = goals.map(goal =>
      goal.id === goalId ? { ...goal, status: newStatus } : goal
    );
    setGoals(updatedGoals);
    await updateHealthGoals(updatedGoals);
  };

  const handleDeleteGoal = async (goalId) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    setGoals(updatedGoals);
    await updateHealthGoals(updatedGoals);
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return '#10B981';
    if (progress >= 75) return '#059669';
    if (progress >= 50) return '#F59E0B';
    if (progress >= 25) return '#D97706';
    return '#EF4444';
  };

  const getCategoryIcon = (category) => {
    return goalCategories.find(cat => cat.value === category)?.icon || '🎯';
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return 'No deadline';
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return date.toLocaleDateString();
  };

  if (!healthGoals && healthGoals !== null) {
    return <LoadingSpinner />;
  }

  return (
    <div className="health-goals">
      <div className="goals-header">
        <div>
          <h2>🎯 Health Goals</h2>
          <p>Track and achieve your personal health objectives</p>
        </div>
        <button 
          className="add-goal-btn"
          onClick={() => setIsAddingGoal(!isAddingGoal)}
        >
          {isAddingGoal ? '❌ Cancel' : '➕ Add Goal'}
        </button>
      </div>

      {isAddingGoal && (
        <div className="add-goal-form">
          <h3>✨ Create New Goal</h3>
          <form onSubmit={handleAddGoal}>
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                  required
                >
                  <option value="">Select Category</option>
                  {goalCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newGoal.priority}
                  onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
                  style={{ color: priorities.find(p => p.value === newGoal.priority)?.color }}
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Goal Title</label>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                placeholder="e.g., Lose 10 pounds, Walk 10,000 steps daily"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Target Value</label>
                <input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                  placeholder="10"
                  required
                />
              </div>
              <div className="form-group">
                <label>Unit</label>
                <input
                  type="text"
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal({...newGoal, unit: e.target.value})}
                  placeholder="pounds, steps, hours"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Frequency</label>
                <select
                  value={newGoal.frequency}
                  onChange={(e) => setNewGoal({...newGoal, frequency: e.target.value})}
                >
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Deadline (Optional)</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? '⏳ Adding...' : '🚀 Add Goal'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="goals-list">
        {goals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>No goals set yet</h3>
            <p>Start by adding your first health goal to track your progress!</p>
            <button 
              className="empty-action-btn"
              onClick={() => setIsAddingGoal(true)}
            >
              🎯 Create Your First Goal
            </button>
          </div>
        ) : (
          <div className="goals-grid">
            {goals.map(goal => {
              const progress = getGoalProgress ? getGoalProgress(goal.id) : goal.progress || 0;
              const priorityColor = priorities.find(p => p.value === goal.priority)?.color;
              
              return (
                <div key={goal.id} className={`goal-card ${goal.status}`}>
                  <div className="goal-header">
                    <div className="goal-category">
                      <span className="category-icon">{getCategoryIcon(goal.category)}</span>
                      <span className="category-name">
                        {goalCategories.find(cat => cat.value === goal.category)?.label}
                      </span>
                    </div>
                    <div className="goal-priority" style={{ 
                      backgroundColor: `${priorityColor}15`,
                      color: priorityColor,
                      border: `1px solid ${priorityColor}30`
                    }}>
                      {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                    </div>
                  </div>

                  <div className="goal-content">
                    <h3 className="goal-title">{goal.title}</h3>
                    <div className="goal-target">
                      🎯 Target: <strong>{goal.target} {goal.unit}</strong> ({goal.frequency})
                    </div>
                    
                    <div className="goal-progress">
                      <div className="progress-header">
                        <span className="progress-label">Progress</span>
                        <span className="progress-percentage">{Math.round(progress)}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${Math.min(progress, 100)}%`,
                            backgroundColor: getProgressColor(progress)
                          }}
                        />
                      </div>
                    </div>

                    <div className="goal-deadline">
                      📅 {formatDeadline(goal.deadline)}
                    </div>

                    {goal.status === 'completed' && (
                      <div className="completion-badge">
                        🎉 Completed!
                      </div>
                    )}

                    {goal.status === 'paused' && (
                      <div className="paused-badge">
                        ⏸️ Paused
                      </div>
                    )}
                  </div>

                  <div className="goal-actions">
                    {goal.status === 'active' && (
                      <>
                        <button 
                          className="complete-btn"
                          onClick={() => handleUpdateGoalStatus(goal.id, 'completed')}
                          title="Mark as completed"
                        >
                          ✅ Complete
                        </button>
                        <button 
                          className="pause-btn"
                          onClick={() => handleUpdateGoalStatus(goal.id, 'paused')}
                          title="Pause this goal"
                        >
                          ⏸️ Pause
                        </button>
                      </>
                    )}
                    
                    {goal.status === 'paused' && (
                      <button 
                        className="resume-btn"
                        onClick={() => handleUpdateGoalStatus(goal.id, 'active')}
                        title="Resume this goal"
                      >
                        ▶️ Resume
                      </button>
                    )}
                    
                    {goal.status === 'completed' && (
                      <button 
                        className="reactivate-btn"
                        onClick={() => handleUpdateGoalStatus(goal.id, 'active')}
                        title="Reactivate this goal"
                      >
                        🔄 Reactivate
                      </button>
                    )}

                    <button 
                      className="delete-btn"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this goal?')) {
                          handleDeleteGoal(goal.id);
                        }
                      }}
                      title="Delete this goal"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {goals.length > 0 && (
        <div className="goals-summary">
          <h3>📊 Goals Summary</h3>
          <div className="summary-stats">
            <div className="summary-card">
              <div className="summary-number">{goals.filter(g => g.status === 'active').length}</div>
              <div className="summary-label">Active Goals</div>
            </div>
            <div className="summary-card">
              <div className="summary-number">{goals.filter(g => g.status === 'completed').length}</div>
              <div className="summary-label">Completed</div>
            </div>
            <div className="summary-card">
              <div className="summary-number">
                {goals.length > 0 ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100) : 0}%
              </div>
              <div className="summary-label">Success Rate</div>
            </div>
            <div className="summary-card">
              <div className="summary-number">{goals.filter(g => g.status === 'paused').length}</div>
              <div className="summary-label">Paused</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthGoals;