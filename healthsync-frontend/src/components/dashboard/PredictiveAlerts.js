// src/components/dashboard/PredictiveAlerts.js
import React, { useState, useEffect } from 'react';
import { aiInsightsService } from '../../services/aiInsightsService';
import NotificationBanner from '../common/NotificationBanner';

const PredictiveAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const predictiveAlerts = await aiInsightsService.getPredictiveAlerts();
        setAlerts(predictiveAlerts.filter(alert => !dismissedAlerts.includes(alert.id)));
      } catch (error) {
        console.error('Error fetching predictive alerts:', error);
      }
    };

    fetchAlerts();
  }, [dismissedAlerts]);

  const handleDismissAlert = (alertId) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  const getAlertType = (severity) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'info';
    }
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id));

  return (
    <div className="space-y-2">
      {visibleAlerts.map((alert) => (
        <NotificationBanner
          key={alert.id}
          message={alert.message}
          type={getAlertType(alert.severity)}
          duration={0} // Don't auto-dismiss
          onClose={() => handleDismissAlert(alert.id)}
        />
      ))}
    </div>
  );
};

export default PredictiveAlerts;