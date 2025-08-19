// src/services/api.js - Updated with Firebase Authentication integration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken');
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config = {
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Generic HTTP methods
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Sync Firebase user with backend
  async syncUserWithBackend(userData, idToken) {
    try {
      const response = await this.post('/auth/firebase-sync', {
        user: userData,
        token: idToken
      });
      
      return response;
    } catch (error) {
      console.warn('Failed to sync user with backend:', error);
      // Don't throw error here - app can still work with Firebase auth only
      return null;
    }
  }

  // Legacy authentication methods (for email/password fallback)
  async login(credentials) {
    try {
      const response = await this.post('/auth/login', credentials);
      
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  async register(userData) {
    try {
      const response = await this.post('/auth/register', userData);
      
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  async logout() {
    try {
      // Optional: notify server about logout
      await this.post('/auth/logout');
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  async refreshToken() {
    try {
      const response = await this.post('/auth/refresh');
      
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      // If refresh fails, clear tokens
      localStorage.removeItem('authToken');
      localStorage.removeUser('user');
      throw error;
    }
  }

  async getCurrentUser() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    try {
      return await this.get('/auth/me');
    } catch (error) {
      // Token might be invalid, clear it
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return null;
    }
  }

  // Health data methods
  async getHealthData(userId, dateRange = {}) {
    const params = new URLSearchParams();
    if (dateRange.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange.endDate) params.append('endDate', dateRange.endDate);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.get(`/health-data/${userId}${query}`);
  }

  async saveHealthData(userId, healthData) {
    return this.post(`/health-data/${userId}`, healthData);
  }

  async getPredictions(userId) {
    return this.get(`/predictions/${userId}`);
  }

  async getCorrelations(userId) {
    return this.get(`/correlations/${userId}`);
  }

  async getInsights(userId) {
    return this.get(`/insights/${userId}`);
  }

  async updateUserProfile(userId, profileData) {
    return this.put(`/users/${userId}/profile`, profileData);
  }

  async getUserGoals(userId) {
    return this.get(`/users/${userId}/goals`);
  }

  async updateUserGoals(userId, goals) {
    return this.put(`/users/${userId}/goals`, goals);
  }

  async connectDevice(userId, deviceData) {
    return this.post(`/integrations/${userId}/devices`, deviceData);
  }

  async getConnectedDevices(userId) {
    return this.get(`/integrations/${userId}/devices`);
  }

  async disconnectDevice(userId, deviceId) {
    return this.delete(`/integrations/${userId}/devices/${deviceId}`);
  }

  // Google Fit integration
  async connectGoogleFit(userId, authCode) {
    return this.post(`/integrations/${userId}/google-fit/connect`, { authCode });
  }

  async syncGoogleFitData(userId) {
    return this.post(`/integrations/${userId}/google-fit/sync`);
  }

  // Fitbit integration
  async connectFitbit(userId, authCode) {
    return this.post(`/integrations/${userId}/fitbit/connect`, { authCode });
  }

  async syncFitbitData(userId) {
    return this.post(`/integrations/${userId}/fitbit/sync`);
  }

  // Notifications
  async getNotifications(userId) {
    return this.get(`/notifications/${userId}`);
  }

  async markNotificationRead(userId, notificationId) {
    return this.put(`/notifications/${userId}/${notificationId}/read`);
  }

  async updateNotificationSettings(userId, settings) {
    return this.put(`/notifications/${userId}/settings`, settings);
  }

  // Mock data methods for development
  async getMockHealthData() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const now = new Date();
    const mockData = {
      sleep: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        duration: 6 + Math.random() * 3,
        quality: Math.floor(Math.random() * 100)
      })),
      activity: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        steps: Math.floor(5000 + Math.random() * 10000),
        calories: Math.floor(1800 + Math.random() * 800)
      })),
      nutrition: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        calories: Math.floor(1800 + Math.random() * 800),
        protein: Math.floor(80 + Math.random() * 60),
        carbs: Math.floor(200 + Math.random() * 100),
        fat: Math.floor(60 + Math.random() * 40)
      }))
    };
    
    return mockData;
  }

  async getMockInsights() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      correlations: [
        {
          type: 'sleep_activity',
          strength: 0.85,
          description: 'Better sleep quality correlates with increased daily activity',
          recommendation: 'Maintain consistent sleep schedule for better activity levels'
        },
        {
          type: 'nutrition_energy',
          strength: 0.72,
          description: 'Protein intake correlates with sustained energy levels',
          recommendation: 'Increase protein intake to 1.2g per kg body weight'
        }
      ],
      predictions: [
        {
          type: 'sleep_trend',
          prediction: 'Your sleep quality may improve by 15% next week based on current patterns',
          confidence: 0.78
        },
        {
          type: 'activity_goal',
          prediction: 'You\'re likely to reach your 10,000 steps goal 5 out of 7 days next week',
          confidence: 0.82
        }
      ]
    };
  }
}

// Create and export instance
export const api = new ApiService();
export default api;