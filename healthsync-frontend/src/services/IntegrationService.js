// IntegrationsService.js
class IntegrationsService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  }

  // Get available integrations
  async getAvailableIntegrations() {
    try {
      const response = await fetch(`${this.baseURL}/integrations/available`);
      if (!response.ok) throw new Error('Failed to fetch available integrations');
      return await response.json();
    } catch (error) {
      console.error('Error fetching available integrations:', error);
      throw error;
    }
  }

  // Alias for compatibility with useDeviceIntegration hook
  async getAvailableDevices() {
    return this.getAvailableIntegrations();
  }

  // Get connected integrations for user
  async getConnectedIntegrations(userId) {
    try {
      const response = await fetch(`${this.baseURL}/integrations/connected/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch connected integrations');
      return await response.json();
    } catch (error) {
      console.error('Error fetching connected integrations:', error);
      throw error;
    }
  }

  // Get connected devices - alias for compatibility
  async getConnectedDevices() {
    try {
      const response = await fetch(`${this.baseURL}/integrations/connected`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch connected devices');
      return await response.json();
    } catch (error) {
      console.error('Error fetching connected devices:', error);
      throw error;
    }
  }

  // Connect to a device/service
  async connectDevice(deviceType, credentials) {
    try {
      const response = await fetch(`${this.baseURL}/integrations/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ deviceType, credentials })
      });
      if (!response.ok) throw new Error('Failed to connect device');
      return await response.json();
    } catch (error) {
      console.error('Error connecting device:', error);
      throw error;
    }
  }

  // Disconnect a device/service
  async disconnectDevice(integrationId) {
    try {
      const response = await fetch(`${this.baseURL}/integrations/disconnect/${integrationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to disconnect device');
      return await response.json();
    } catch (error) {
      console.error('Error disconnecting device:', error);
      throw error;
    }
  }

  // Sync data from connected devices
  async syncData(integrationId) {
    try {
      const response = await fetch(`${this.baseURL}/integrations/sync/${integrationId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to sync data');
      return await response.json();
    } catch (error) {
      console.error('Error syncing data:', error);
      throw error;
    }
  }

  // Alias for syncData - compatibility with useDeviceIntegration hook
  async syncDevice(deviceId) {
    return this.syncData(deviceId);
  }

  // Get device data with filters
  async getDeviceData(deviceId, dataType, dateRange = 7) {
    try {
      const response = await fetch(
        `${this.baseURL}/integrations/data/${deviceId}?dataType=${dataType}&dateRange=${dateRange}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (!response.ok) throw new Error('Failed to get device data');
      return await response.json();
    } catch (error) {
      console.error('Error getting device data:', error);
      throw error;
    }
  }

  // Get sync status for all devices
  async getSyncStatus() {
    try {
      const response = await fetch(`${this.baseURL}/integrations/sync-status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching sync status:', error);
      throw error;
    }
  }

  // Update device settings
  async updateDeviceSettings(deviceId, settings) {
    try {
      const response = await fetch(`${this.baseURL}/integrations/settings/${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating device settings:', error);
      throw error;
    }
  }

  // Get device data history
  async getDeviceDataHistory(deviceId, dateRange = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (dateRange.startDate) queryParams.append('startDate', dateRange.startDate);
      if (dateRange.endDate) queryParams.append('endDate', dateRange.endDate);
      
      const response = await fetch(
        `${this.baseURL}/integrations/data/${deviceId}?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching device data history:', error);
      throw error;
    }
  }

  // OAuth flow for devices that require it
  async initiateOAuth(deviceType) {
    try {
      const response = await fetch(`${this.baseURL}/integrations/oauth/initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceType }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error initiating OAuth:', error);
      throw error;
    }
  }

  // Complete OAuth flow
  async completeOAuth(deviceType, code, state) {
    try {
      const response = await fetch(`${this.baseURL}/integrations/oauth/callback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceType, code, state }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error completing OAuth:', error);
      throw error;
    }
  }
}

// Create and export a single instance
const integrationsService = new IntegrationsService();
export default integrationsService;