// Mock WebSocket Service for triggering notifications
export type NotificationType = 'task_assigned' | 'burnout_alert' | 'sync_failure' | 'ivr_emergency' | 'report_generated';

export interface MockNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

type NotificationListener = (notification: MockNotification) => void;

class MockWebSocketService {
  private listeners: Set<NotificationListener> = new Set();
  private notificationId = 0;

  private notificationTemplates: Record<NotificationType, { title: string; message: string }> = {
    task_assigned: {
      title: 'Task Assigned',
      message: 'You have been assigned "Update disaster map" task in the Kerala flood relief operation',
    },
    burnout_alert: {
      title: 'Burnout Alert',
      message: 'Your workload has exceeded safe levels. You have 12 pending tasks assigned. Consider taking a break.',
    },
    sync_failure: {
      title: 'Sync Failure',
      message: 'Failed to sync data with server. Please check your internet connection and try again.',
    },
    ivr_emergency: {
      title: 'IVR Emergency',
      message: 'New emergency reported: Medical emergency at relief camp. Immediate volunteers needed.',
    },
    report_generated: {
      title: 'Report Generated',
      message: 'Your weekly activity report is ready for download. View insights and statistics.',
    },
  };

  // Subscribe to notifications
  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Trigger a notification
  triggerNotification(type: NotificationType): void {
    const template = this.notificationTemplates[type];
    const notification: MockNotification = {
      id: String(++this.notificationId),
      type,
      title: template.title,
      message: template.message,
      timestamp: 'Just now',
      read: false,
    };

    // Emit to all listeners
    this.listeners.forEach((listener) => listener(notification));

    // Log to console for debugging
    console.log('🔔 Mock notification triggered:', notification);
  }

  // Trigger random notification
  triggerRandomNotification(): void {
    const types: NotificationType[] = ['task_assigned', 'burnout_alert', 'sync_failure', 'ivr_emergency', 'report_generated'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    this.triggerNotification(randomType);
  }

  // Auto-trigger notifications at intervals (for demo)
  startAutoTrigger(intervalMs: number = 30000): () => void {
    const interval = setInterval(() => this.triggerRandomNotification(), intervalMs);
    return () => clearInterval(interval);
  }
}

export const mockWebSocketService = new MockWebSocketService();

export default MockWebSocketService;
