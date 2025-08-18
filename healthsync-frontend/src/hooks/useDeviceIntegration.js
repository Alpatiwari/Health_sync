import { useState, useEffect, useCallback } from 'react';
import integrationsService from '../services/IntegrationService';

export const useDeviceIntegration = () => {
  const [devices, setDevices] = useState([]);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState({});

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const availableDevices = await integrationsService.getAvailableDevices();
      const connected = await integrationsService.getConnectedDevices();
      setDevices(availableDevices);
      setConnectedDevices(connected);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching devices:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const connectDevice = useCallback(async (deviceType, credentials) => {
    setLoading(true);
    setError(null);
    try {
      const result = await integrationsService.connectDevice(deviceType, credentials);
      await fetchDevices(); // Refresh device list
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchDevices]);

  const disconnectDevice = useCallback(async (deviceId) => {
    try {
      await integrationsService.disconnectDevice(deviceId);
      await fetchDevices(); // Refresh device list
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchDevices]);

  const syncDevice = useCallback(async (deviceId) => {
    setSyncStatus(prev => ({ ...prev, [deviceId]: 'syncing' }));
    try {
      const result = await integrationsService.syncDevice(deviceId);
      setSyncStatus(prev => ({ ...prev, [deviceId]: 'success' }));
      return result;
    } catch (err) {
      setSyncStatus(prev => ({ ...prev, [deviceId]: 'error' }));
      setError(err.message);
      throw err;
    }
  }, []);

  const getDeviceData = useCallback(async (deviceId, dataType, dateRange = 7) => {
    try {
      const data = await integrationsService.getDeviceData(deviceId, dataType, dateRange);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return {
    devices,
    connectedDevices,
    loading,
    error,
    syncStatus,
    fetchDevices,
    connectDevice,
    disconnectDevice,
    syncDevice,
    getDeviceData,
    refetch: fetchDevices
  };
};