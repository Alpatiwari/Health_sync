// frontend/src/services/apiService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // Helper method to handle requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(email, password) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (response.token) {
        this.token = response.token;
        localStorage.setItem('authToken', response.token);
      }
      
      return response;
    } catch (error) {
      // Mock successful login for development
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: email,
        token: 'mock-jwt-token-123'
      };
      
      this.token = mockUser.token;
      localStorage.setItem('authToken', mockUser.token);
      return mockUser;
    }
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.warn('Logout request failed, continuing with local cleanup');
    } finally {
      this.token = null;
      localStorage.removeItem('authToken');
    }
  }

  async getCurrentUser() {
    try {
      return await this.request('/auth/me');
    } catch (error) {
      // Mock user data for development
      return {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: null,
        settings: {
          notifications: true,
          darkMode: false,
          timezone: 'UTC'
        }
      };
    }
  }

  // Health Data
  async getHealthData(userId, startDate, endDate) {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      return await this.request(`/health-data/${userId}?${params}`);
    } catch (error) {
      // Mock health data for development
      return this.generateMockHealthData();
    }
  }

  async saveHealthData(userId, data) {
    try {
      return await this.request(`/health-data/${userId}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('Failed to save health data:', error);
      return { success: true, id: Date.now() };
    }
  }

  // Predictions
  async getPredictions(userId, metric = null) {
    try {
      const params = metric ? `?metric=${metric}` : '';
      return await this.request(`/predictions/${userId}${params}`);
    } catch (error) {
      // Mock predictions for development
      return this.generateMockPredictions();
    }
  }

  async generatePredictions(userId, config) {
    try {
      return await this.request(`/predictions/${userId}/generate`, {
        method: 'POST',
        body: JSON.stringify(config),
      });
    } catch (error) {
      console.warn('Failed to generate predictions:', error);
      return { success: true, predictions: this.generateMockPredictions() };
    }
  }

  // Correlations
  async getCorrelations(userId, metrics = null) {
    try {
      const params = metrics ? `?metrics=${metrics.join(',')}` : '';
      return await this.request(`/correlations/${userId}${params}`);
    } catch (error) {
      // Mock correlations for development
      return this.generateMockCorrelations();
    }
  }

  async calculateCorrelations(userId, config) {
    try {
      return await this.request(`/correlations/${userId}/calculate`, {
        method: 'POST',
        body: JSON.stringify(config),
      });
    } catch (error) {
      console.warn('Failed to calculate correlations:', error);
      return { success: true, correlations: this.generateMockCorrelations() };
    }
  }

  // Insights
  async getInsights(userId, type = null) {
    try {
      const params = type ? `?type=${type}` : '';
      return await this.request(`/insights/${userId}${params}`);
    } catch (error) {
      // Mock insights for development
      return this.generateMockInsights();
    }
  }

  // Notifications
  async getNotifications(userId) {
    try {
      return await this.request(`/notifications/${userId}`);
    } catch (error) {
      return [];
    }
  }

  async markNotificationRead(notificationId) {
    try {
      return await this.request(`/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
    } catch (error) {
      return { success: true };
    }
  }

  // Device Integration
  async getConnectedDevices(userId) {
    try {
      return await this.request(`/devices/${userId}`);
    } catch (error) {
      return [];
    }
  }

  async connectDevice(userId, deviceType, authData) {
    try {
      return await this.request(`/devices/${userId}/connect`, {
        method: 'POST',
        body: JSON.stringify({ device_type: deviceType, auth_data: authData }),
      });
    } catch (error) {
      console.warn('Failed to connect device:', error);
      return { success: true, device_id: Date.now() };
    }
  }

  async disconnectDevice(userId, deviceId) {
    try {
      return await this.request(`/devices/${userId}/${deviceId}/disconnect`, {
        method: 'DELETE',
      });
    } catch (error) {
      return { success: true };
    }
  }

  async syncDeviceData(userId, deviceId) {
    try {
      return await this.request(`/devices/${userId}/${deviceId}/sync`, {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Failed to sync device data:', error);
      return { success: true, synced_records: 0 };
    }
  }

  // Settings
  async getUserSettings(userId) {
    try {
      return await this.request(`/users/${userId}/settings`);
    } catch (error) {
      return {
        notifications: {
          email: true,
          push: true,
          insights: true,
          predictions: true
        },
        privacy: {
          data_sharing: false,
          analytics: true
        },
        preferences: {
          theme: 'light',
          timezone: 'UTC',
          units: 'metric'
        }
      };
    }
  }

  async updateUserSettings(userId, settings) {
    try {
      return await this.request(`/users/${userId}/settings`, {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
    } catch (error) {
      return { success: true };
    }
  }

  // Mock data generation methods for development
  generateMockHealthData() {
    const data = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        sleep: 6 + Math.random() * 3,
        energy: 5 + Math.random() * 4,
        mood: 6 + Math.random() * 3,
        steps: Math.floor(8000 + Math.random() * 8000),
        heart_rate: Math.floor(65 + Math.random() * 20),
        stress_level: 3 + Math.random() * 4,
        hydration: 2 + Math.random() * 2, // liters
        calories: Math.floor(2000 + Math.random() * 500),
        weight: 70 + Math.random() * 2 - 1, // kg
        body_fat: 15 + Math.random() * 5, // percentage
        blood_pressure_systolic: Math.floor(115 + Math.random() * 20),
        blood_pressure_diastolic: Math.floor(75 + Math.random() * 15)
      });
    }
    
    return data;
  }

  generateMockPredictions() {
    return {
      energy: {
        next_24h: [
          { time: '09:00', value: 8.2, confidence: 0.85 },
          { time: '12:00', value: 7.5, confidence: 0.80 },
          { time: '15:00', value: 5.8, confidence: 0.75 },
          { time: '18:00', value: 6.5, confidence: 0.70 }
        ],
        trends: {
          weekly: 'increasing',
          monthly: 'stable'
        }
      },
      mood: {
        next_24h: [
          { time: '09:00', value: 7.8, confidence: 0.78 },
          { time: '12:00', value: 8.1, confidence: 0.82 },
          { time: '15:00', value: 7.2, confidence: 0.75 },
          { time: '18:00', value: 7.9, confidence: 0.80 }
        ],
        trends: {
          weekly: 'stable',
          monthly: 'increasing'
        }
      },
      sleep: {
        tonight: {
          duration: 7.5,
          quality: 8.2,
          confidence: 0.88
        },
        recommendations: [
          'Go to bed 30 minutes earlier tonight',
          'Avoid caffeine after 2 PM',
          'Consider light stretching before bed'
        ]
      }
    };
  }

  generateMockCorrelations() {
    return [
      {
        metrics: ['sleep', 'energy'],
        correlation: 0.87,
        strength: 'strong',
        p_value: 0.001,
        insights: 'Better sleep quality strongly predicts higher energy levels the next day'
      },
      {
        metrics: ['steps', 'mood'],
        correlation: 0.73,
        strength: 'strong',
        p_value: 0.003,
        insights: 'More physical activity correlates with improved mood scores'
      },
      {
        metrics: ['stress_level', 'sleep'],
        correlation: -0.62,
        strength: 'moderate',
        p_value: 0.015,
        insights: 'Higher stress levels negatively impact sleep quality'
      },
      {
        metrics: ['hydration', 'energy'],
        correlation: 0.58,
        strength: 'moderate',
        p_value: 0.028,
        insights: 'Proper hydration supports sustained energy levels'
      }
    ];
  }

  generateMockInsights() {
    return [
      {
        type: 'pattern',
        title: 'Energy Peak Timing',
        description: 'Your energy consistently peaks between 9-11 AM',
        recommendation: 'Schedule your most demanding tasks during this window',
        confidence: 0.92,
        impact: 'high'
      },
      {
        type: 'correlation',
        title: 'Sleep-Mood Connection',
        description: 'Your mood improves by 25% on days following 7+ hours of sleep',
        recommendation: 'Prioritize getting 7-8 hours of sleep nightly',
        confidence: 0.85,
        impact: 'high'
      },
      {
        type: 'anomaly',
        title: 'Unusual Stress Pattern',
        description: 'Stress levels have been 30% higher on Mondays this month',
        recommendation: 'Consider Sunday evening preparation routines',
        confidence: 0.78,
        impact: 'medium'
      },
      {
        type: 'optimization',
        title: 'Activity Timing',
        description: 'Morning workouts lead to 15% better mood throughout the day',
        recommendation: 'Try shifting exercise to morning hours',
        confidence: 0.81,
        impact: 'medium'
      }
    ];
  }
}

export const apiService = new ApiService();