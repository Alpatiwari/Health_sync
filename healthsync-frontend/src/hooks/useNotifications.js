import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/NotificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    push: false,
    email: false,
    inApp: true,
    frequency: 'daily'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await notificationService.getSettings();
      setSettings(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching notification settings:', err);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings) => {
    try {
      await notificationService.updateSettings(newSettings);
      setSettings(prev => ({ ...prev, ...newSettings }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const permission = await notificationService.requestPermission();
      return permission;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchSettings();
  }, [fetchNotifications, fetchSettings]);

  return {
    notifications,
    settings,
    loading,
    error,
    fetchNotifications,
    updateSettings,
    markAsRead,
    requestPermission,
    refetch: fetchNotifications
  };
};