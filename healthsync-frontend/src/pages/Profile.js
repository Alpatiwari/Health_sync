import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import UserProfile from '../components/profile/UserProfile';
import HealthGoals from '../components/profile/HealthGoals';
import DataSources from '../components/profile/DataSources';
import NotificationSettings from '../components/profile/NotificationSettings';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { api } from '../services/api';
import '../styles/components.css';

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
    { id: 'profile', label: 'Personal Info', icon: '👤' },
    { id: 'goals', label: 'Health Goals', icon: '🎯' },
    { id: 'data', label: 'Data Sources', icon: '📱' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
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
      <div className="page-header">
        <div className="header-content">
          <h1>Profile Settings</h1>
          <p>Manage your personal information, health goals, and preferences</p>
        </div>
        
        {saveStatus && (
          <div className={`save-status ${saveStatus}`}>
            {saveStatus === 'saving' && '💾 Saving...'}
            {saveStatus === 'success' && '✅ Saved successfully!'}
            {saveStatus === 'error' && '❌ Save failed. Please try again.'}
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'profile' && (
          <div className="profile-tab">
            <div className="section-header">
              <h2>Personal Information</h2>
              <p>Keep your profile information up to date for personalized insights</p>
            </div>
            
            <UserProfile
              profileData={profileData}
              onSave={handleProfileSave}
              loading={loading}
            />

            <div className="profile-stats">
              <div className="stat-card">
                <h3>Account Created</h3>
                <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="stat-card">
                <h3>Data Points Collected</h3>
                <p>2,847</p>
              </div>
              <div className="stat-card">
                <h3>Insights Generated</h3>
                <p>156</p>
              </div>
              <div className="stat-card">
                <h3>Goals Achieved</h3>
                <p>12</p>
              </div>
            </div>

            <div className="danger-zone">
              <h3>Data Management</h3>
              <div className="danger-actions">
                <button onClick={exportUserData} className="btn btn-outline">
                  📥 Export My Data
                </button>
                <button onClick={handleAccountDelete} className="btn btn-danger">
                  🗑️ Delete Account
                </button>
              </div>
              <p className="danger-note">
                Export your data anytime. Account deletion is permanent and cannot be undone.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="goals-tab">
            <div className="section-header">
              <h2>Health Goals</h2>
              <p>Set and track your health objectives for better motivation</p>
            </div>
            
            <HealthGoals
              goals={healthGoals}
              onUpdate={handleGoalUpdate}
            />
          </div>
        )}

        {activeTab === 'data' && (
          <div className="data-tab">
            <div className="section-header">
              <h2>Data Sources</h2>
              <p>Connect your devices and apps to sync health data automatically</p>
            </div>
            
            <DataSources
              connectedDevices={connectedDevices}
              onUpdate={handleDeviceUpdate}
            />

            <div className="data-privacy">
              <h3>Data Privacy & Security</h3>
              <div className="privacy-info">
                <div className="privacy-item">
                  <span className="privacy-icon">🔐</span>
                  <div>
                    <h4>Encrypted Storage</h4>
                    <p>All your health data is encrypted using industry-standard AES-256 encryption</p>
                  </div>
                </div>
                <div className="privacy-item">
                  <span className="privacy-icon">🚫</span>
                  <div>
                    <h4>No Data Selling</h4>
                    <p>We never sell or share your personal health information with third parties</p>
                  </div>
                </div>
                <div className="privacy-item">
                  <span className="privacy-icon">👤</span>
                  <div>
                    <h4>Your Data, Your Control</h4>
                    <p>You can export or delete your data at any time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="notifications-tab">
            <div className="section-header">
              <h2>Notification Preferences</h2>
              <p>Choose how and when you want to receive updates about your health</p>
            </div>
            
            <NotificationSettings
              preferences={notificationPrefs}
              onUpdate={handleNotificationUpdate}
            />

            <div className="notification-preview">
              <h3>Notification Examples</h3>
              <div className="example-notifications">
                <div className="notification-example">
                  <div className="notification-type">Daily Insight</div>
                  <div className="notification-content">
                    <h4>🌟 Great sleep quality last night!</h4>
                    <p>You got 8.2 hours of quality sleep. Your REM sleep was 23% above average.</p>
                  </div>
                </div>
                <div className="notification-example">
                  <div className="notification-type">Goal Reminder</div>
                  <div className="notification-content">
                    <h4>🎯 You're 2,500 steps away from your daily goal</h4>
                    <p>A 25-minute walk could help you reach your 10,000 step target!</p>
                  </div>
                </div>
                <div className="notification-example">
                  <div className="notification-type">Health Alert</div>
                  <div className="notification-content">
                    <h4>⚠️ Unusual heart rate pattern detected</h4>
                    <p>Your resting heart rate has been elevated for 3 days. Consider consulting a healthcare provider.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;