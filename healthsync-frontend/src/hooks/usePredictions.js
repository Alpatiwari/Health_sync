import { useState, useEffect } from 'react';

export const usePredictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/predictions'); // replace with your API URL
        if (!response.ok) {
          throw new Error('Failed to fetch predictions');
        }
        const data = await response.json();
        setPredictions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []); // runs once when the hook is used

  return { predictions, loading, error };
};
