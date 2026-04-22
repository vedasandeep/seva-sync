import { useState } from 'react';
import { Trash2, AlertCircle, Info, CheckCircle, AlertTriangle, Eye } from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Mock notifications data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Task Assigned',
    message: 'You have been assigned "Update disaster map" task in the Kerala flood relief operation',
    timestamp: 'Just now',
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Burnout Alert',
    message: 'Your workload has exceeded safe levels. You have 12 pending tasks assigned. Consider taking a break.',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: '3',
    type: 'error',
    title: 'Sync Failure',
    message: 'Failed to sync data with server. Please check your internet connection and try again.',
    timestamp: '5 hours ago',
    read: true,
  },
  {
    id: '4',
    type: 'info',
    title: 'Report Generated',
    message: 'Your weekly activity report is ready for download. View insights and statistics.',
    timestamp: '1 day ago',
    read: true,
  },
  {
    id: '5',
    type: 'success',
    title: 'Volunteer Inactive',
    message: 'Volunteer John Doe has been inactive for 30 days. Consider reaching out.',
    timestamp: '2 days ago',
    read: true,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  const filteredNotifications = notifications.filter((notif) => {
    if (filterType === 'unread') return !notif.read;
    if (filterType === 'read') return notif.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifications(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map((n) => n.id)));
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkMultipleAsRead = () => {
    setNotifications(
      notifications.map((n) => (selectedNotifications.has(n.id) ? { ...n, read: true } : n))
    );
    setSelectedNotifications(new Set());
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    setSelectedNotifications(new Set([...selectedNotifications].filter((id_) => id_ !== id)));
  };

  const handleDeleteMultiple = () => {
    if (!window.confirm('Delete selected notifications?')) return;
    setNotifications(notifications.filter((n) => !selectedNotifications.has(n.id)));
    setSelectedNotifications(new Set());
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} style={{ color: '#16a34a' }} />;
      case 'warning':
        return <AlertTriangle size={20} style={{ color: '#f59e0b' }} />;
      case 'error':
        return <AlertCircle size={20} style={{ color: '#dc2626' }} />;
      default:
        return <Info size={20} style={{ color: '#0ea5e9' }} />;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Notifications</h1>
          <p style={styles.subtitle}>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All notifications read'}
          </p>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.toolbar}>
          <div style={styles.tabs}>
            <button
              onClick={() => setFilterType('all')}
              style={{
                ...styles.tab,
                ...(filterType === 'all' ? styles.tabActive : {}),
              }}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilterType('unread')}
              style={{
                ...styles.tab,
                ...(filterType === 'unread' ? styles.tabActive : {}),
              }}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilterType('read')}
              style={{
                ...styles.tab,
                ...(filterType === 'read' ? styles.tabActive : {}),
              }}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>

          <div style={styles.actions}>
            {selectedNotifications.size > 0 && (
              <>
                <button
                  onClick={handleMarkMultipleAsRead}
                  style={styles.actionButton}
                  title="Mark selected as read"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={handleDeleteMultiple}
                  style={{ ...styles.actionButton, ...styles.dangerButton }}
                  title="Delete selected"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={styles.markAllButton}
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div style={styles.emptyState}>
            <AlertCircle size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
            <h3 style={styles.emptyTitle}>
              {filterType === 'all' ? 'No notifications' : `No ${filterType} notifications`}
            </h3>
            <p style={styles.emptyText}>
              {filterType === 'all'
                ? 'You are all caught up!'
                : filterType === 'unread'
                ? 'All notifications have been read'
                : 'No read notifications yet'}
            </p>
          </div>
        ) : (
          <div style={styles.notificationsList}>
            <div style={styles.selectAllRow}>
              <input
                type="checkbox"
                checked={selectedNotifications.size === filteredNotifications.length}
                onChange={handleSelectAll}
                style={styles.checkbox}
              />
              <label style={styles.selectAllLabel}>
                {selectedNotifications.size > 0
                  ? `${selectedNotifications.size} selected`
                  : 'Select all notifications'}
              </label>
            </div>

            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  ...styles.notificationItem,
                  ...(notif.read ? {} : styles.notificationItemUnread),
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedNotifications.has(notif.id)}
                  onChange={() => handleToggleSelect(notif.id)}
                  style={styles.checkbox}
                />
                <div style={styles.notificationIcon}>{getIcon(notif.type)}</div>
                <div style={styles.notificationContent}>
                  <h3 style={styles.notificationTitle}>{notif.title}</h3>
                  <p style={styles.notificationMessage}>{notif.message}</p>
                  <span style={styles.notificationTime}>{notif.timestamp}</span>
                </div>
                <div style={styles.notificationActions}>
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      style={styles.markReadButton}
                      title="Mark as read"
                    >
                      <Eye size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    style={styles.deleteButton}
                    title="Delete notification"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '2rem',
    background: '#f8fafc',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    margin: 0,
    fontSize: '1.875rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  subtitle: {
    margin: '0.5rem 0 0',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  content: {
    background: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #e2e8f0',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
  },
  tab: {
    padding: '0.5rem 1rem',
    background: 'none',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#64748b',
    cursor: 'pointer',
  },
  tabActive: {
    background: '#1e40af',
    color: 'white',
    borderColor: '#1e40af',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  actionButton: {
    padding: '0.5rem 0.75rem',
    background: '#f1f5f9',
    color: '#334155',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
  },
  dangerButton: {
    color: '#dc2626',
    borderColor: '#fecaca',
  },
  markAllButton: {
    padding: '0.5rem 1rem',
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
    padding: '4rem 1rem',
    textAlign: 'center',
  },
  emptyTitle: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  emptyText: {
    margin: '0.5rem 0 0',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  notificationsList: {
    display: 'flex',
    flexDirection: 'column',
  },
  selectAllRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.5rem',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  selectAllLabel: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#334155',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  notificationItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '1.5rem',
    borderBottom: '1px solid #f1f5f9',
    background: 'white',
    transition: 'background-color 0.2s',
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
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  notificationMessage: {
    margin: '0.5rem 0 0',
    fontSize: '0.875rem',
    color: '#64748b',
    lineHeight: '1.5',
  },
  notificationTime: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  notificationActions: {
    display: 'flex',
    gap: '0.5rem',
    flexShrink: 0,
  },
  markReadButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#0ea5e9',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#dc2626',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
  },
};
