// AuthContext.js - Fixed version with proper exports
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

// Create the AuthContext
export const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.login({ email, password });
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await api.register(userData);
      
      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      }
      
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Update user function
  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const response = await api.refreshToken();
      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
      }
      return response;
    } catch (error) {
      // If refresh fails, logout user
      logout();
      throw error;
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user && user.roles && user.roles.includes(role);
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return user && user.permissions && user.permissions.includes(permission);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
    hasRole,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Default export for backwards compatibility
export default AuthContext;