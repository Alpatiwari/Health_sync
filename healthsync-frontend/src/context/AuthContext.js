// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiService } from '../services/apiService';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        user: null,
        token: null,
        isAuthenticated: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          dispatch({ type: 'LOGIN_START' });
          const user = await apiService.getCurrentUser();
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user, token }
          });
        } catch (error) {
          console.error('Failed to restore authentication:', error);
          localStorage.removeItem('authToken');
          dispatch({
            type: 'LOGIN_FAILURE',
            payload: 'Session expired. Please login again.'
          });
        }
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await apiService.login(email, password);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response,
          token: response.token
        }
      });
      
      return response;
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message || 'Login failed'
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (userData) => {
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};