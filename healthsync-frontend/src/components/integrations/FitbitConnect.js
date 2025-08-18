import React, { useState, useEffect } from 'react';
import { useDeviceIntegration } from '../../hooks/useDeviceIntegration';
import NotificationBanner from '../common/NotificationBanner';


const FitbitConnect = () => {
  const { 
    fitbitConnection, 
    connectFitbit, 
    disconnectFitbit, 
    syncFitbitData,
    getFitbitDevices,
    getFitbitProfile 
  } = useDeviceIntegration();
  
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [fitbitProfile, setFitbitProfile] = useState(null);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [selectedScopes, setSelectedScopes] = useState([]);

  const fitbitScopes = [
    {
      id: 'activity',
      name: 'Activity & Exercise',
      icon: '🏃‍♂️',
      description: 'Steps, distance, calories, active minutes, exercise sessions',
      required: true
    },
    {
      id: 'heartrate',
      name: 'Heart Rate',
      icon: '❤️',
      description: 'Resting heart rate, heart rate zones, intraday heart rate',
      required: false
    },
    {
      id: 'sleep',
      name: 'Sleep',
      icon: '😴',
      description: 'Sleep duration, efficiency, stages, sleep score',
      required: false
    },
    {
      id: 'weight',
      name: 'Body & Weight',
      icon: '⚖️',
      description: 'Weight, BMI, body fat percentage, measurements',
      required: false
    },
    {
      id: 'nutrition',
      name: 'Food & Water',
      icon: '🍽️',
      description: 'Food logging, calorie intake, water consumption',
      required: false
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: '👤',
      description: 'Basic profile information, timezone, locale',
      required: true
    }
  ];

  useEffect(() => {
    // Set default required scopes
    setSelectedScopes(fitbitScopes.filter(scope => scope.required).map(scope => scope.id));
  }, []);

  useEffect(() => {
    if (fitbitConnection?.connected) {
      loadFitbitData();
    }
  }, [fitbitConnection]);

  const loadFitbitData = async () => {
    try {
      const [profile, devices] = await Promise.all([
        getFitbitProfile(),
        getFitbitDevices()
      ]);
      setFitbitProfile(profile);
      setConnectedDevices(devices);
    } catch (error) {
      console.error('Error loading Fitbit data:', error);
    }
  };

  const handleConnect = async () => {
    if (selectedScopes.length === 0) {
      setNotification({
        type: 'warning',
        message: 'Please select at least the required scopes'
      });
      return;
    }

    setLoading(true);
    try {
      await connectFitbit(selectedScopes);
      setNotification({
        type: 'success',
        message: 'Successfully connected to Fitbit!'
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
      await disconnectFitbit();
      setNotification({
        type: 'info',
        message: 'Disconnected from Fitbit'
      });
      setFitbitProfile(null);
      setConnectedDevices([]);
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Disconnect failed: ${error.message}`
      });
    }
  };

  const handleSync = async (scope = null) => {
    setSyncing(true);
    try {
      await syncFitbitData(scope);
      setNotification({
        type: 'success',
        message: scope ? `${scope} data synced successfully!` : 'All Fitbit data synced successfully!'
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

  const handleScopeToggle = (scopeId) => {
    const scope = fitbitScopes.find(s => s.id === scopeId);
    if (scope.required) return; // Can't toggle required scopes

    setSelectedScopes(prev => 
      prev.includes(scopeId)
        ? prev.filter(id => id !== scopeId)
        : [...prev, scopeId]
    );
  };

  const formatLastSync = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getDeviceIcon = (deviceType) => {
    const deviceIcons = {
      'tracker': '⌚',
      'scale': '⚖️',
      'watch': '⌚',
      'phone': '📱'
    };
    return deviceIcons[deviceType] || '📱';
  };

  const getBatteryColor = (level) => {
    if (level > 50) return '#10B981';
    if (level > 20) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="fitbit-connect">
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
            src="/integration-icons/fitbit.png" 
            alt="Fitbit" 
            className="service-icon"
          />
          <div>
            <h2>Fitbit Integration</h2>
            <p>Connect your Fitbit account to sync fitness and health data</p>
          </div>
        </div>
        
        <div className="connection-status">
          {fitbitConnection?.connected ? (
            <div className="status connected">
              <span className="status-indicator">🟢 Connected</span>
              <span className="account-info">
                {fitbitProfile?.displayName || fitbitConnection.email}
              </span>
            </div>
          ) : (
            <div className="status disconnected">
              <span className="status-indicator">⚪ Not Connected</span>
            </div>
          )}
        </div>
      </div>

      {!fitbitConnection?.connected ? (
        <div className="connection-setup">
          <div className="setup-info">
            <h3>Connect Your Fitbit Account</h3>
            <p>
              Sync your Fitbit data including activity, sleep, heart rate, and more. 
              Choose which data types you want to share with HealthSync.
            </p>
          </div>

          <div className="scope-selection">
            <h4>Data Permissions</h4>
            <p>Select the types of data you want to sync from your Fitbit account:</p>
            
            <div className="scopes-grid">
              {fitbitScopes.map(scope => (
                <div 
                  key={scope.id}
                  className={`scope-card ${
                    selectedScopes.includes(scope.id) ? 'selected' : ''
                  } ${scope.required ? 'required' : ''}`}
                  onClick={() => handleScopeToggle(scope.id)}
                >
                  <div className="scope-header">
                    <span className="scope-icon">{scope.icon}</span>
                    <h5>{scope.name}</h5>
                    {scope.required && <span className="required-badge">Required</span>}
                  </div>
                  <p className="scope-description">{scope.description}</p>
                  <div className="selection-indicator">
                    {selectedScopes.includes(scope.id) && '✓'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="connection-actions">
            <button 
              className="connect-btn primary"
              onClick={handleConnect}
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect to Fitbit'}
            </button>
          </div>

          <div className="oauth-info">
            <h4>🔐 Secure Connection</h4>
            <p>
              You'll be redirected to Fitbit's secure login page to authorize the connection. 
              We use OAuth 2.0 for secure authentication and never store your Fitbit password.
            </p>
            <div className="security-features">
              <div className="feature">✅ OAuth 2.0 secure authentication</div>
              <div className="feature">✅ Encrypted data transmission</div>
              <div className="feature">✅ Revocable access tokens</div>
              <div className="feature">✅ No password storage</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="connected-view">
          {fitbitProfile && (
            <div className="profile-overview">
              <div className="profile-card">
                <img 
                  src={fitbitProfile.avatar || '/default-avatar.png'} 
                  alt={fitbitProfile.displayName}
                  className="profile-avatar"
                />
                <div className="profile-info">
                  <h3>{fitbitProfile.displayName}</h3>
                  <p>Member since {new Date(fitbitProfile.memberSince).toLocaleDateString()}</p>
                  <div className="profile-stats">
                    <div className="stat">
                      <span className="stat-value">{fitbitProfile.averageDailySteps || 0}</span>
                      <span className="stat-label">Avg Daily Steps</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{fitbitProfile.lifetimeDistance || 0}</span>
                      <span className="stat-label">Lifetime Miles</span>
                    </div>
                  </div>
                </div>
                <div className="sync-actions">
                  <button 
                    className="sync-all-btn"
                    onClick={() => handleSync()}
                    disabled={syncing}
                  >
                    {syncing ? '🔄 Syncing...' : '🔄 Sync All'}
                  </button>
                  <button 
                    className="disconnect-btn secondary"
                    onClick={handleDisconnect}
                  >
                    🔌 Disconnect
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="connected-devices">
            <h3>Connected Devices</h3>
            {connectedDevices.length === 0 ? (
              <div className="no-devices">
                <p>No Fitbit devices found in your account</p>
              </div>
            ) : (
              <div className="devices-grid">
                {connectedDevices.map(device => (
                  <div key={device.id} className="device-card">
                    <div className="device-header">
                      <span className="device-icon">{getDeviceIcon(device.type)}</span>
                      <div className="device-info">
                        <h4>{device.deviceVersion}</h4>
                        <p className="device-type">{device.type}</p>
                      </div>
                      <div className="device-status">
                        <span className={`status-badge ${device.lastSyncTime ? 'active' : 'inactive'}`}>
                          {device.lastSyncTime ? '🟢 Active' : '🔴 Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="device-details">
                      <div className="detail-row">
                        <span>Battery:</span>
                        <span 
                          className="battery-level"
                          style={{ color: getBatteryColor(device.battery) }}
                        >
                          🔋 {device.battery}%
                        </span>
                      </div>
                      <div className="detail-row">
                        <span>Last Sync:</span>
                        <span>{formatLastSync(device.lastSyncTime)}</span>
                      </div>
                      <div className="detail-row">
                        <span>MAC:</span>
                        <span className="mac-address">{device.mac}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="data-categories">
            <h3>Data Categories</h3>
            <div className="categories-grid">
              {fitbitScopes.filter(scope => selectedScopes.includes(scope.id)).map(scope => (
                <div key={scope.id} className="category-card">
                  <div className="category-header">
                    <span className="category-icon">{scope.icon}</span>
                    <h4>{scope.name}</h4>
                  </div>
                  <div className="category-info">
                    <div className="last-sync">
                      Last sync: {formatLastSync(fitbitConnection.lastSync?.[scope.id])}
                    </div>
                    <div className="record-count">
                      {fitbitConnection.records?.[scope.id] || 0} records
                    </div>
                  </div>
                  <button 
                    className="category-sync-btn"
                    onClick={() => handleSync(scope.id)}
                    disabled={syncing}
                  >
                    🔄 Sync
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="sync-settings">
            <h3>Sync Settings</h3>
            <div className="settings-grid">
              <div className="setting-group">
                <h4>Automatic Sync</h4>
                <div className="setting-row">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Enable auto-sync every 2 hours
                  </label>
                </div>
                <div className="setting-row">
                  <label>
                    <input type="checkbox" defaultChecked />
                    Sync when app opens
                  </label>
                </div>
              </div>
              
              <div className="setting-group">
                <h4>Data Range</h4>
                <div className="setting-row">
                  <label>
                    Historical data range:
                    <select defaultValue="30">
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="90">Last 90 days</option>
                      <option value="365">Last year</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="setting-group">
                <h4>Notifications</h4>
                <div className="setting-row">
                  <label>
                    <input type="checkbox" />
                    Notify on sync completion
                  </label>
                </div>
                <div className="setting-row">
                  <label>
                    <input type="checkbox" />
                    Notify on sync errors
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="help-section">
        <h3>Fitbit Integration Help</h3>
        <div className="help-cards">
          <div className="help-card">
            <h4>🔄 Sync Frequency</h4>
            <p>Data syncs automatically every 2 hours when connected. You can also sync manually anytime.</p>
          </div>
          <div className="help-card">
            <h4>📊 Available Data</h4>
            <p>Steps, heart rate, sleep, weight, and exercise data from all your connected Fitbit devices.</p>
          </div>
          <div className="help-card">
            <h4>🔒 Privacy & Security</h4>
            <p>Your Fitbit data is encrypted and securely stored. You can revoke access anytime in your Fitbit account.</p>
          </div>
          <div className="help-card">
            <h4>⚠️ Troubleshooting</h4>
            <p>If sync fails, try disconnecting and reconnecting your account, or check your internet connection.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FitbitConnect;