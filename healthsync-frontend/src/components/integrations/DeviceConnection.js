import React, { useState, useEffect } from 'react';
import { useDeviceIntegration } from '../../hooks/useDeviceIntegration';
import LoadingSpinner from '../common/LoadingSpinner';
import NotificationBanner from '../common/NotificationBanner';


const DeviceConnection = () => {
  const { 
    connectedDevices, 
    availableDevices, 
    connectDevice, 
    disconnectDevice, 
    syncDevice, 
    getDeviceStatus 
  } = useDeviceIntegration();
  
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState({});
  const [notification, setNotification] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const deviceCategories = [
    { id: 'all', name: 'All Devices', icon: '📱' },
    { id: 'fitness', name: 'Fitness Trackers', icon: '⌚' },
    { id: 'scale', name: 'Smart Scales', icon: '⚖️' },
    { id: 'sleep', name: 'Sleep Trackers', icon: '😴' },
    { id: 'heart', name: 'Heart Rate Monitors', icon: '❤️' },
    { id: 'glucose', name: 'Glucose Monitors', icon: '🩸' },
    { id: 'bp', name: 'Blood Pressure', icon: '🩺' }
  ];

  useEffect(() => {
    // Auto-refresh device status every 30 seconds
    const interval = setInterval(() => {
      connectedDevices.forEach(device => {
        getDeviceStatus(device.id);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [connectedDevices, getDeviceStatus]);

  const handleConnectDevice = async (device) => {
    setLoading(true);
    try {
      await connectDevice(device.id, device.type);
      setNotification({
        type: 'success',
        message: `Successfully connected ${device.name}!`
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Failed to connect ${device.name}: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectDevice = async (deviceId) => {
    try {
      await disconnectDevice(deviceId);
      setNotification({
        type: 'info',
        message: 'Device disconnected successfully'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Failed to disconnect device: ${error.message}`
      });
    }
  };

  const handleSyncDevice = async (deviceId) => {
    setSyncing(prev => ({ ...prev, [deviceId]: true }));
    try {
      await syncDevice(deviceId);
      setNotification({
        type: 'success',
        message: 'Device synced successfully!'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Sync failed: ${error.message}`
      });
    } finally {
      setSyncing(prev => ({ ...prev, [deviceId]: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return '#10B981';
      case 'syncing': return '#3B82F6';
      case 'error': return '#EF4444';
      case 'disconnected': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return '🟢';
      case 'syncing': return '🔄';
      case 'error': return '🔴';
      case 'disconnected': return '⚪';
      default: return '⚪';
    }
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

  const filteredAvailableDevices = selectedCategory === 'all' 
    ? availableDevices 
    : availableDevices.filter(device => device.category === selectedCategory);

  const filteredConnectedDevices = selectedCategory === 'all' 
    ? connectedDevices 
    : connectedDevices.filter(device => device.category === selectedCategory);

  return (
    <div className="device-connection">
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="connection-header">
        <h2>Device Connections</h2>
        <p>Manage your health devices and data synchronization</p>
      </div>

      <div className="category-filters">
        {deviceCategories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>

      {/* Connected Devices Section */}
      <div className="devices-section">
        <h3>Connected Devices ({filteredConnectedDevices.length})</h3>
        
        {filteredConnectedDevices.length === 0 ? (
          <div className="empty-state">
            <p>No connected devices in this category</p>
          </div>
        ) : (
          <div className="devices-grid">
            {filteredConnectedDevices.map(device => (
              <div key={device.id} className="device-card connected">
                <div className="device-header">
                  <img 
                    src={device.icon || '/device-icons/default.png'} 
                    alt={device.name}
                    className="device-icon"
                  />
                  <div className="device-info">
                    <h4>{device.name}</h4>
                    <p className="device-model">{device.model}</p>
                  </div>
                  <div className="device-status">
                    <span 
                      className="status-indicator"
                      style={{ color: getStatusColor(device.status) }}
                    >
                      {getStatusIcon(device.status)} {device.status}
                    </span>
                  </div>
                </div>

                <div className="device-details">
                  <div className="detail-row">
                    <span>Battery:</span>
                    <span className={`battery-level ${device.batteryLevel < 20 ? 'low' : ''}`}>
                      🔋 {device.batteryLevel}%
                    </span>
                  </div>
                  <div className="detail-row">
                    <span>Last Sync:</span>
                    <span>{formatLastSync(device.lastSync)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Data Types:</span>
                    <div className="data-types">
                      {device.dataTypes.map(type => (
                        <span key={type} className="data-type-tag">{type}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="device-actions">
                  <button 
                    className="sync-btn"
                    onClick={() => handleSyncDevice(device.id)}
                    disabled={syncing[device.id] || device.status === 'syncing'}
                  >
                    {syncing[device.id] ? 'Syncing...' : '🔄 Sync Now'}
                  </button>
                  <button 
                    className="disconnect-btn"
                    onClick={() => handleDisconnectDevice(device.id)}
                  >
                    🔌 Disconnect
                  </button>
                  <button className="settings-btn">
                    ⚙️ Settings
                  </button>
                </div>

                {device.status === 'error' && (
                  <div className="error-message">
                    ⚠️ {device.errorMessage || 'Connection error - please check device'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Devices Section */}
      <div className="devices-section">
        <h3>Available Devices</h3>
        
        {loading && <LoadingSpinner />}
        
        {filteredAvailableDevices.length === 0 ? (
          <div className="empty-state">
            <p>No available devices found. Make sure your devices are in pairing mode.</p>
            <button className="scan-btn">
              🔍 Scan for Devices
            </button>
          </div>
        ) : (
          <div className="devices-grid">
            {filteredAvailableDevices.map(device => (
              <div key={device.id} className="device-card available">
                <div className="device-header">
                  <img 
                    src={device.icon || '/device-icons/default.png'} 
                    alt={device.name}
                    className="device-icon"
                  />
                  <div className="device-info">
                    <h4>{device.name}</h4>
                    <p className="device-model">{device.model}</p>
                    <p className="device-brand">{device.brand}</p>
                  </div>
                </div>

                <div className="device-features">
                  <h5>Features:</h5>
                  <div className="features-list">
                    {device.features.map(feature => (
                      <span key={feature} className="feature-tag">✓ {feature}</span>
                    ))}
                  </div>
                </div>

                <div className="device-compatibility">
                  <div className="compatibility-info">
                    <span className={`compatibility ${device.compatible ? 'compatible' : 'incompatible'}`}>
                      {device.compatible ? '✅ Compatible' : '❌ Not Compatible'}
                    </span>
                  </div>
                </div>

                <div className="device-actions">
                  <button 
                    className="connect-btn"
                    onClick={() => handleConnectDevice(device)}
                    disabled={!device.compatible || loading}
                  >
                    🔗 Connect
                  </button>
                  <button className="info-btn">
                    ℹ️ More Info
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connection Tips */}
      <div className="connection-tips">
        <h3>Connection Tips</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <h4>🔋 Battery Level</h4>
            <p>Ensure your device has sufficient battery (20%) before connecting</p>
          </div>
          <div className="tip-card">
            <h4>📍 Distance</h4>
            <p>Keep devices within 10 meters for optimal Bluetooth connection</p>
          </div>
          <div className="tip-card">
            <h4>📱 Pairing Mode</h4>
            <p>Put your device in pairing mode before attempting to connect</p>
          </div>
          <div className="tip-card">
            <h4>🔄 Auto Sync</h4>
            <p>Connected devices will automatically sync every 30 minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceConnection;