import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import UserProfile from '../components/profile/UserProfile';
import HealthGoals from '../components/profile/HealthGoals';
import DataSources from '../components/profile/DataSources';
import NotificationSettings from '../components/profile/NotificationSettings';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { api } from '../services/api';
import '../styles/components.css';
import '../styles/profile.css';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: 'moderate',
    timezone: '',
    bio: ''
  });

  const [healthGoals, setHealthGoals] = useState([]);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [notificationPrefs, setNotificationPrefs] = useState({});

  const tabs = [
    { 
      id: 'profile', 
      label: 'Personal Info', 
      icon: '👤',
      description: 'Manage your personal details and health profile',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    { 
      id: 'goals', 
      label: 'Health Goals', 
      icon: '🎯',
      description: 'Set and track your wellness objectives',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    { 
      id: 'data', 
      label: 'Data Sources', 
      icon: '📱',
      description: 'Connect devices and manage data sources',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: '🔔',
      description: 'Customize your notification preferences',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ];

  const loadDefaultData = useCallback(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }

    // Default health goals
    setHealthGoals([
      {
        id: 1,
        type: 'sleep',
        title: 'Improve Sleep Quality',
        target: 8,
        unit: 'hours',
        current: 6.5,
        deadline: '2025-12-31',
        status: 'active'
      },
      {
        id: 2,
        type: 'activity',
        title: 'Daily Steps',
        target: 10000,
        unit: 'steps',
        current: 7500,
        deadline: '2025-12-31',
        status: 'active'
      }
    ]);

    // Default connected devices
    setConnectedDevices([
      {
        id: 1,
        name: 'Fitbit Charge 5',
        type: 'fitness_tracker',
        status: 'connected',
        lastSync: new Date().toISOString(),
        dataTypes: ['steps', 'heart_rate', 'sleep']
      }
    ]);

    // Default notification preferences
    setNotificationPrefs({
      email: {
        insights: true,
        goals: true,
        reminders: false
      },
      push: {
        insights: true,
        goals: true,
        reminders: true
      },
      frequency: 'daily'
    });
  }, []);

  const loadProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/profile');
      const { profile, goals, devices, notifications } = response.data;
      
      setProfileData(profile || {});
      setHealthGoals(goals || []);
      setConnectedDevices(devices || []);
      setNotificationPrefs(notifications || {});
    } catch (error) {
      console.error('Failed to load profile data:', error);
      // Load from localStorage or set defaults
      loadDefaultData();
    } finally {
      setLoading(false);
    }
  }, [loadDefaultData]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleProfileSave = async (updatedProfile) => {
    try {
      setSaveStatus('saving');
      await api.put('/user/profile', updatedProfile);
      setProfileData(updatedProfile);
      updateUser(updatedProfile);
      setSaveStatus('success');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleGoalUpdate = async (updatedGoals) => {
    try {
      await api.put('/user/goals', { goals: updatedGoals });
      setHealthGoals(updatedGoals);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Failed to update goals:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleDeviceUpdate = async (updatedDevices) => {
    try {
      await api.put('/user/devices', { devices: updatedDevices });
      setConnectedDevices(updatedDevices);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Failed to update devices:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleNotificationUpdate = async (updatedPrefs) => {
    try {
      await api.put('/user/notifications', updatedPrefs);
      setNotificationPrefs(updatedPrefs);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Failed to update notifications:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleAccountDelete = async () => {
    const confirmation = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (confirmation) {
      const finalConfirmation = window.prompt(
        'Please type "DELETE" to confirm account deletion:'
      );
      
      if (finalConfirmation === 'DELETE') {
        try {
          await api.delete('/user/account');
          // Logout and redirect to login page
          localStorage.clear();
          window.location.href = '/login';
        } catch (error) {
          console.error('Failed to delete account:', error);
          alert('Failed to delete account. Please try again or contact support.');
        }
      }
    }
  };

  const exportUserData = async () => {
    try {
      const response = await api.get('/user/data-export');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `healthsync-data-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="profile-page">
      {/* Hero Header Section */}
      <div className="profile-hero">
        <div className="hero-background">
          <div className="hero-particles">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="particle" 
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 10}s`,
                  animationDuration: `${10 + Math.random() * 20}s`
                }}
              />
            ))}
          </div>
          <div className="hero-content">
            <div className="hero-avatar">
              <img 
                src={user?.avatar || '/default-avatar.png'} 
                alt="Profile"
                className="avatar-image"
              />
              <div className="avatar-status online"></div>
            </div>
            <div className="hero-info">
              <h1 className="hero-title">
                Welcome back, {user?.firstName || profileData.firstName || 'Health Champion'}! 👋
              </h1>
              <p className="hero-subtitle">
                Your wellness journey continues here. Manage your profile, goals, and preferences.
              </p>
              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">156</span>
                  <span className="stat-label">Insights Generated</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">12</span>
                  <span className="stat-label">Goals Achieved</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">2.8K</span>
                  <span className="stat-label">Data Points</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Save Status Notification */}
        {saveStatus && (
          <div className={`save-notification ${saveStatus} animate-slide-in`}>
            <div className="save-content">
              {saveStatus === 'saving' && (
                <>
                  <div className="save-spinner"></div>
                  <span>Saving changes...</span>
                </>
              )}
              {saveStatus === 'success' && (
                <>
                  <div className="save-icon success">✅</div>
                  <span>Changes saved successfully!</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <div className="save-icon error">❌</div>
                  <span>Save failed. Please try again.</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="tab-navigation">
        <div className="nav-container">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                '--tab-gradient': tab.gradient,
                '--animation-delay': `${index * 0.1}s`
              }}
            >
              <div className="tab-content">
                <span className="tab-icon">{tab.icon}</span>
                <div className="tab-text">
                  <span className="tab-label">{tab.label}</span>
                  <span className="tab-description">{tab.description}</span>
                </div>
              </div>
              <div className="tab-indicator"></div>
            </button>
          ))}
        </div>
        <div className="nav-glow"></div>
      </div>

      {/* Tab Content with Enhanced Styling */}
      <div className="tab-content">
        <div className={`content-container ${activeTab}`}>
          {activeTab === 'profile' && (
            <div className="profile-tab">
              <div className="section-header">
                <div className="header-content">
                  <h2>Personal Information</h2>
                  <p>Keep your profile information up to date for personalized insights</p>
                </div>
                <div className="header-actions">
                  <button className="btn btn-outline">
                    <span>📊</span>
                    View Health Report
                  </button>
                </div>
              </div>
              
              <UserProfile
                profileData={profileData}
                onSave={handleProfileSave}
                loading={loading}
              />

              <div className="profile-insights">
                <h3>Your Health Journey</h3>
                <div className="insights-grid">
                  <div className="insight-card">
                    <div className="insight-icon">📅</div>
                    <div className="insight-content">
                      <h4>Account Created</h4>
                      <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Welcome to HealthSync!'}</p>
                    </div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">💾</div>
                    <div className="insight-content">
                      <h4>Data Points Collected</h4>
                      <p>2,847 health metrics tracked</p>
                    </div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">💡</div>
                    <div className="insight-content">
                      <h4>AI Insights Generated</h4>
                      <p>156 personalized recommendations</p>
                    </div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">🏆</div>
                    <div className="insight-content">
                      <h4>Goals Achieved</h4>
                      <p>12 milestones reached this year</p>
                    </div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">📈</div>
                    <div className="insight-content">
                      <h4>Health Score</h4>
                      <p>82/100 - Keep up the great work!</p>
                    </div>
                  </div>
                  <div className="insight-card">
                    <div className="insight-icon">⏱️</div>
                    <div className="insight-content">
                      <h4>Streak</h4>
                      <p>45 days of consistent tracking</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="data-management-section">
                <div className="section-header">
                  <h3>Data Management & Privacy</h3>
                  <p>Take control of your health data with our security-first approach</p>
                </div>
                
                <div className="privacy-features">
                  <div className="feature-card">
                    <div className="feature-icon">🔐</div>
                    <div className="feature-content">
                      <h4>End-to-End Encryption</h4>
                      <p>Your health data is protected with military-grade AES-256 encryption</p>
                    </div>
                    <div className="feature-status active">Active</div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🚫</div>
                    <div className="feature-content">
                      <h4>Zero Data Selling</h4>
                      <p>We never sell, share, or monetize your personal health information</p>
                    </div>
                    <div className="feature-status active">Guaranteed</div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">👤</div>
                    <div className="feature-content">
                      <h4>Full Data Ownership</h4>
                      <p>Export or delete your data anytime with complete transparency</p>
                    </div>
                    <div className="feature-status active">Available</div>
                  </div>
                </div>

                <div className="data-actions">
                  <button onClick={exportUserData} className="btn btn-primary">
                    <span>📥</span>
                    Export My Data
                  </button>
                  <button onClick={handleAccountDelete} className="btn btn-danger">
                    <span>🗑️</span>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="goals-tab">
              <div className="section-header">
                <div className="header-content">
                  <h2>Health Goals</h2>
                  <p>Set ambitious targets and track your wellness journey with precision</p>
                </div>
                <div className="header-actions">
                  <button className="btn btn-outline">
                    <span>📊</span>
                    Progress Report
                  </button>
                </div>
              </div>
              
              <HealthGoals
                goals={healthGoals}
                onUpdate={handleGoalUpdate}
              />
              
              <div className="goals-motivation">
                <div className="motivation-card">
                  <div className="motivation-content">
                    <h3>🎯 Stay Motivated!</h3>
                    <p>"The groundwork for all happiness is good health." - Leigh Hunt</p>
                    <div className="motivation-stats">
                      <div className="stat">
                        <span className="stat-value">87%</span>
                        <span className="stat-label">Success Rate</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">15</span>
                        <span className="stat-label">Days Streak</span>
                      </div>
                    </div>
                  </div>
                  <div className="motivation-visual">
                    <div className="progress-ring">
                      <div className="ring-progress" style={{strokeDasharray: '283 400'}}></div>
                      <div className="ring-center">71%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="data-tab">
              <div className="section-header">
                <div className="header-content">
                  <h2>Data Sources</h2>
                  <p>Connect your favorite devices and apps for comprehensive health tracking</p>
                </div>
                <div className="header-actions">
                  <button className="btn btn-primary">
                    <span>➕</span>
                    Add Device
                  </button>
                </div>
              </div>
              
              <DataSources
                connectedDevices={connectedDevices}
                onUpdate={handleDeviceUpdate}
              />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="notifications-tab">
              <div className="section-header">
                <div className="header-content">
                  <h2>Notification Preferences</h2>
                  <p>Customize how and when you receive important health updates and insights</p>
                </div>
                <div className="header-actions">
                  <button className="btn btn-outline">
                    <span>🧪</span>
                    Test Notifications
                  </button>
                </div>
              </div>
              
              <NotificationSettings
                preferences={notificationPrefs}
                onUpdate={handleNotificationUpdate}
              />

              <div className="notification-preview-enhanced">
                <h3>Notification Examples</h3>
                <p>Here's how your notifications will look across different channels</p>
                <div className="preview-grid">
                  <div className="preview-card push">
                    <div className="preview-header">
                      <span className="preview-type">📱 Push Notification</span>
                      <span className="preview-time">2 min ago</span>
                    </div>
                    <div className="preview-content">
                      <h4>🌟 Excellent sleep quality detected!</h4>
                      <p>You achieved 8.2 hours of deep, restorative sleep. Your recovery score is 94/100.</p>
                    </div>
                  </div>
                  <div className="preview-card email">
                    <div className="preview-header">
                      <span className="preview-type">📧 Email Digest</span>
                      <span className="preview-time">Weekly</span>
                    </div>
                    <div className="preview-content">
                      <h4>📊 Your Weekly Health Summary</h4>
                      <p>Great progress this week! You exceeded your step goal 5 out of 7 days and maintained consistent sleep patterns.</p>
                    </div>
                  </div>
                  <div className="preview-card goal">
                    <div className="preview-header">
                      <span className="preview-type">🎯 Goal Achievement</span>
                      <span className="preview-time">Daily</span>
                    </div>
                    <div className="preview-content">
                      <h4>🏆 10,000 steps milestone reached!</h4>
                      <p>Congratulations! You've maintained this streak for 15 consecutive days. Keep up the amazing work!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="floating-actions">
        <button className="fab-main" title="Quick Actions">
          <span>⚡</span>
        </button>
        <div className="fab-menu">
          <button className="fab-item" title="Add Data">📊</button>
          <button className="fab-item" title="Quick Goal">🎯</button>
          <button className="fab-item" title="Sync Devices">📱</button>
          <button className="fab-item" title="Export Data">📥</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;