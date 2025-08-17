// frontend/src/context/HealthDataContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { healthDataService } from '../services/HealthDataService';
import { useAuth } from './AuthContext';

const HealthDataContext = createContext();

const healthDataReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        data: action.payload.data,
        lastUpdated: action.payload.timestamp,
        error: null
      };
    case 'FETCH_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'ADD_DATA_POINT':
      return {
        ...state,
        data: [...state.data, action.payload],
        lastUpdated: Date.now()
      };
    case 'UPDATE_DATA_POINT':
      return {
        ...state,
        data: state.data.map(item =>
          item.date === action.payload.date ? { ...item, ...action.payload } : item
        ),
        lastUpdated: Date.now()
      };
    case 'REMOVE_DATA_POINT':
      return {
        ...state,
        data: state.data.filter(item => item.date !== action.payload),
        lastUpdated: Date.now()
      };
    case 'SET_DATE_RANGE':
      return {
        ...state,
        dateRange: action.payload
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    case 'CLEAR_DATA':
      return {
        ...state,
        data: [],
        lastUpdated: null,
        error: null
      };
    default:
      return state;
  }
};

const initialState = {
  data: [],
  loading: false,
  error: null,
  lastUpdated: null,
  dateRange: {
    start: null,
    end: null
  },
  filters: {
    metrics: [],
    aggregation: 'daily'
  }
};

export const HealthDataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(healthDataReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Fetch health data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchHealthData();
    } else {
      dispatch({ type: 'CLEAR_DATA' });
    }
  }, [isAuthenticated, user]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const interval = setInterval(() => {
      fetchHealthData(false); // Silent refresh
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const fetchHealthData = async (showLoading = true) => {
    if (!user) return;

    try {
      if (showLoading) {
        dispatch({ type: 'FETCH_START' });
      }

      const options = {
        startDate: state.dateRange.start,
        endDate: state.dateRange.end,
        metrics: state.filters.metrics,
        aggregation: state.filters.aggregation
      };

      const data = await healthDataService.getHealthData(user.id, options);

      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          data,
          timestamp: Date.now()
        }
      });

      return data;
    } catch (error) {
      console.error('Failed to fetch health data:', error);
      dispatch({
        type: 'FETCH_FAILURE',
        payload: error.message || 'Failed to load health data'
      });
      throw error;
    }
  };

  const addDataPoint = async (dataPoint) => {
    if (!user) return;

    try {
      // Optimistic update
      dispatch({
        type: 'ADD_DATA_POINT',
        payload: dataPoint
      });

      // Save to backend
      await healthDataService.saveHealthData(user.id, dataPoint);
    } catch (error) {
      console.error('Failed to add data point:', error);
      // Revert optimistic update on failure
      await fetchHealthData(false);
      throw error;
    }
  };

  const updateDataPoint = async (date, updates) => {
    if (!user) return;

    try {
      const updatedPoint = { date, ...updates };
      
      // Optimistic update
      dispatch({
        type: 'UPDATE_DATA_POINT',
        payload: updatedPoint
      });

      // Save to backend
      await healthDataService.saveHealthData(user.id, updatedPoint);
    } catch (error) {
      console.error('Failed to update data point:', error);
      // Revert optimistic update on failure
      await fetchHealthData(false);
      throw error;
    }
  };

  const removeDataPoint = async (date) => {
    if (!user) return;

    try {
      // Optimistic update
      dispatch({
        type: 'REMOVE_DATA_POINT',
        payload: date
      });

      // Remove from backend (implementation depends on API)
      // await healthDataService.removeHealthData(user.id, date);
    } catch (error) {
      console.error('Failed to remove data point:', error);
      // Revert optimistic update on failure
      await fetchHealthData(false);
      throw error;
    }
  };

  const setDateRange = (startDate, endDate) => {
    dispatch({
      type: 'SET_DATE_RANGE',
      payload: { start: startDate, end: endDate }
    });
  };

  const setFilters = (filters) => {
    dispatch({
      type: 'SET_FILTERS',
      payload: filters
    });
  };

  const getMetricTrend = async (metric, days = 30) => {
    if (!user) return null;

    try {
      return await healthDataService.getMetricTrend(user.id, metric, days);
    } catch (error) {
      console.error('Failed to get metric trend:', error);
      return null;
    }
  };

  const getHealthScore = async (date = null) => {
    if (!user) return null;

    try {
      return await healthDataService.getHealthScore(user.id, date);
    } catch (error) {
      console.error('Failed to get health score:', error);
      return null;
    }
  };

  const refreshData = () => {
    return fetchHealthData(true);
  };

  // Derived state
  const latestDataPoint = state.data.length > 0 ? state.data[state.data.length - 1] : null;
  const hasData = state.data.length > 0;
  const isStale = state.lastUpdated && (Date.now() - state.lastUpdated) > 10 * 60 * 1000; // 10 minutes

  const value = {
    ...state,
    latestDataPoint,
    hasData,
    isStale,
    fetchHealthData,
    addDataPoint,
    updateDataPoint,
    removeDataPoint,
    setDateRange,
    setFilters,
    getMetricTrend,
    getHealthScore,
    refreshData
  };

  return (
    <HealthDataContext.Provider value={value}>
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};