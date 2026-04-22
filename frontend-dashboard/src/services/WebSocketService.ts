import { io, Socket } from 'socket.io-client';
import { logger } from '../infrastructure/logger';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

type NotificationListener = (notification: Notification) => void;
type ConnectionListener = (connected: boolean) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private notificationListeners: Set<NotificationListener> = new Set();
  private connectionListeners: Set<ConnectionListener> = new Set();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to WebSocket server
   */
  connect(token: string, userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        
        this.socket = io(apiUrl, {
          auth: {
            token,
            userId,
          },
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: this.maxReconnectAttempts,
        });

        // Connection established
        this.socket.on('connect', () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          logger.info('WebSocket connected');
          this.notifyConnectionListeners(true);
          resolve();
        });

        // Receive notifications
        this.socket.on('notification', (notification: Notification) => {
          logger.info('Received notification:', notification);
          this.notifyNotificationListeners(notification);
        });

        // Handle specific notification types
        this.socket.on('task:assigned', (data: any) => {
          this.handleNotification('task_assigned', data);
        });

        this.socket.on('task:completed', (data: any) => {
          this.handleNotification('task_completed', data);
        });

        this.socket.on('login:alert', (data: any) => {
          this.handleNotification('login_alert', data);
        });

        this.socket.on('report:ready', (data: any) => {
          this.handleNotification('report_ready', data);
        });

        this.socket.on('invite:received', (data: any) => {
          this.handleNotification('invite_received', data);
        });

        // Handle disconnection
        this.socket.on('disconnect', () => {
          this.isConnected = false;
          logger.warn('WebSocket disconnected');
          this.notifyConnectionListeners(false);
        });

        // Handle connection error
        this.socket.on('connect_error', (error: any) => {
          this.reconnectAttempts++;
          logger.error('WebSocket connection error:', error.message);
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(error);
          }
        });

        // Handle authentication error
        this.socket.on('auth_error', (error: any) => {
          logger.error('WebSocket authentication error:', error.message);
          reject(new Error('Authentication failed'));
        });
      } catch (error) {
        logger.error('Failed to connect to WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      logger.info('WebSocket disconnected');
      this.notifyConnectionListeners(false);
    }
  }

  /**
   * Check if connected
   */
  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  /**
   * Subscribe to notifications
   */
  subscribe(listener: NotificationListener): () => void {
    this.notificationListeners.add(listener);
    return () => {
      this.notificationListeners.delete(listener);
    };
  }

  /**
   * Subscribe to connection changes
   */
  onConnectionChange(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('notification:read', { notificationId });
    }
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('notification:delete', { notificationId });
    }
  }

  /**
   * Handle notification emission
   */
  private handleNotification(type: string, data: any): void {
    const notification: Notification = {
      id: data.id || `${Date.now()}`,
      userId: data.userId || '',
      type,
      title: data.title || '',
      message: data.message || '',
      data: data.data,
      read: false,
      createdAt: data.createdAt || new Date().toISOString(),
    };

    this.notifyNotificationListeners(notification);
  }

  /**
   * Notify all notification listeners
   */
  private notifyNotificationListeners(notification: Notification): void {
    this.notificationListeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (error) {
        logger.error('Error in notification listener:', error);
      }
    });
  }

  /**
   * Notify all connection listeners
   */
  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach((listener) => {
      try {
        listener(connected);
      } catch (error) {
        logger.error('Error in connection listener:', error);
      }
    });
  }
}

export const webSocketService = new WebSocketService();
export default WebSocketService;
