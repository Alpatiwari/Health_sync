// frontend/src/context/NotificationContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        )
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      };
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };
    case 'SET_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    default:
      return state;
  }
};

const initialState = {
  notifications: [],
  settings: {
    email: true,
    push: true,
    insights: true,
    predictions: true,
    microMoments: true,
    healthAlerts: true
  }
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Load notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotifications();
    } else {
      dispatch({ type: 'CLEAR_NOTIFICATIONS' });
    }
  }, [isAuthenticated, user]);

  // Set up periodic notification checks
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, 30 * 1000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const notifications = await apiService.getNotifications(user.id);
      dispatch({
        type: 'SET_NOTIFICATIONS',
        payload: notifications
      });
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      ...notification
    };

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: newNotification
    });

    // Auto-remove after specified duration or default 5 seconds
    if (notification.type === 'toast') {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, notification.duration || 5000);
    }

    return newNotification.id;
  };

  const removeNotification = (id) => {
    dispatch({
      type: 'REMOVE_NOTIFICATION',
      payload: id
    });
  };

  const markAsRead = async (id) => {
    try {
      dispatch({
        type: 'MARK_AS_READ',
        payload: id
      });

      if (user) {
        await apiService.markNotificationRead(id);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  const updateSettings = (settings) => {
    dispatch({
      type: 'SET_SETTINGS',
      payload: settings
    });
  };

  // Notification helpers
  const showSuccess = (message, options = {}) => {
    return addNotification({
      type: 'toast',
      variant: 'success',
      title: options.title || 'Success',
      message,
      ...options
    });
  };

  const showError = (message, options = {}) => {
    return addNotification({
      type: 'toast',
      variant: 'error',
      title: options.title || 'Error',
      message,
      duration: 8000, // Show errors longer
      ...options
    });
  };

  const showWarning = (message, options = {}) => {
    return addNotification({
      type: 'toast',
      variant: 'warning',
      title: options.title || 'Warning',
      message,
      ...options
    });
  };

  const showInfo = (message, options = {}) => {
    return addNotification({
      type: 'toast',
      variant: 'info',
      title: options.title || 'Information',
      message,
      ...options
    });
  };

  const showInsight = (insight) => {
    return addNotification({
      type: 'insight',
      variant: 'info',
      title: insight.title,
      message: insight.description,
      action: insight.action,
      priority: insight.priority || 'medium'
    });
  };

  const showPredictionAlert = (prediction) => {
    return addNotification({
      type: 'prediction',
      variant: 'warning',
      title: prediction.title,
      message: prediction.message,
      action: prediction.suggestion,
      priority: prediction.priority || 'high'
    });
  };

  const showMicroMoment = (moment) => {
    return addNotification({
      type: 'micro-moment',
      variant: 'success',
      title: moment.title,
      message: moment.description,
      action: 'Start Now',
      data: moment
    });
  };

  // Derived state
  const unreadCount = state.notifications.filter(n => !n.read).length;
  const recentNotifications = state.notifications.slice(0, 10);
  const hasUnread = unreadCount > 0;

  const value = {
    ...state,
    unreadCount,
    recentNotifications,
    hasUnread,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    updateSettings,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showInsight,
    showPredictionAlert,
    showMicroMoment
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};