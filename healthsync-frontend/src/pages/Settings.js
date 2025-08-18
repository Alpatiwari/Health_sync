import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { api } from '../services/api';
import '../styles/components.css';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [activeSection, setActiveSection] = useState('general');

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    units: 'imperial'
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    dataSharing: false,
    anonymousAnalytics: true,
    personalizedAds: false,
    researchParticipation: false,
    locationTracking: true,
    activitySharing: false
  });

  // Data Settings
  const [dataSettings, setDataSettings] = useState({
    syncFrequency: 'realtime',
    dataRetention: '2years',
    autoBackup: true,
    compressionEnabled: true,
    offlineMode: false
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    biometricLogin: false,
    sessionTimeout: '30min',
    loginNotifications: true,
    deviceManagement: true
  });

  // Notification Settings (App-level)
  const [appNotifications, setAppNotifications] = useState({
    systemNotifications: true,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  const sections = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'data', label: 'Data & Sync', icon: '☁️' },
    { id: 'security', label: 'Security', icon: '🛡️' },
    { id: 'notifications', label: 'App Notifications', icon: '🔔' },
    { id: 'about', label: 'About', icon: 'ℹ️' }
  ];

  const loadDefaultSettings = useCallback(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setGeneralSettings(settings.general || generalSettings);
      setPrivacySettings(settings.privacy || privacySettings);
      setDataSettings(settings.data || dataSettings);
      setSecuritySettings(settings.security || securitySettings);
      setAppNotifications(settings.notifications || appNotifications);
    }
  }, [generalSettings, privacySettings, dataSettings, securitySettings, appNotifications]);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/settings');
      const settings = response.data;
      
      setGeneralSettings(settings.general || generalSettings);
      setPrivacySettings(settings.privacy || privacySettings);
      setDataSettings(settings.data || dataSettings);
      setSecuritySettings(settings.security || securitySettings);
      setAppNotifications(settings.notifications || appNotifications);
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Use default settings or load from localStorage
      loadDefaultSettings();
    } finally {
      setLoading(false);
    }
  }, [generalSettings, privacySettings, dataSettings, securitySettings, appNotifications, loadDefaultSettings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async (section, settings) => {
    try {
      setSaveStatus('saving');
      await api.put(`/user/settings/${section}`, settings);
      
      // Also save to localStorage as backup
      const allSettings = {
        general: generalSettings,
        privacy: privacySettings,
        data: dataSettings,
        security: securitySettings,
        notifications: appNotifications
      };
      allSettings[section] = settings;
      localStorage.setItem('appSettings', JSON.stringify(allSettings));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleGeneralChange = (key, value) => {
    const updated = { ...generalSettings, [key]: value };
    setGeneralSettings(updated);
    saveSettings('general', updated);
  };

  const handlePrivacyChange = (key, value) => {
    const updated = { ...privacySettings, [key]: value };
    setPrivacySettings(updated);
    saveSettings('privacy', updated);
  };

  const handleDataChange = (key, value) => {
    const updated = { ...dataSettings, [key]: value };
    setDataSettings(updated);
    saveSettings('data', updated);
  };

  const handleSecurityChange = (key, value) => {
    const updated = { ...securitySettings, [key]: value };
    setSecuritySettings(updated);
    saveSettings('security', updated);
  };

  const handleNotificationChange = (key, value) => {
    const updated = { ...appNotifications, [key]: value };
    setAppNotifications(updated);
    saveSettings('notifications', updated);
  };

  const resetSettings = async () => {
    const confirmation = window.confirm(
      'Are you sure you want to reset all settings to defaults? This cannot be undone.'
    );
    
    if (confirmation) {
      try {
        await api.post('/user/settings/reset');
        await loadSettings();
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
      } catch (error) {
        console.error('Failed to reset settings:', error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    }
  };

  const clearCache = async () => {
    try {
      await api.post('/user/cache/clear');
      localStorage.removeItem('healthData');
      sessionStorage.clear();
      alert('Cache cleared successfully. The app will reload.');
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('Failed to clear cache. Please try again.');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Settings</h1>
          <p>Customize your HealthSync experience</p>
        </div>
        
        {saveStatus && (
          <div className={`save-status ${saveStatus}`}>
            {saveStatus === 'saving' && '💾 Saving...'}
            {saveStatus === 'success' && '✅ Settings saved!'}
            {saveStatus === 'error' && '❌ Save failed. Please try again.'}
          </div>
        )}
      </div>

      <div className="settings-layout">
        {/* Settings Navigation */}
        <div className="settings-nav">
          {sections.map(section => (
            <button
              key={section.id}
              className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="nav-icon">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {/* General Settings */}
          {activeSection === 'general' && (
            <div className="settings-section">
              <h2>General Settings</h2>
              
              <div className="setting-group">
                <h3>Appearance</h3>
                <div className="setting-item">
                  <label>Theme</label>
                  <select
                    value={generalSettings.theme}
                    onChange={(e) => handleGeneralChange('theme', e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">System Default</option>
                  </select>
                </div>
              </div>

              <div className="setting-group">
                <h3>Localization</h3>
                <div className="setting-item">
                  <label>Language</label>
                  <select
                    value={generalSettings.language}
                    onChange={(e) => handleGeneralChange('language', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label>Timezone</label>
                  <select
                    value={generalSettings.timezone}
                    onChange={(e) => handleGeneralChange('timezone', e.target.value)}
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label>Date Format</label>
                  <select
                    value={generalSettings.dateFormat}
                    onChange={(e) => handleGeneralChange('dateFormat', e.target.value)}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label>Time Format</label>
                  <select
                    value={generalSettings.timeFormat}
                    onChange={(e) => handleGeneralChange('timeFormat', e.target.value)}
                  >
                    <option value="12h">12 Hour</option>
                    <option value="24h">24 Hour</option>
                  </select>
                </div>
              </div>

              <div className="setting-group">
                <h3>Units</h3>
                <div className="setting-item">
                  <label>Measurement System</label>
                  <select
                    value={generalSettings.units}
                    onChange={(e) => handleGeneralChange('units', e.target.value)}
                  >
                    <option value="imperial">Imperial (lbs, ft, °F)</option>
                    <option value="metric">Metric (kg, cm, °C)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeSection === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy Settings</h2>
              
              <div className="setting-group">
                <h3>Data Usage</h3>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={privacySettings.dataSharing}
                      onChange={(e) => handlePrivacyChange('dataSharing', e.target.checked)}
                    />
                    Share anonymized data for research
                  </label>
                  <p className="setting-description">
                    Help improve health insights by sharing anonymized health patterns
                  </p>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={privacySettings.anonymousAnalytics}
                      onChange={(e) => handlePrivacyChange('anonymousAnalytics', e.target.checked)}
                    />
                    Anonymous analytics
                  </label>
                  <p className="setting-description">
                    Help us improve the app by sharing usage statistics
                  </p>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={privacySettings.personalizedAds}
                      onChange={(e) => handlePrivacyChange('personalizedAds', e.target.checked)}
                    />
                    Personalized advertisements
                  </label>
                  <p className="setting-description">
                    Show relevant health-related content based on your interests
                  </p>
                </div>
              </div>

              <div className="setting-group">
                <h3>Location & Activity</h3>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={privacySettings.locationTracking}
                      onChange={(e) => handlePrivacyChange('locationTracking', e.target.checked)}
                    />
                    Location tracking
                  </label>
                  <p className="setting-description">
                    Enable location-based insights and activity detection
                  </p>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={privacySettings.activitySharing}
                      onChange={(e) => handlePrivacyChange('activitySharing', e.target.checked)}
                    />
                    Share activity summaries
                  </label>
                  <p className="setting-description">
                    Allow sharing of activity achievements with connected friends
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Data & Sync Settings */}
          {activeSection === 'data' && (
            <div className="settings-section">
              <h2>Data & Sync Settings</h2>
              
              <div className="setting-group">
                <h3>Synchronization</h3>
                <div className="setting-item">
                  <label>Sync Frequency</label>
                  <select
                    value={dataSettings.syncFrequency}
                    onChange={(e) => handleDataChange('syncFrequency', e.target.value)}
                  >
                    <option value="realtime">Real-time</option>
                    <option value="15min">Every 15 minutes</option>
                    <option value="1hour">Every hour</option>
                    <option value="manual">Manual only</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={dataSettings.autoBackup}
                      onChange={(e) => handleDataChange('autoBackup', e.target.checked)}
                    />
                    Automatic cloud backup
                  </label>
                  <p className="setting-description">
                    Automatically backup your health data to the cloud
                  </p>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={dataSettings.offlineMode}
                      onChange={(e) => handleDataChange('offlineMode', e.target.checked)}
                    />
                    Offline mode
                  </label>
                  <p className="setting-description">
                    Continue tracking health data when internet is unavailable
                  </p>
                </div>
              </div>

              <div className="setting-group">
                <h3>Data Retention</h3>
                <div className="setting-item">
                  <label>Keep data for</label>
                  <select
                    value={dataSettings.dataRetention}
                    onChange={(e) => handleDataChange('dataRetention', e.target.value)}
                  >
                    <option value="1year">1 Year</option>
                    <option value="2years">2 Years</option>
                    <option value="5years">5 Years</option>
                    <option value="forever">Forever</option>
                  </select>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={dataSettings.compressionEnabled}
                      onChange={(e) => handleDataChange('compressionEnabled', e.target.checked)}
                    />
                    Data compression
                  </label>
                  <p className="setting-description">
                    Compress stored data to save storage space
                  </p>
                </div>
              </div>

              <div className="setting-actions">
                <button onClick={clearCache} className="btn btn-outline">
                  Clear Cache
                </button>
                <button className="btn btn-outline">
                  Export All Data
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeSection === 'security' && (
            <div className="settings-section">
              <h2>Security Settings</h2>
              
              <div className="setting-group">
                <h3>Authentication</h3>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorAuth}
                      onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
                    />
                    Two-factor authentication
                  </label>
                  <p className="setting-description">
                    Add an extra layer of security to your account
                  </p>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={securitySettings.biometricLogin}
                      onChange={(e) => handleSecurityChange('biometricLogin', e.target.checked)}
                    />
                    Biometric login
                  </label>
                  <p className="setting-description">
                    Use fingerprint or face recognition to log in
                  </p>
                </div>

                <div className="setting-item">
                  <label>Session timeout</label>
                  <select
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                  >
                    <option value="15min">15 minutes</option>
                    <option value="30min">30 minutes</option>
                    <option value="1hour">1 hour</option>
                    <option value="4hours">4 hours</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>

              <div className="setting-group">
                <h3>Monitoring</h3>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={securitySettings.loginNotifications}
                      onChange={(e) => handleSecurityChange('loginNotifications', e.target.checked)}
                    />
                    Login notifications
                  </label>
                  <p className="setting-description">
                    Get notified when your account is accessed
                  </p>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={securitySettings.deviceManagement}
                      onChange={(e) => handleSecurityChange('deviceManagement', e.target.checked)}
                    />
                    Device management
                  </label>
                  <p className="setting-description">
                    Track and manage devices that access your account
                  </p>
                </div>
              </div>

              <div className="setting-actions">
                <button className="btn btn-outline">
                  Change Password
                </button>
                <button className="btn btn-outline">
                  View Login History
                </button>
                <button className="btn btn-outline">
                  Manage Devices
                </button>
              </div>
            </div>
          )}

          {/* App Notifications */}
          {activeSection === 'notifications' && (
            <div className="settings-section">
              <h2>App Notifications</h2>
              
              <div className="setting-group">
                <h3>System Notifications</h3>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={appNotifications.systemNotifications}
                      onChange={(e) => handleNotificationChange('systemNotifications', e.target.checked)}
                    />
                    Enable system notifications
                  </label>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={appNotifications.soundEnabled}
                      onChange={(e) => handleNotificationChange('soundEnabled', e.target.checked)}
                    />
                    Sound notifications
                  </label>
                </div>

                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={appNotifications.vibrationEnabled}
                      onChange={(e) => handleNotificationChange('vibrationEnabled', e.target.checked)}
                    />
                    Vibration
                  </label>
                </div>
              </div>

              <div className="setting-group">
                <h3>Quiet Hours</h3>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={appNotifications.quietHours.enabled}
                      onChange={(e) => handleNotificationChange('quietHours', {
                        ...appNotifications.quietHours,
                        enabled: e.target.checked
                      })}
                    />
                    Enable quiet hours
                  </label>
                </div>

                {appNotifications.quietHours.enabled && (
                  <>
                    <div className="setting-item">
                      <label>Start time</label>
                      <input
                        type="time"
                        value={appNotifications.quietHours.start}
                        onChange={(e) => handleNotificationChange('quietHours', {
                          ...appNotifications.quietHours,
                          start: e.target.value
                        })}
                      />
                    </div>

                    <div className="setting-item">
                      <label>End time</label>
                      <input
                        type="time"
                        value={appNotifications.quietHours.end}
                        onChange={(e) => handleNotificationChange('quietHours', {
                          ...appNotifications.quietHours,
                          end: e.target.value
                        })}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* About Section */}
          {activeSection === 'about' && (
            <div className="settings-section">
              <h2>About HealthSync</h2>
              
              <div className="about-info">
                <div className="app-logo">
                  <div className="logo-placeholder">🏥</div>
                  <h3>HealthSync</h3>
                  <p>Version 2.1.0</p>
                </div>

                <div className="app-details">
                  <div className="detail-item">
                    <h4>Build</h4>
                    <p>Build 2024.08.17</p>
                  </div>
                  <div className="detail-item">
                    <h4>Platform</h4>
                    <p>Web Application</p>
                  </div>
                  <div className="detail-item">
                    <h4>Last Updated</h4>
                    <p>August 17, 2025</p>
                  </div>
                </div>

                <div className="app-description">
                  <p>
                    HealthSync is your comprehensive health tracking companion, 
                    providing AI-powered insights to help you understand and improve 
                    your wellness journey.
                  </p>
                </div>

                <div className="legal-links">
                  <a href="/privacy-policy" className="legal-link">Privacy Policy</a>
                  <a href="/terms-of-service" className="legal-link">Terms of Service</a>
                  <a href="/support" className="legal-link">Support</a>
                  <a href="/feedback" className="legal-link">Send Feedback</a>
                </div>

                <div className="system-info">
                  <h4>System Information</h4>
                  <div className="system-details">
                    <div className="system-item">
                      <label>Browser:</label>
                      <span>{navigator.userAgent.split(' ')[0] || 'Unknown'}</span>
                    </div>
                    <div className="system-item">
                      <label>Platform:</label>
                      <span>{navigator.platform || 'Unknown'}</span>
                    </div>
                    <div className="system-item">
                      <label>Language:</label>
                      <span>{navigator.language || 'Unknown'}</span>
                    </div>
                    <div className="system-item">
                      <label>Storage Used:</label>
                      <span>2.4 MB</span>
                    </div>
                  </div>
                </div>

                <div className="diagnostic-tools">
                  <h4>Diagnostic Tools</h4>
                  <div className="diagnostic-actions">
                    <button className="btn btn-outline btn-sm">
                      Run Connectivity Test
                    </button>
                    <button className="btn btn-outline btn-sm">
                      Check Device Sync
                    </button>
                    <button className="btn btn-outline btn-sm">
                      Generate System Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reset Settings Button */}
          <div className="settings-footer">
            <button onClick={resetSettings} className="btn btn-danger">
              Reset All Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;