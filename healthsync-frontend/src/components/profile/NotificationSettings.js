import React, { useState, useEffect, useCallback } from 'react';

const NotificationSettings = ({ preferences = {}, onUpdate }) => {
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

  // Check browser notification permission
  const checkPermissionStatus = useCallback(async () => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    } else {
      setPermissionStatus('denied');
    }
  }, []);

  // Request notification permission
  const handlePermissionRequest = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
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
    }
  };

  useEffect(() => {
    // Merge provided preferences with default settings
    if (preferences && Object.keys(preferences).length > 0) {
      setSettings(prevSettings => ({
        ...prevSettings,
        ...preferences
      }));
    }
    checkPermissionStatus();
  }, [preferences, checkPermissionStatus]);

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
      if (onUpdate) {
        await onUpdate(settings);
      }
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
      if (type === 'push' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Test Notification', {
          body: 'This is a test notification from HealthSync!',
          icon: '/favicon.ico'
        });
      }
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
      <div key={categoryKey} style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h4 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              textTransform: 'capitalize'
            }}>
              {categoryKey.replace('_', ' ')}
            </h4>
            <div style={{
              backgroundColor: getPriorityColor(category.priority),
              color: 'white',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              textTransform: 'capitalize'
            }}>
              {category.priority}
            </div>
          </div>
          <label style={{
            display: 'inline-block',
            position: 'relative',
            width: '48px',
            height: '24px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={category.enabled}
              onChange={(e) => handleCategoryChange(categoryKey, 'enabled', e.target.checked)}
              style={{ display: 'none' }}
            />
            <span style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: category.enabled ? '#10b981' : '#d1d5db',
              transition: '0.3s',
              borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute',
                content: '""',
                height: '18px',
                width: '18px',
                left: category.enabled ? '27px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                transition: '0.3s',
                borderRadius: '50%'
              }}></span>
            </span>
          </label>
        </div>
        
        {category.enabled && (
          <div style={{ paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Priority Level:
              </label>
              <select
                value={category.priority}
                onChange={(e) => handleCategoryChange(categoryKey, 'priority', e.target.value)}
                style={{
                  width: '120px',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <h5 style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Notification Channels:
              </h5>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {['push', 'email', 'inApp'].map(channel => (
                  <label key={channel} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#374151'
                  }}>
                    <input
                      type="checkbox"
                      checked={category.channels.includes(channel)}
                      onChange={() => handleChannelToggle(categoryKey, channel)}
                      style={{
                        width: '16px',
                        height: '16px',
                        accentColor: '#10b981'
                      }}
                    />
                    <span style={{ textTransform: 'capitalize' }}>{channel}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    ));
  };

  // Mock LoadingSpinner component
  const LoadingSpinnerComponent = () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
      fontSize: '18px',
      color: '#6b7280'
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        border: '3px solid #f3f4f6',
        borderTop: '3px solid #10b981',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginRight: '12px'
      }}></div>
      Loading...
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  // Mock NotificationBanner component
  const NotificationBannerComponent = ({ type, message, onClose }) => {
    const colors = {
      success: { bg: '#dcfce7', border: '#16a34a', text: '#15803d' },
      error: { bg: '#fef2f2', border: '#dc2626', text: '#dc2626' },
      warning: { bg: '#fefce8', border: '#ca8a04', text: '#a16207' },
      info: { bg: '#eff6ff', border: '#2563eb', text: '#1d4ed8' }
    };

    return (
      <div style={{
        backgroundColor: colors[type].bg,
        border: `1px solid ${colors[type].border}`,
        color: colors[type].text,
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>{message}</span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: colors[type].text,
            cursor: 'pointer',
            fontSize: '18px',
            padding: '0 4px'
          }}
        >
          ×
        </button>
      </div>
    );
  };

  if (loading && !settings) {
    return <LoadingSpinnerComponent />;
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {notification && (
        <NotificationBannerComponent
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1f2937',
          marginBottom: '8px'
        }}>
          Notification Settings
        </h2>
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          margin: 0
        }}>
          Customize how and when you receive health insights and alerts
        </p>
      </div>

      {/* Permission Status */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              margin: 0,
              marginBottom: '4px'
            }}>
              Browser Permissions
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '18px' }}>
                {getPermissionIcon(permissionStatus)}
              </span>
              <span style={{
                color: '#6b7280',
                fontSize: '14px'
              }}>
                {getPermissionText(permissionStatus)}
              </span>
            </div>
          </div>
          {permissionStatus !== 'granted' && (
            <button 
              onClick={handlePermissionRequest}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
            >
              Enable Notifications
            </button>
          )}
        </div>
      </div>

      {/* Master Toggle */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1f2937',
            margin: 0
          }}>
            Master Settings
          </h3>
          <label style={{
            display: 'inline-block',
            position: 'relative',
            width: '48px',
            height: '24px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => handleSettingChange('enabled', e.target.checked)}
              style={{ display: 'none' }}
            />
            <span style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: settings.enabled ? '#10b981' : '#d1d5db',
              transition: '0.3s',
              borderRadius: '24px'
            }}>
              <span style={{
                position: 'absolute',
                content: '""',
                height: '18px',
                width: '18px',
                left: settings.enabled ? '27px' : '3px',
                bottom: '3px',
                backgroundColor: 'white',
                transition: '0.3s',
                borderRadius: '50%'
              }}></span>
            </span>
          </label>
        </div>
      </div>

      {/* Advanced Category Settings */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🎯 Advanced Category Settings
        </h3>
        {renderCategorySettings()}
      </div>

      {/* Test Section */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '12px'
        }}>
          Test Notifications
        </h3>
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => handleTestNotification('push')}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
          >
            📱 Send Test Push
          </button>
          <button 
            onClick={() => handleTestNotification('email')}
            style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#7c3aed'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#8b5cf6'}
          >
            📧 Send Test Email
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div style={{
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end'
      }}>
        <button 
          onClick={() => setSettings(preferences)}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
        >
          Reset to Defaults
        </button>
        <button 
          onClick={handleSaveSettings}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#9ca3af' : '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => {
            if (!loading) e.target.style.backgroundColor = '#059669'
          }}
          onMouseOut={(e) => {
            if (!loading) e.target.style.backgroundColor = '#10b981'
          }}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;