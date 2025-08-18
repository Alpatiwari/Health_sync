// src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const api = {
  baseURL: API_BASE_URL,
  
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken');
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  get(endpoint) {
    return this.request(endpoint);
  },
  
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  },
};

export default api;