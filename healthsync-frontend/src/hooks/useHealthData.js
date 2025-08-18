import { useState, useEffect, useCallback } from 'react';
import { healthDataService } from '../services/HealthDataService';

export const useHealthData = () => {
  const [healthData, setHealthData] = useState({
    sleep: [],
    activity: [],
    nutrition: [],
    vitals: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHealthData = useCallback(async (dateRange = 30) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await healthDataService.getHealthData(dateRange);
      setHealthData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching health data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateHealthMetric = useCallback(async (type, data) => {
    try {
      await healthDataService.updateHealthMetric(type, data);
      await fetchHealthData(); // Refresh data
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchHealthData]);

  const deleteHealthMetric = useCallback(async (type, id) => {
    try {
      await healthDataService.deleteHealthMetric(type, id);
      await fetchHealthData(); // Refresh data
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchHealthData]);

  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  return {
    healthData,
    loading,
    error,
    fetchHealthData,
    updateHealthMetric,
    deleteHealthMetric,
    refetch: fetchHealthData
  };
};