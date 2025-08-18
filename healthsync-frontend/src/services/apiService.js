// src/services/apiService.js
import api from './api';

// Main API service that wraps the base api
export const apiService = {
  // Auth endpoints
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  
  // User profile
  getProfile: () => api.get('/user/profile'),
  updateProfile: (profileData) => api.put('/user/profile', profileData),
  
  // Health data
  getHealthData: (params) => api.get(`/health/data?${new URLSearchParams(params)}`),
  addHealthData: (data) => api.post('/health/data', data),
  updateHealthData: (id, data) => api.put(`/health/data/${id}`, data),
  deleteHealthData: (id) => api.delete(`/health/data/${id}`),
  
  // Analytics
  getAnalytics: (params) => api.get(`/analytics?${new URLSearchParams(params)}`),
  getCorrelations: () => api.get('/analytics/correlations'),
  getPredictions: () => api.get('/analytics/predictions'),
  
  // Insights
  getInsights: () => api.get('/insights'),
  getPersonalizedRecommendations: () => api.get('/insights/recommendations'),
  
  // Notifications
  getNotifications: () => api.get('/notifications'),
  markNotificationRead: (id) => api.put(`/notifications/${id}/read`),
  updateNotificationSettings: (settings) => api.put('/notifications/settings', settings),
  
  // Integrations
  getIntegrations: () => api.get('/integrations'),
  connectIntegration: (integration) => api.post('/integrations/connect', integration),
  disconnectIntegration: (id) => api.delete(`/integrations/${id}`),
  
  // Settings
  getSettings: () => api.get('/settings'),
  updateSettings: (settings) => api.put('/settings', settings),
};

export default apiService;