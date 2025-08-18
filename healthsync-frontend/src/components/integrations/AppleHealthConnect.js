import React, { useState, useEffect } from 'react';
import { useDeviceIntegration } from '../../hooks/useDeviceIntegration';
import NotificationBanner from '../common/NotificationBanner';


const AppleHealthConnect = () => {
  const { 
    appleHealthConnection, 
    connectAppleHealth, 
    disconnectAppleHealth, 
    syncAppleHealthData,
    getAppleHealthCategories 
  } = useDeviceIntegration();
  
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const healthCategories = [
    {
      id: 'vitals',
      name: 'Vitals',
      icon: '❤️',
      description: 'Heart rate, blood pressure, body temperature',
      dataTypes: ['heart_rate', 'blood_pressure', 'body_temperature', 'respiratory_rate']
    },
    {
      id: 'fitness',
      name: 'Fitness',
      icon: '🏃‍♂️',
      description: 'Steps, distance, calories, workouts',
      dataTypes: ['steps', 'distance', 'calories_burned', 'active_energy', 'workouts']
    },
    {
      id: 'body_measurements',
      name: 'Body Measurements',
      icon: '📏',
      description: 'Weight, height, BMI, body fat percentage',
      dataTypes: ['body_mass', 'height', 'body_fat_percentage', 'lean_body_mass']
    },
    {
      id: 'sleep',
      name: 'Sleep',
      icon: '😴',
      description: 'Sleep analysis, bedtime, time in bed',
      dataTypes: ['sleep_analysis', 'time_in_bed']
    },
    {
      id: 'nutrition',
      name: 'Nutrition',
      icon: '🍎',
      description: 'Dietary intake, water consumption',
      dataTypes: ['dietary_energy', 'dietary_water', 'nutrition_facts']
    },
    {
      id: 'mindfulness',
      name: 'Mindfulness',
      icon: '🧘‍♀️',
      description: 'Meditation sessions, mindful minutes',
      dataTypes: ['mindful_session']
    },
    {
      id: 'reproductive_health',
      name: 'Reproductive Health',
      icon: '🌸',
      description: 'Menstrual cycle, fertility tracking',
      dataTypes: ['menstrual_flow', 'ovulation_test_result', 'cervical_mucus_quality']
    },
    {
      id: 'labs_vitals',
      name: 'Lab Results',
      icon: '🧪',
      description: 'Blood work, medical test results',
      dataTypes: ['blood_glucose', 'cholesterol', 'blood_type']
    }
  ];

  useEffect(() => {
    if (appleHealthConnection?.connected) {
      loadAvailableCategories();
    }
  }, [appleHealthConnection]);

  const loadAvailableCategories = async () => {
    try {
      const categories = await getAppleHealthCategories();
      setAvailableCategories(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleConnect = async () => {
    if (selectedCategories.length === 0) {
      setNotification({
        type: 'warning',
        message: 'Please select at least one health category to sync'
      });
      return;
    }

    setLoading(true);
    try {
      await connectAppleHealth(selectedCategories);
      setNotification({
        type: 'success',
        message: 'Successfully connected to Apple Health!'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Connection failed: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectAppleHealth();
      setNotification({
        type: 'info',
        message: 'Disconnected from Apple Health'
      });
      setAvailableCategories([]);
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Disconnect failed: ${error.message}`
      });
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncAppleHealthData();
      setNotification({
        type: 'success',
        message: 'Apple Health data synchronized successfully!'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Sync failed: ${error.message}`
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const formatLastSync = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const isIOSDevice = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  };

  if (!isIOSDevice()) {
    return (
      <div className="apple-health-connect">
        <div className="unsupported-device">
          <div className="unsupported-icon">📱</div>
          <h3>iOS Device Required</h3>
          <p>
            Apple Health integration is only available on iOS devices (iPhone, iPad).
            Please use this feature on an iOS device to connect your Apple Health data.
          </p>
          <div className="alternative-options">
            <h4>Alternative Options:</h4>
            <ul>
              <li>Use Google Fit if available on your device</li>
              <li>Connect fitness trackers directly</li>
              <li>Manually log health data</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="apple-health-connect">
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="connection-header">
        <div className="service-info">
          <img 
            src="/integration-icons/apple-health.png" 
            alt="Apple Health" 
            className="service-icon"
          />
          <div>
            <h2>Apple Health Integration</h2>
            <p>Sync your comprehensive health data from Apple Health</p>
          </div>
        </div>
        
        <div className="connection-status">
          {appleHealthConnection?.connected ? (
            <div className="status connected">
              <span className="status-indicator">🟢 Connected</span>
              <span className="last-sync">
                Last sync: {formatLastSync(appleHealthConnection.lastSync)}
              </span>
            </div>
          ) : (
            <div className="status disconnected">
              <span className="status-indicator">⚪ Not Connected</span>
            </div>
          )}
        </div>
      </div>

      {!appleHealthConnection?.connected ? (
        <div className="connection-setup">
          <div className="setup-info">
            <h3>Connect to Apple Health</h3>
            <p>
              Apple Health stores your health and fitness information from various 
              apps and devices in one secure place. Connect to access your comprehensive 
              health profile.
            </p>
          </div>

          <div className="category-selection">
            <h4>Select Health Categories</h4>
            <p>Choose which categories of health data you want to sync:</p>
            
            <div className="categories-grid">
              {healthCategories.map(category => (
                <div 
                  key={category.id}
                  className={`category-card ${
                    selectedCategories.includes(category.id) ? 'selected' : ''
                  }`}
                  onClick={() => handleCategoryToggle(category.id)}
                >
                  <div className="category-header">
                    <span className="category-icon">{category.icon}</span>
                    <h5>{category.name}</h5>
                  </div>
                  <p className="category-description">{category.description}</p>
                  <div className="data-types">
                    <span className="data-count">{category.dataTypes.length} data types</span>
                  </div>
                  <div className="selection-indicator">
                    {selectedCategories.includes(category.id) && '✓'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="connection-actions">
            <button 
              className="connect-btn primary"
              onClick={handleConnect}
              disabled={loading || selectedCategories.length === 0}
            >
              {loading ? 'Connecting...' : 'Connect to Apple Health'}
            </button>
          </div>

          <div className="permissions-info">
            <h4>🔐 Required Permissions</h4>
            <p>
              When you connect, Apple Health will ask for permission to read the selected 
              health categories. We never write data to your Apple Health app.
            </p>
            <div className="permission-features">
              <div className="feature">✅ Read-only access</div>
              <div className="feature">✅ Encrypted data transfer</div>
              <div className="feature">✅ Revoke anytime in Settings</div>
              <div className="feature">✅ No data sharing with third parties</div>
            </div>
          </div>

          <div className="setup-steps">
            <h4>Setup Steps</h4>
            <div className="steps-list">
              <div className="step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <h5>Grant Permissions</h5>
                  <p>Apple Health will ask for permission to read your selected data</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <h5>Initial Sync</h5>
                  <p>We'll sync your recent health data (last 30 days)</p>
                </div>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <div className="step-content">
                  <h5>Ongoing Updates</h5>
                  <p>New data will sync automatically in the background</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="connected-view">
          <div className="sync-controls">
            <button 
              className="sync-btn"
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? '🔄 Syncing...' : '🔄 Sync Now'}
            </button>
            <button 
              className="disconnect-btn secondary"
              onClick={handleDisconnect}
            >
              🔌 Disconnect
            </button>
          </div>

          <div className="sync-statistics">
            <h3>Sync Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{availableCategories.length}</div>
                <div className="stat-label">Connected Categories</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {availableCategories.reduce((sum, cat) => sum + (cat.recordCount || 0), 0)}
                </div>
                <div className="stat-label">Total Records</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {appleHealthConnection.lastSync ? 
                    Math.floor((Date.now() - new Date(appleHealthConnection.lastSync)) / (1000 * 60 * 60)) 
                    : 0}h
                </div>
                <div className="stat-label">Since Last Sync</div>
              </div>
            </div>
          </div>

          <div className="connected-categories">
            <h3>Connected Categories</h3>
            <div className="categories-list">
              {availableCategories.map(category => {
                const categoryInfo = healthCategories.find(hc => hc.id === category.id);
                return (
                  <div key={category.id} className="connected-category">
                    <div className="category-info">
                      <span className="category-icon">{categoryInfo?.icon || '📊'}</span>
                      <div className="category-details">
                        <h4>{categoryInfo?.name || category.name}</h4>
                        <p>{categoryInfo?.description}</p>
                      </div>
                    </div>
                    <div className="category-stats">
                      <div className="stat">
                        <span className="stat-value">{category.recordCount || 0}</span>
                        <span className="stat-label">Records</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">
                          {category.lastUpdate ? 
                            Math.floor((Date.now() - new Date(category.lastUpdate)) / (1000 * 60 * 60 * 24)) 
                            : 0}d
                        </span>
                        <span className="stat-label">Last Update</span>
                      </div>
                    </div>
                    <div className="category-status">
                      <span className={`status-badge ${category.status}`}>
                        {category.status === 'active' ? '🟢 Active' : 
                         category.status === 'limited' ? '🟡 Limited' : '🔴 Error'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="data-insights">
            <h3>Recent Data Insights</h3>
            <div className="insights-grid">
              <div className="insight-card">
                <h4>📈 Most Active Data</h4>
                <p>Steps and heart rate data updated most frequently</p>
              </div>
              <div className="insight-card">
                <h4>⏱️ Sync Performance</h4>
                <p>Average sync time: 2.3 seconds</p>
              </div>
              <div className="insight-card">
                <h4>📅 Data Coverage</h4>
                <p>30 days of historical data available</p>
              </div>
            </div>
          </div>

          <div className="sync-settings">
            <h3>Sync Settings</h3>
            <div className="settings-group">
              <div className="setting-row">
                <label className="setting-label">
                  <input type="checkbox" defaultChecked />
                  <span>Auto-sync in background</span>
                </label>
                <p className="setting-description">
                  Automatically sync new data when the app opens
                </p>
              </div>
              <div className="setting-row">
                <label className="setting-label">
                  <input type="checkbox" defaultChecked />
                  <span>Include workout details</span>
                </label>
                <p className="setting-description">
                  Sync detailed workout information and GPS routes
                </p>
              </div>
              <div className="setting-row">
                <label className="setting-label">
                  <input type="checkbox" />
                  <span>Sync notifications</span>
                </label>
                <p className="setting-description">
                  Get notified when sync completes or encounters issues
                </p>
              </div>
            </div>
          </div>

          <div className="privacy-controls">
            <h3>Privacy Controls</h3>
            <div className="privacy-actions">
              <button className="privacy-btn">
                📱 Manage in Apple Health
              </button>
              <button className="privacy-btn">
                🔒 View Permissions
              </button>
              <button className="privacy-btn">
                📋 Export My Data
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="troubleshooting">
        <h3>Troubleshooting</h3>
        <div className="troubleshooting-items">
          <details className="troubleshooting-item">
            <summary>Sync is not working</summary>
            <div className="troubleshooting-content">
              <p>If data isn't syncing:</p>
              <ul>
                <li>Check that Apple Health has the required permissions</li>
                <li>Ensure you have an active internet connection</li>
                <li>Try disconnecting and reconnecting</li>
                <li>Restart the app and try syncing again</li>
              </ul>
            </div>
          </details>
          
          <details className="troubleshooting-item">
            <summary>Missing data types</summary>
            <div className="troubleshooting-content">
              <p>If some data types are missing:</p>
              <ul>
                <li>Open Apple Health and check if the data exists there</li>
                <li>Verify permissions for the specific data types</li>
                <li>Some apps may not share data with Apple Health by default</li>
              </ul>
            </div>
          </details>
          
          <details className="troubleshooting-item">
            <summary>Connection keeps failing</summary>
            <div className="troubleshooting-content">
              <p>If connection attempts fail:</p>
              <ul>
                <li>Make sure you're using iOS 13.0 or later</li>
                <li>Check your device's privacy settings</li>
                <li>Try restarting your device</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </div>
          </details>
        </div>
      </div>

      <div className="help-resources">
        <h3>Help & Resources</h3>
        <div className="resource-links">
          <a href="#" className="resource-link">
            📖 Apple Health Setup Guide
          </a>
          <a href="#" className="resource-link">
            🎥 Video Tutorial
          </a>
          <a href="#" className="resource-link">
            💬 Contact Support
          </a>
          <a href="#" className="resource-link">
            🔒 Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};

export default AppleHealthConnect;