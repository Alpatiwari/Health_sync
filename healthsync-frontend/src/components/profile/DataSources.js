import React, { useState, useEffect, useCallback } from 'react';
import { useHealthData } from '../../hooks/useHealthData';
import { useDeviceIntegration } from '../../hooks/useDeviceIntegration';
import LoadingSpinner from '../common/LoadingSpinner';
import NotificationBanner from '../common/NotificationBanner';

const DataSources = () => {
  const { dataSources, updateDataSourcePriority, getDataSourceStats } = useHealthData();
  const { connectedDevices, integrations } = useDeviceIntegration();
  
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sourceStats, setSourceStats] = useState({});

  const dataCategories = [
    { id: 'all', name: 'All Sources', icon: '📊' },
    { id: 'activity', name: 'Activity', icon: '🏃‍♂️' },
    { id: 'sleep', name: 'Sleep', icon: '😴' },
    { id: 'heart', name: 'Heart Rate', icon: '❤️' },
    { id: 'weight', name: 'Weight', icon: '⚖️' },
    { id: 'nutrition', name: 'Nutrition', icon: '🍎' },
    { id: 'vitals', name: 'Vitals', icon: '🩺' }
  ];

  const loadSourceStats = useCallback(async () => {
    if (!dataSources) return;
    
    try {
      const stats = {};
      for (const source of dataSources) {
        stats[source.id] = await getDataSourceStats(source.id);
      }
      setSourceStats(stats);
    } catch (error) {
      console.error('Error loading source stats:', error);
    }
  }, [dataSources, getDataSourceStats]);

  useEffect(() => {
    loadSourceStats();
  }, [loadSourceStats]);

  const handlePriorityChange = async (sourceId, newPriority) => {
    setLoading(true);
    try {
      await updateDataSourcePriority(sourceId, newPriority);
      setNotification({
        type: 'success',
        message: 'Data source priority updated successfully!'
      });
    } catch (error) {
      setNotification({
        type: 'error',
        message: `Failed to update priority: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (sourceType, sourceName) => {
    const iconMap = {
      'fitbit': '🟢',
      'apple_health': '🍎',
      'google_fit': '🔵',
      'manual': '✍️',
      'device': '📱',
      'scale': '⚖️',
      'watch': '⌚',
      'phone': '📱'
    };
    
    return iconMap[sourceType] || iconMap[sourceName?.toLowerCase()] || '📊';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'low': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'inactive': return '#6B7280';
      case 'error': return '#EF4444';
      case 'syncing': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const formatLastUpdate = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    if (diffMinutes < 10080) return `${Math.floor(diffMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredSources = selectedCategory === 'all' 
    ? dataSources || []
    : (dataSources || []).filter(source => 
        source.categories?.includes(selectedCategory) || source.category === selectedCategory
      );

  const getConflictingSources = (category) => {
    return filteredSources.filter(source => 
      source.categories?.includes(category) && source.status === 'active'
    ).length;
  };

  if (!dataSources && dataSources !== null) {
    return <LoadingSpinner />;
  }

  return (
    <div className="data-sources">
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="sources-header">
        <div>
          <h2>🔗 Data Sources</h2>
          <p>Manage your health data sources and their priority when conflicts occur</p>
        </div>
      </div>

      <div className="category-filters">
        {dataCategories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-text">{category.name}</span>
            {category.id !== 'all' && getConflictingSources(category.id) > 0 && (
              <span className="conflict-count">
                {getConflictingSources(category.id)}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="sources-overview">
        <div className="overview-stats">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h4>Total Sources</h4>
              <div className="stat-value">{dataSources?.length || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h4>Active Sources</h4>
              <div className="stat-value">
                {dataSources?.filter(s => s.status === 'active').length || 0}
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📱</div>
            <div className="stat-content">
              <h4>Connected Devices</h4>
              <div className="stat-value">{connectedDevices?.length || 0}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔄</div>
            <div className="stat-content">
              <h4>Integrations</h4>
              <div className="stat-value">
                {Object.values(integrations || {}).filter(i => i.connected).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sources-list">
        {filteredSources.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔗</div>
            <h3>No data sources found</h3>
            <p>Connect devices or integrations to start tracking your health data</p>
            <button className="empty-action-btn">
              ➕ Connect Data Source
            </button>
          </div>
        ) : (
          <div className="sources-grid">
            {filteredSources.map(source => {
              const stats = sourceStats[source.id] || {};
              
              return (
                <div key={source.id} className="source-card">
                  <div className="source-header">
                    <div className="source-info">
                      <div className="source-icon">
                        {getSourceIcon(source.type, source.name)}
                      </div>
                      <div className="source-details">
                        <h3>{source.name}</h3>
                        <p className="source-type">{source.type} • {source.description}</p>
                      </div>
                    </div>
                    
                    <div className="source-status">
                      <span 
                        className="status-indicator"
                        style={{ color: getStatusColor(source.status) }}
                      >
                        ● {source.status}
                      </span>
                    </div>
                  </div>

                  <div className="source-metrics">
                    <div className="metric">
                      <div className="metric-icon">⏰</div>
                      <div className="metric-content">
                        <label>Last Update</label>
                        <span>{formatLastUpdate(source.lastUpdate)}</span>
                      </div>
                    </div>
                    <div className="metric">
                      <div className="metric-icon">📋</div>
                      <div className="metric-content">
                        <label>Records</label>
                        <span>{stats.totalRecords || 0}</span>
                      </div>
                    </div>
                    <div className="metric">
                      <div className="metric-icon">📊</div>
                      <div className="metric-content">
                        <label>Data Types</label>
                        <span>{source.dataTypes?.length || 0}</span>
                      </div>
                    </div>
                    <div className="metric">
                      <div className="metric-icon">🎯</div>
                      <div className="metric-content">
                        <label>Accuracy</label>
                        <span>{stats.accuracy || 0}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="source-categories">
                    <label>📂 Categories:</label>
                    <div className="category-tags">
                      {(source.categories || []).map(category => (
                        <span key={category} className="category-tag">
                          {dataCategories.find(c => c.id === category)?.name || category}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="source-priority">
                    <label>⚖️ Priority Level:</label>
                    <div className="priority-control">
                      <select 
                        value={source.priority}
                        onChange={(e) => handlePriorityChange(source.id, e.target.value)}
                        disabled={loading}
                        style={{ color: getPriorityColor(source.priority) }}
                      >
                        <option value="high">🔴 High Priority</option>
                        <option value="medium">🟡 Medium Priority</option>
                        <option value="low">⚫ Low Priority</option>
                      </select>
                    </div>
                    <p className="priority-description">
                      {source.priority === 'high' && '🔴 This source takes precedence in data conflicts'}
                      {source.priority === 'medium' && '🟡 This source is used when high-priority sources are unavailable'}
                      {source.priority === 'low' && '⚫ This source is used as a backup when others are unavailable'}
                    </p>
                  </div>

                  {stats.recentActivity && (
                    <div className="source-activity">
                      <h4>📈 Recent Activity (Last 7 Days)</h4>
                      <div className="activity-chart">
                        {stats.recentActivity.map((day, index) => (
                          <div 
                            key={index}
                            className="activity-bar"
                            style={{ 
                              height: `${(day.records / Math.max(...stats.recentActivity.map(d => d.records))) * 100}%`,
                              backgroundColor: day.records > 0 ? '#10B981' : '#E5E7EB'
                            }}
                            title={`${day.date}: ${day.records} records`}
                          />
                        ))}
                      </div>
                      <div className="activity-labels">
                        <span>7 days ago</span>
                        <span>Today</span>
                      </div>
                    </div>
                  )}

                  <div className="source-actions">
                    <button className="action-btn secondary" title="Configure source settings">
                      ⚙️ Configure
                    </button>
                    <button className="action-btn secondary" title="View detailed data">
                      📊 View Data
                    </button>
                    {source.status === 'error' && (
                      <button className="action-btn warning" title="Retry connection">
                        🔄 Retry
                      </button>
                    )}
                    {source.canDisable && (
                      <button className="action-btn danger" title="Disable this source">
                        ⏸️ Disable
                      </button>
                    )}
                  </div>

                  {source.conflicts && source.conflicts.length > 0 && (
                    <div className="source-conflicts">
                      <h4>⚠️ Data Conflicts Detected</h4>
                      <div className="conflicts-list">
                        {source.conflicts.map((conflict, index) => (
                          <div key={index} className="conflict-item">
                            <div className="conflict-type">
                              <strong>{conflict.dataType}</strong>
                            </div>
                            <div className="conflict-description">
                              Conflicts with <strong>{conflict.conflictingSource}</strong> 
                              <span className="conflict-count">({conflict.occurrences} times this week)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="priority-guide">
        <h3>📚 Priority System Guide</h3>
        <div className="guide-content">
          <div className="guide-section high">
            <div className="guide-header">
              <span className="guide-icon">🔴</span>
              <h4>High Priority</h4>
            </div>
            <p>
              Sources with high priority are used first when multiple sources provide 
              the same type of data. Use this for your most accurate or preferred devices.
            </p>
            <div className="examples">
              <strong>Best for:</strong> Medical devices, primary fitness tracker, manual entries
            </div>
          </div>
          
          <div className="guide-section medium">
            <div className="guide-header">
              <span className="guide-icon">🟡</span>
              <h4>Medium Priority</h4>
            </div>
            <p>
              Medium priority sources are used when high-priority sources don't have 
              recent data available. Good for secondary devices or app integrations.
            </p>
            <div className="examples">
              <strong>Best for:</strong> Phone sensors, secondary trackers, health apps
            </div>
          </div>
          
          <div className="guide-section low">
            <div className="guide-header">
              <span className="guide-icon">⚫</span>
              <h4>Low Priority</h4>
            </div>
            <p>
              Low priority sources serve as backups and are only used when no other 
              sources are available. Useful for estimated or less accurate data.
            </p>
            <div className="examples">
              <strong>Best for:</strong> Estimated data, older devices, third-party apps
            </div>
          </div>
        </div>
      </div>

      <div className="data-management">
        <h3>🛠️ Data Management</h3>
        <p>Keep your data sources organized and optimized</p>
        <div className="management-actions">
          <button className="management-btn primary">
            🔄 Refresh All Sources
          </button>
          <button className="management-btn secondary">
            🧹 Clean Duplicate Data
          </button>
          <button className="management-btn secondary">
            📤 Export Source Data
          </button>
          <button className="management-btn secondary">
            ⚙️ Advanced Settings
          </button>
        </div>
      </div>

      <div className="troubleshooting">
        <h3>🔧 Troubleshooting</h3>
        <div className="troubleshooting-sections">
          <details className="troubleshooting-section">
            <summary>⚠️ Data conflicts between sources</summary>
            <div className="troubleshooting-content">
              <p>When multiple sources provide conflicting data:</p>
              <ul>
                <li>The highest priority active source is used</li>
                <li>You can manually resolve conflicts in the data review section</li>
                <li>Set device-specific priorities for different data types</li>
              </ul>
            </div>
          </details>
          
          <details className="troubleshooting-section">
            <summary>📴 Source showing as inactive</summary>
            <div className="troubleshooting-content">
              <p>If a source appears inactive:</p>
              <ul>
                <li>Check device connectivity and battery level</li>
                <li>Verify permissions in the integration settings</li>
                <li>Try disconnecting and reconnecting the source</li>
              </ul>
            </div>
          </details>
          
          <details className="troubleshooting-section">
            <summary>📊 Missing recent data</summary>
            <div className="troubleshooting-content">
              <p>If recent data is missing:</p>
              <ul>
                <li>Force a manual sync from the device/integration</li>
                <li>Check if the source device has recent activity</li>
                <li>Ensure your device is within range and connected</li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default DataSources;