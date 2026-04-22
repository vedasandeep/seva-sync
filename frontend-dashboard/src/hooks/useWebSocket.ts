import { useEffect, useCallback } from 'react';
import { webSocketService, Notification } from '../services/WebSocketService';
import { useAuth } from '../lib/auth';

export function useWebSocket() {
  const { user } = useAuth();

  /**
   * Monitor WebSocket connection (it's initialized in AuthProvider)
   */
  useEffect(() => {
    // WebSocket is already connected in AuthProvider, this just monitors it
    if (!user) {
      return;
    }

    // Optional: add any monitoring or re-connection logic here
    return () => {
      // Cleanup if needed
    };
  }, [user]);

  /**
   * Subscribe to notifications
   */
  const subscribeToNotifications = useCallback(
    (callback: (notification: Notification) => void) => {
      return webSocketService.subscribe(callback);
    },
    []
  );

  /**
   * Subscribe to connection changes
   */
  const subscribeToConnectionChanges = useCallback(
    (callback: (connected: boolean) => void) => {
      return webSocketService.onConnectionChange(callback);
    },
    []
  );

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback((notificationId: string) => {
    webSocketService.markAsRead(notificationId);
  }, []);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback((notificationId: string) => {
    webSocketService.deleteNotification(notificationId);
  }, []);

  return {
    isConnected: webSocketService.isConnectedToServer(),
    subscribeToNotifications,
    subscribeToConnectionChanges,
    markAsRead,
    deleteNotification,
  };
}

export default useWebSocket;
