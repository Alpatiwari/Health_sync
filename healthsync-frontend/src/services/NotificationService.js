import { api } from './api';

class NotificationService {
  // Get all notifications
  async getNotifications() {
    try {
      return await api.get('/notifications');
    } catch (error) {
      throw new Error(`Failed to get notifications: ${error.message}`);
    }
  }

  // Get notification settings
  async getSettings() {
    try {
      return await api.get('/notifications/settings');
    } catch (error) {
      throw new Error(`Failed to get notification settings: ${error.message}`);
    }
  }

  // Update notification settings
  async updateSettings(settings) {
    try {
      return await api.put('/notifications/settings', settings);
    } catch (error) {
      throw new Error(`Failed to update notification settings: ${error.message}`);
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      return await api.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      return await api.patch('/notifications/read-all');
    } catch (error) {
      throw new Error(`Failed to mark all notifications as read: ${error.message}`);
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      return await api.delete(`/notifications/${notificationId}`);
    } catch (error) {
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  }

  // Create custom notification
  async createNotification(notificationData) {
    try {
      return await api.post('/notifications', notificationData);
    } catch (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  // Request push notification permission
  async requestPermission() {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        
        // Update backend with permission status
        await api.post('/notifications/permission', { permission });
        
        return permission;
      }
      throw new Error('Notifications not supported in this browser');
    } catch (error) {
      throw new Error(`Failed to request notification permission: ${error.message}`);
    }
  }

  // Check permission status
  async checkPermissionStatus() {
    try {
      if ('Notification' in window) {
        return Notification.permission;
      }
      return 'not-supported';
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return 'error';
    }
  }

  // Send test notification
  async sendTestNotification() {
    try {
      return await api.post('/notifications/test');
    } catch (error) {
      throw new Error(`Failed to send test notification: ${error.message}`);
    }
  }

  // Schedule notification
  async scheduleNotification(notificationData, scheduleTime) {
    try {
      const data = { ...notificationData, scheduleTime };
      return await api.post('/notifications/schedule', data);
    } catch (error) {
      throw new Error(`Failed to schedule notification: ${error.message}`);
    }
  }

  // Cancel scheduled notification
  async cancelScheduledNotification(notificationId) {
    try {
      return await api.delete(`/notifications/schedule/${notificationId}`);
    } catch (error) {
      throw new Error(`Failed to cancel scheduled notification: ${error.message}`);
    }
  }

  // Get notification history
  async getNotificationHistory(page = 1, limit = 20) {
    try {
      const params = { page, limit };
      return await api.get('/notifications/history', params);
    } catch (error) {
      throw new Error(`Failed to get notification history: ${error.message}`);
    }
  }

  // Subscribe to push notifications
  async subscribeToPush(subscription) {
    try {
      return await api.post('/notifications/push-subscribe', subscription);
    } catch (error) {
      throw new Error(`Failed to subscribe to push notifications: ${error.message}`);
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush() {
    try {
      return await api.post('/notifications/push-unsubscribe');
    } catch (error) {
      throw new Error(`Failed to unsubscribe from push notifications: ${error.message}`);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;