import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { logger } from '../infrastructure/logger';

interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export class WebSocketService {
  private io: SocketIOServer | null = null;
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds

  /**
   * Initialize Socket.io server
   */
  initializeWebSocket(httpServer: HttpServer, corsOrigins: string[]) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: corsOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.io.use((socket, next) => {
      const userId = socket.handshake.auth.userId;
      const token = socket.handshake.auth.token;

      if (!userId || !token) {
        return next(new Error('Authentication failed'));
      }

      // Attach userId to socket
      socket.data.userId = userId;
      next();
    });

    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.userId;
      logger.info(`[WebSocket] User connected: ${userId} (${socket.id})`);

      // Track socket connection
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, []);
      }
      this.userSockets.get(userId)!.push(socket.id);

      // Join user room
      socket.join(`user:${userId}`);

      // Handle disconnect
      socket.on('disconnect', () => {
        logger.info(`[WebSocket] User disconnected: ${userId} (${socket.id})`);
        const sockets = this.userSockets.get(userId) || [];
        const index = sockets.indexOf(socket.id);
        if (index > -1) {
          sockets.splice(index, 1);
        }
        if (sockets.length === 0) {
          this.userSockets.delete(userId);
        }
      });

      // Handle message events
      socket.on('test-message', (data: any) => {
        logger.info(`[WebSocket] Test message from ${userId}:`, data);
        socket.emit('test-response', { success: true, data });
      });
    });

    logger.info('[WebSocket] Socket.io initialized');
    return this.io;
  }

  /**
   * Send notification to a specific user
   */
  async sendNotificationToUser(userId: string, notification: NotificationPayload) {
    if (!this.io) return;

    const socketIds = this.userSockets.get(userId) || [];
    if (socketIds.length === 0) {
      logger.info(`[WebSocket] User ${userId} not connected, notification queued`);
      return;
    }

    // Send to all user's sockets
    this.io.to(`user:${userId}`).emit('notification', notification);
    logger.info(`[WebSocket] Notification sent to ${userId}: ${notification.type}`);
  }

  /**
   * Send notification to multiple users
   */
  async sendNotificationToUsers(userIds: string[], notification: NotificationPayload) {
    for (const userId of userIds) {
      await this.sendNotificationToUser(userId, notification);
    }
  }

  /**
   * Broadcast notification to all connected users
   */
  async broadcastNotification(notification: NotificationPayload) {
    if (!this.io) return;

    this.io.emit('notification', notification);
    logger.info(`[WebSocket] Broadcast notification: ${notification.type}`);
  }

  /**
   * Send task assignment notification
   */
  async notifyTaskAssigned(userId: string, taskId: string, taskTitle: string) {
    await this.sendNotificationToUser(userId, {
      userId,
      type: 'task_assigned',
      title: 'Task Assigned',
      message: `You have been assigned a new task: ${taskTitle}`,
      data: { taskId },
    });
  }

  /**
   * Send task completion notification
   */
  async notifyTaskCompleted(userId: string, taskTitle: string) {
    await this.sendNotificationToUser(userId, {
      userId,
      type: 'task_completed',
      title: 'Task Completed',
      message: `Task "${taskTitle}" has been completed`,
    });
  }

  /**
   * Send login alert notification
   */
  async notifyLoginAlert(userId: string, deviceInfo: string, ipAddress: string) {
    await this.sendNotificationToUser(userId, {
      userId,
      type: 'login_alert',
      title: 'New Login',
      message: `New login detected from ${deviceInfo} (${ipAddress})`,
      data: { deviceInfo, ipAddress },
    });
  }

  /**
   * Send report ready notification
   */
  async notifyReportReady(userId: string, reportName: string) {
    await this.sendNotificationToUser(userId, {
      userId,
      type: 'report_ready',
      title: 'Report Ready',
      message: `Your report "${reportName}" is ready for download`,
      data: { reportName },
    });
  }

  /**
   * Send invite notification
   */
  async notifyInviteReceived(userId: string, inviterName: string, role: string) {
    await this.sendNotificationToUser(userId, {
      userId,
      type: 'invite_received',
      title: 'Invitation',
      message: `${inviterName} has invited you to join as ${role}`,
    });
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    const sockets = this.userSockets.get(userId) || [];
    return sockets.length > 0;
  }

  /**
   * Get active user count
   */
  getActiveUserCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get all connected socket IDs for a user
   */
  getUserSockets(userId: string): string[] {
    return this.userSockets.get(userId) || [];
  }

  /**
   * Get the Socket.io instance
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;
