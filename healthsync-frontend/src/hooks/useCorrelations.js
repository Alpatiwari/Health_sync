import { useState, useCallback } from 'react';
import { aiInsightsService } from '../services/AIInsightsService';

export const useCorrelations = () => {
  const [correlations, setCorrelations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCorrelations = useCallback(async (metrics = [], timeRange = 30) => {
    setLoading(true);
    setError(null);
    try {
      const data = await aiInsightsService.getCorrelations(metrics, timeRange);
      setCorrelations(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching correlations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateCorrelation = useCallback(async (metric1, metric2, timeRange = 30) => {
    try {
      const correlation = await aiInsightsService.calculateCorrelation(metric1, metric2, timeRange);
      return correlation;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return {
    correlations,
    loading,
    error,
    fetchCorrelations,
    calculateCorrelation,
    refetch: fetchCorrelations
  };
};