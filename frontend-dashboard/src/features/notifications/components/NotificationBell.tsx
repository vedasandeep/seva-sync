import React, { useState } from 'react';
import { Bell, X, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationBellProps {
  unreadCount?: number;
  onDropdownOpen?: () => void;
}

// Mock notifications
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Task Assigned',
    message: 'You have been assigned "Update disaster map" task',
    timestamp: 'Just now',
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Burnout Alert',
    message: 'Your workload has exceeded safe levels. Consider taking a break.',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: '3',
    type: 'error',
    title: 'Sync Failure',
    message: 'Failed to sync data with server. Please check your connection.',
    timestamp: '5 hours ago',
    read: true,
  },
  {
    id: '4',
    type: 'info',
    title: 'Report Generated',
    message: 'Weekly activity report is ready for download',
    timestamp: '1 day ago',
    read: true,
  },
];

export const NotificationBell: React.FC<NotificationBellProps> = ({ onDropdownOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && onDropdownOpen) {
      onDropdownOpen();
    }
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} style={{ color: '#16a34a' }} />;
      case 'warning':
        return <AlertTriangle size={16} style={{ color: '#f59e0b' }} />;
      case 'error':
        return <AlertCircle size={16} style={{ color: '#dc2626' }} />;
      default:
        return <Info size={16} style={{ color: '#0ea5e9' }} />;
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={handleToggle} style={styles.bellButton}>
        <Bell size={20} />
        {unreadCount > 0 && <span style={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {isOpen && (
        <>
          <div style={styles.overlay} onClick={handleToggle}></div>
          <div style={styles.dropdown}>
            <div style={styles.dropdownHeader}>
              <h3 style={styles.dropdownTitle}>Notifications</h3>
              <button onClick={handleToggle} style={styles.closeButton}>
                <X size={18} />
              </button>
            </div>

            <div style={styles.notificationsList}>
              {notifications.length === 0 ? (
                <div style={styles.emptyState}>
                  <Bell size={32} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                  <p style={styles.emptyText}>No notifications</p>
                </div>
              ) : (
                <>
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      style={{
                        ...styles.notificationItem,
                        ...(notif.read ? {} : styles.notificationItemUnread),
                      }}
                    >
                      <div style={styles.notificationIcon}>{getIcon(notif.type)}</div>
                      <div style={styles.notificationContent}>
                        <h4 style={styles.notificationTitle}>{notif.title}</h4>
                        <p style={styles.notificationMessage}>{notif.message}</p>
                        <span style={styles.notificationTime}>{notif.timestamp}</span>
                      </div>
                      <button
                        onClick={() => handleDelete(notif.id)}
                        style={styles.deleteButton}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>

            {notifications.length > 0 && unreadCount > 0 && (
              <div style={styles.dropdownFooter}>
                <button onClick={handleMarkAllAsRead} style={styles.markAllButton}>
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
  },
  bellButton: {
    position: 'relative',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    fontSize: '1.25rem',
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#dc2626',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: 700,
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    width: '380px',
    background: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    zIndex: 100,
    marginTop: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '500px',
  },
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: '1px solid #e2e8f0',
  },
  dropdownTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
  },
  notificationsList: {
    overflowY: 'auto',
    flex: 1,
  },
  notificationItem: {
    display: 'flex',
    gap: '0.75rem',
    padding: '1rem',
    borderBottom: '1px solid #f1f5f9',
    background: 'white',
  },
  notificationItemUnread: {
    background: '#f0f9ff',
  },
  notificationIcon: {
    display: 'flex',
    alignItems: 'flex-start',
    flexShrink: 0,
    paddingTop: '0.125rem',
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
  },
  notificationTitle: {
    margin: 0,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  notificationMessage: {
    margin: '0.25rem 0 0',
    fontSize: '0.8rem',
    color: '#64748b',
    lineHeight: '1.4',
  },
  notificationTime: {
    fontSize: '0.7rem',
    color: '#94a3b8',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#cbd5e1',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  dropdownFooter: {
    padding: '1rem',
    borderTop: '1px solid #e2e8f0',
    background: '#f8fafc',
  },
  markAllButton: {
    width: '100%',
    padding: '0.5rem',
    background: '#f1f5f9',
    color: '#1e40af',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1rem',
    textAlign: 'center',
  },
  emptyText: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#94a3b8',
  },
};

export default NotificationBell;
