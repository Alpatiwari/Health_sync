import React, { useState, useEffect } from 'react';
import { useDeviceIntegration } from '../../hooks/useDeviceIntegration';
import NotificationBanner from '../common/NotificationBanner';



const GoogleFitConnect = () => {
  const { 
    googleFitConnection, 
    connectGoogleFit, 
    disconnectGoogleFit, 
    syncGoogleFitData,
    getGoogleFitPermissions 
  } = useDeviceIntegration();
  
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [selectedDataTypes, setSelectedDataTypes] = useState([]);

  const availableDataTypes = [
    { 
      id: 'steps', 
      name: 'Steps', 
      icon: '👣',
      description: 'Daily step count and walking activity',
      category: 'Activity'
    },
    { 
      id: 'distance', 
      name: 'Distance', 
      icon: '📏',
      description: 'Distance traveled during activities',
      category: 'Activity'
    },
    { 
      id: 'calories', 
      name: 'Calories Burned', 
      icon: '🔥',
      description: 'Calories burned during activities',
      category: 'Activity'
    },
    { 
      id: 'heart_rate', 
      name: 'Heart Rate', 
      icon: '❤️',
      description: 'Heart rate measurements and zones',
      category: 'Vitals'
    },
    { 
      id: 'weight', 
      name: 'Body Weight', 
      icon: '⚖️',
      description: 'Body weight measurements',
      category: 'Body'
    },
    { 
      id: 'sleep', 
      name: 'Sleep Data', 
      icon: '😴',
      description: 'Sleep duration and quality metrics',
      category: 'Sleep'
    },
    { 
      id: 'nutrition', 
      name: 'Nutrition', 
      icon: '🍎',
      description: 'Nutritional intake and meal logging',
      category: 'Nutrition'
    },
    { 
      id: 'workouts', 
      name: 'Workout Sessions', 
      icon: '🏋️‍♂️',
      description: 'Exercise sessions and activity details',
      category: 'Activity'
    },
    { 
      id: 'blood_pressure', 
      name: 'Blood Pressure', 
      icon: '🩺',
      description: 'Blood pressure readings',
      category: 'Vitals'
    },
    { 
      id: 'blood_glucose', 
      name: 'Blood Glucose', 
      icon: '🩸',
      description: 'Blood glucose level measurements',
      category: 'Vitals'
    }
  ];

  useEffect(() => {
    if (googleFitConnection?.connected) {
      loadPermissions();
    }
  }, [googleFitConnection]);

  const loadPermissions = async () => {
    try {
      const perms = await getGoogleFitPermissions();
      setPermissions(perms);
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  const handleConnect = async () => {
    if (selectedDataTypes.length === 0) {
      setNotification({
        type: 'warning',
        message: 'Please select at least one data type to sync'
      });
      return;
    }

    setLoading(true);
    try {
      await connectGoogleFit(selectedDataTypes);
      setNotification({
        type: 'success',
        message: 'Successfully connected to Google Fit!'
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
      await disconnectGoogleFit();
      setNotification({
        type: 'info',
        message: 'Disconnected from Google Fit'
      });
      setPermissions([]);
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
      await syncGoogleFitData();
      setNotification({
        type: 'success',
        message: 'Data synchronized successfully!'
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

  const handleDataTypeToggle = (dataTypeId) => {
    setSelectedDataTypes(prev => 
      prev.includes(dataTypeId)
        ? prev.filter(id => id !== dataTypeId)
        : [...prev, dataTypeId]
    );
  };

  const formatLastSync = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  const getDataTypesByCategory = () => {
    const categories = {};
    availableDataTypes.forEach(dataType => {
      if (!categories[dataType.category]) {
        categories[dataType.category] = [];
      }
      categories[dataType.category].push(dataType);
    });
    return categories;
  };

  return (
    <div className="google-fit-connect">
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
            src="/integration-icons/google-fit.png" 
            alt="Google Fit" 
            className="service-icon"
          />
          <div>
            <h2>Google Fit Integration</h2>
            <p>Sync your health and fitness data from Google Fit</p>
          </div>
        </div>
        
        <div className="connection-status">
          {googleFitConnection?.connected ? (
            <div className="status connected">
              <span className="status-indicator">🟢 Connected</span>
              <span className="last-sync">
                Last sync: {formatLastSync(googleFitConnection.lastSync)}
              </span>
            </div>
          ) : (
            <div className="status disconnected">
              <span className="status-indicator">⚪ Not Connected</span>
            </div>
          )}
        </div>
      </div>

      {!googleFitConnection?.connected ? (
        <div className="connection-setup">
          <div className="setup-info">
            <h3>Connect to Google Fit</h3>
            <p>
              By connecting to Google Fit, you can automatically sync your health data 
              from various apps and devices that work with Google Fit.
            </p>
          </div>

          <div className="data-selection">
            <h4>Select Data Types to Sync</h4>
            <p>Choose which types of data you want to sync from Google Fit:</p>
            
            {Object.entries(getDataTypesByCategory()).map(([category, dataTypes]) => (
              <div key={category} className="category-section">
                <h5>{category}</h5>
                <div className="data-types-grid">
                  {dataTypes.map(dataType => (
                    <div 
                      key={dataType.id}
                      className={`data-type-card ${
                        selectedDataTypes.includes(dataType.id) ? 'selected' : ''
                      }`}
                      onClick={() => handleDataTypeToggle(dataType.id)}
                    >
                      <div className="data-type-header">
                        <span className="data-type-icon">{dataType.icon}</span>
                        <h6>{dataType.name}</h6>
                      </div>
                      <p>{dataType.description}</p>
                      <div className="selection-indicator">
                        {selectedDataTypes.includes(dataType.id) && '✓'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="connection-actions">
            <button 
              className="connect-btn primary"
              onClick={handleConnect}
              disabled={loading || selectedDataTypes.length === 0}
            >
              {loading ? 'Connecting...' : 'Connect to Google Fit'}
            </button>
          </div>

          <div className="privacy-notice">
            <h4>🔒 Privacy & Permissions</h4>
            <ul>
              <li>We only access the data types you explicitly select</li>
              <li>Your data is encrypted and stored securely</li>
              <li>You can disconnect and revoke permissions at any time</li>
              <li>We never share your health data with third parties</li>
            </ul>
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

          <div className="permissions-overview">
            <h3>Active Data Permissions</h3>
            <div className="permissions-grid">
              {permissions.map(permission => {
                const dataType = availableDataTypes.find(dt => dt.id === permission.dataType);
                return (
                  <div key={permission.dataType} className="permission-card">
                    <div className="permission-header">
                      <span className="permission-icon">{dataType?.icon || '📊'}</span>
                      <h4>{dataType?.name || permission.dataType}</h4>
                    </div>
                    <div className="permission-details">
                      <span className={`permission-status ${permission.granted ? 'granted' : 'denied'}`}>
                        {permission.granted ? '✅ Granted' : '❌ Denied'}
                      </span>
                      <span className="last-access">
                        Last access: {formatLastSync(permission.lastAccess)}
                      </span>
                    </div>
                    {permission.recordCount && (
                      <div className="record-count">
                        {permission.recordCount} records synced
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sync-settings">
            <h3>Sync Settings</h3>
            <div className="settings-row">
              <label>
                <input type="checkbox" defaultChecked />
                Auto-sync every hour
              </label>
            </div>
            <div className="settings-row">
              <label>
                <input type="checkbox" defaultChecked />
                Sync historical data (last 30 days)
              </label>
            </div>
            <div className="settings-row">
              <label>
                <input type="checkbox" />
                Notify on sync completion
              </label>
            </div>
          </div>

          <div className="connection-info">
            <h3>Connection Details</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Connected Account:</label>
                <span>{googleFitConnection.email}</span>
              </div>
              <div className="info-item">
                <label>Connection Date:</label>
                <span>{new Date(googleFitConnection.connectedAt).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <label>Data Types:</label>
                <span>{permissions.length} types</span>
              </div>
              <div className="info-item">
                <label>Last Sync:</label>
                <span>{formatLastSync(googleFitConnection.lastSync)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="help-section">
        <h3>Need Help?</h3>
        <div className="help-cards">
          <div className="help-card">
            <h4>📱 Supported Apps</h4>
            <p>Google Fit works with fitness apps, health apps, and wearable devices</p>
          </div>
          <div className="help-card">
            <h4>🔄 Sync Frequency</h4>
            <p>Data syncs automatically every hour when connected</p>
          </div>
          <div className="help-card">
            <h4>⚠️ Troubleshooting</h4>
            <p>If sync fails, try disconnecting and reconnecting your account</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleFitConnect;