import React, { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import LoadingSpinner from '../common/LoadingSpinner';
import NotificationBanner from '../common/NotificationBanner';


const NotificationSettings = () => {
  const { 
    notificationSettings, 
    updateNotificationSettings, 
    testNotification,
    getNotificationPermission,
    requestNotificationPermission 
  } = useNotifications();
  
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState('default');
  const [settings, setSettings] = useState({
    enabled: true,
    push: {
      enabled: true,
      alerts: true,
      insights: true,
      goals: true,
      reminders: true,
      social: false
    },
    email: {
      enabled: true,
      weekly_summary: true,
      monthly_report: true,
      goal_achievements: true,
      health_alerts: true,
      product_updates: false
    },
    inApp: {
      enabled: true,
      banner: true,
      sound: true,
      vibration: true
    },
    schedule: {
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      },
      timezone: 'auto',
      weekend_mode: false
    },
    categories: {
      health_alerts: {
        enabled: true,
        priority: 'high',
        channels: ['push', 'email']
      },
      goal_progress: {
        enabled: true,
        priority: 'medium',
        channels: ['push', 'inApp']
      },
      insights: {
        enabled: true,
        priority: 'medium',
        channels: ['push', 'inApp']
      },
      reminders: {
        enabled: true,
        priority: 'low',
        channels: ['push']
      },
      social: {
        enabled: false,
        priority: 'low',
        channels: ['push', 'inApp']
      },
      system: {
        enabled: true,
        priority: 'high',
        channels: ['push', 'inApp', 'email']
      }
    }
  });

  const checkPermissionStatus = useCallback(async () => {
    const permission = await getNotificationPermission();
    setPermissionStatus(permission);
  }, [getNotificationPermission]);

  useEffect(() => {
    if (notificationSettings) {
      setSettings(notificationSettings);
    }
    checkPermissionStatus();
  }, [notificationSettings, checkPermissionStatus]);

  const handlePermissionRequest = async () => {
    try {
      const permission = await requestNotificationPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        setNotification({
          type: 'success',
          message: 'Notification permissions granted successfully!'
        });
      } else {
        setNotification({
          type: 'warning',
          message: 'Notification permissions denied. Some features may not work properly.'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to request notification permissions'
      });
    }
  };

  const handleSettingChange = (path, value) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const handleCategoryChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: {
          ...prev.categories[category],
          [field]: value
        }
      }
    }));
  };

  const handleChannelToggle = (category, channel) => {
    setSettings(prev => {
      const currentChannels = prev.categories[category].channels;
      const newChannels = currentChannels.includes(channel)
        ? currentChannels.filter(c => c !== channel)
        : [...currentChannels, channel];
      
      return {
        ...prev,
        categories: {
          ...prev.categories,
          [category]: {
            ...prev.categories[category],
            channels: newChannels
          }
        }
      };
    });
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await updateNotificationSettings(settings);
      setNotification({
        type: 'success',
        message: 'Notification settings updated successfully!'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Failed to update settings: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async (type) => {
    try {
      await testNotification(type);
      setNotification({
        type: 'info',
        message: 'Test notification sent! Check your device.'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Failed to send test notification: ${error.message}`
      });
    }
  };

  const getPermissionIcon = (status) => {
    switch (status) {
      case 'granted': return '✅';
      case 'denied': return '❌';
      default: return '⚠️';
    }
  };

  const getPermissionText = (status) => {
    switch (status) {
      case 'granted': return 'Enabled';
      case 'denied': return 'Blocked';
      default: return 'Not Set';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const renderCategorySettings = () => {
    return Object.entries(settings.categories).map(([categoryKey, category]) => (
      <div key={categoryKey} className="category-card">
        <div className="category-header">
          <div className="category-info">
            <h4>{categoryKey.replace('_', ' ').toUpperCase()}</h4>
            <div className="priority-indicator" style={{backgroundColor: getPriorityColor(category.priority)}}>
              {category.priority}
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={category.enabled}
              onChange={(e) => handleCategoryChange(categoryKey, 'enabled', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        {category.enabled && (
          <div className="category-details">
            <div className="priority-section">
              <label htmlFor={`priority-${categoryKey}`}>Priority Level:</label>
              <select
                id={`priority-${categoryKey}`}
                value={category.priority}
                onChange={(e) => handleCategoryChange(categoryKey, 'priority', e.target.value)}
                className="priority-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="channels-section">
              <h5>Notification Channels:</h5>
              <div className="channel-options">
                {['push', 'email', 'inApp'].map(channel => (
                  <label key={channel} className="channel-option">
                    <input
                      type="checkbox"
                      checked={category.channels.includes(channel)}
                      onChange={() => handleChannelToggle(categoryKey, channel)}
                    />
                    <span className="channel-name">{channel}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    ));
  };

  if (!notificationSettings) {
    return <LoadingSpinner />;
  }

  return (
    <div className="notification-settings">
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="settings-header">
        <h2>Notification Settings</h2>
        <p>Customize how and when you receive health insights and alerts</p>
      </div>

      {/* Permission Status */}
      <div className="permission-section">
        <div className="permission-card">
          <div className="permission-info">
            <h3>Browser Permissions</h3>
            <div className="permission-status">
              <span className="permission-icon">{getPermissionIcon(permissionStatus)}</span>
              <span className="permission-text">{getPermissionText(permissionStatus)}</span>
            </div>
          </div>
          {permissionStatus !== 'granted' && (
            <button 
              className="permission-btn"
              onClick={handlePermissionRequest}
            >
              Enable Notifications
            </button>
          )}
        </div>
      </div>

      {/* Master Toggle */}
      <div className="settings-section">
        <div className="section-header">
          <h3>Master Settings</h3>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => handleSettingChange('enabled', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="settings-section">
        <div className="section-header">
          <h3>📱 Push Notifications</h3>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.push?.enabled}
              onChange={(e) => handleSettingChange('push.enabled', e.target.checked)}
              disabled={!settings.enabled}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {settings.push?.enabled && (
          <div className="subsettings">
            <div className="setting-row">
              <div className="setting-info">
                <h4>Health Alerts</h4>
                <p>Critical health insights and anomalies</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.push?.alerts}
                  onChange={(e) => handleSettingChange('push.alerts', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <h4>Daily Insights</h4>
                <p>Personalized health insights and trends</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.push?.insights}
                  onChange={(e) => handleSettingChange('push.insights', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <h4>Goal Progress</h4>
                <p>Updates on your health goals and achievements</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.push?.goals}
                  onChange={(e) => handleSettingChange('push.goals', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <h4>Reminders</h4>
                <p>Medication, exercise, and health check reminders</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.push?.reminders}
                  onChange={(e) => handleSettingChange('push.reminders', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <h4>Social Updates</h4>
                <p>Updates from health community and challenges</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.push?.social}
                  onChange={(e) => handleSettingChange('push.social', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="test-section">
              <button 
                className="test-btn"
                onClick={() => handleTestNotification('push')}
              >
                📱 Send Test Notification
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Email Notifications */}
      <div className="settings-section">
        <div className="section-header">
          <h3>📧 Email Notifications</h3>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.email?.enabled}
              onChange={(e) => handleSettingChange('email.enabled', e.target.checked)}
              disabled={!settings.enabled}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {settings.email?.enabled && (
          <div className="subsettings">
            <div className="setting-row">
              <div className="setting-info">
                <h4>Weekly Summary</h4>
                <p>Weekly health summary with insights and trends</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.email?.weekly_summary}
                  onChange={(e) => handleSettingChange('email.weekly_summary', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <h4>Monthly Report</h4>
                <p>Comprehensive monthly health report</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.email?.monthly_report}
                  onChange={(e) => handleSettingChange('email.monthly_report', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <h4>Goal Achievements</h4>
                <p>Celebrate when you reach important milestones</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.email?.goal_achievements}
                  onChange={(e) => handleSettingChange('email.goal_achievements', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <h4>Health Alerts</h4>
                <p>Important health alerts and recommendations</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.email?.health_alerts}
                  onChange={(e) => handleSettingChange('email.health_alerts', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <h4>Product Updates</h4>
                <p>New features and product announcements</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.email?.product_updates}
                  onChange={(e) => handleSettingChange('email.product_updates', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="test-section">
              <button 
                className="test-btn"
                onClick={() => handleTestNotification('email')}
              >
                📧 Send Test Email
              </button>
            </div>
          </div>
        )}
      </div>

      {/* In-App Notifications */}
      <div className="settings-section">
        <div className="section-header">
          <h3>🔔 In-App Notifications</h3>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.inApp?.enabled}
              onChange={(e) => handleSettingChange('inApp.enabled', e.target.checked)}
              disabled={!settings.enabled}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        {settings.inApp?.enabled && (
          <div className="subsettings">
            <div className="setting-row">
              <div className="setting-info">
                <h4>Banner Notifications</h4>
                <p>Show notification banners within the app</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.inApp?.banner}
                  onChange={(e) => handleSettingChange('inApp.banner', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <h4>Sound Effects</h4>
                <p>Play sound for in-app notifications</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.inApp?.sound}
                  onChange={(e) => handleSettingChange('inApp.sound', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-row">
              <div className="setting-info">
                <h4>Vibration</h4>
                <p>Vibrate device for important notifications</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.inApp?.vibration}
                  onChange={(e) => handleSettingChange('inApp.vibration', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Schedule Settings */}
      <div className="settings-section">
        <div className="section-header">
          <h3>⏰ Schedule & Timing</h3>
        </div>

        <div className="subsettings">
          <div className="setting-row">
            <div className="setting-info">
              <h4>Quiet Hours</h4>
              <p>Disable notifications during specified hours</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.schedule?.quietHours?.enabled}
                onChange={(e) => handleSettingChange('schedule.quietHours.enabled', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {settings.schedule?.quietHours?.enabled && (
            <div className="time-settings">
              <div className="time-input-group">
                <label htmlFor="quiet-start">Start Time:</label>
                <input
                  id="quiet-start"
                  type="time"
                  value={settings.schedule?.quietHours?.start}
                  onChange={(e) => handleSettingChange('schedule.quietHours.start', e.target.value)}
                />
              </div>
              <div className="time-input-group">
                <label htmlFor="quiet-end">End Time:</label>
                <input
                  id="quiet-end"
                  type="time"
                  value={settings.schedule?.quietHours?.end}
                  onChange={(e) => handleSettingChange('schedule.quietHours.end', e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="setting-row">
            <div className="setting-info">
              <h4>Weekend Mode</h4>
              <p>Reduce notification frequency on weekends</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={settings.schedule?.weekend_mode}
                onChange={(e) => handleSettingChange('schedule.weekend_mode', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="timezone-setting">
            <label htmlFor="timezone">Timezone:</label>
            <select
              id="timezone"
              value={settings.schedule?.timezone}
              onChange={(e) => handleSettingChange('schedule.timezone', e.target.value)}
              className="timezone-select"
            >
              <option value="auto">Auto-detect</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Asia/Shanghai">Shanghai</option>
              <option value="Asia/Kolkata">India</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Category Settings */}
      <div className="settings-section">
        <div className="section-header">
          <h3>🎯 Advanced Category Settings</h3>
        </div>
        <div className="categories-grid">
          {renderCategorySettings()}
        </div>
      </div>

      {/* Save Button */}
      <div className="settings-actions">
        <button 
          className={`save-btn ${loading ? 'loading' : ''}`}
          onClick={handleSaveSettings}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
        <button 
          className="reset-btn"
          onClick={() => setSettings(notificationSettings)}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;