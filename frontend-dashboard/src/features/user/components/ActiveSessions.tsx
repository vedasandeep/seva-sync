import React, { useState } from 'react';
import { Monitor, Smartphone, Trash2, AlertCircle } from 'lucide-react';

interface Session {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  lastActive: string;
  createdAt: string;
  isCurrent: boolean;
}

interface ActiveSessionsProps {
  onSuccess: (message: string) => void;
}

// Mock sessions data
const MOCK_SESSIONS: Session[] = [
  {
    id: '1',
    device: 'Desktop - Windows',
    browser: 'Chrome 125.0',
    ipAddress: '192.168.1.100',
    lastActive: 'Just now',
    createdAt: '2 days ago',
    isCurrent: true,
  },
  {
    id: '2',
    device: 'Mobile - iOS',
    browser: 'Safari 17.0',
    ipAddress: '203.0.113.45',
    lastActive: '12 hours ago',
    createdAt: '5 days ago',
    isCurrent: false,
  },
  {
    id: '3',
    device: 'Laptop - macOS',
    browser: 'Firefox 124.0',
    ipAddress: '198.51.100.89',
    lastActive: '3 days ago',
    createdAt: '2 weeks ago',
    isCurrent: false,
  },
];

export const ActiveSessions: React.FC<ActiveSessionsProps> = ({ onSuccess }) => {
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogoutSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to log out this session?')) return;

    setLoading(true);
    setError('');

    try {
      // Mock API call
      setSessions(sessions.filter((s) => s.id !== sessionId));
      onSuccess('Session logged out successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout session');
    }
    setLoading(false);
  };

  const handleLogoutAllOthers = async () => {
    if (!window.confirm('Log out all other sessions? You will need to log in again on those devices.'))
      return;

    setLoading(true);
    setError('');

    try {
      // Mock API call
      setSessions(sessions.filter((s) => s.isCurrent));
      onSuccess('All other sessions logged out successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout sessions');
    }
    setLoading(false);
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('ios') || device.toLowerCase().includes('android')) {
      return <Smartphone size={20} style={{ color: '#3b82f6' }} />;
    }
    return <Monitor size={20} style={{ color: '#6b7280' }} />;
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Active Sessions</h2>
      <p style={styles.description}>
        Manage devices where you're logged in. You have a limit of 5 active sessions per account.
      </p>

      {error && (
        <div style={styles.errorAlert}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={styles.sessionsList}>
        {sessions.map((session) => (
          <div key={session.id} style={styles.sessionCard}>
            <div style={styles.sessionHeader}>
              <div style={styles.sessionIconAndInfo}>
                <div style={styles.iconWrapper}>{getDeviceIcon(session.device)}</div>
                <div style={styles.sessionInfoText}>
                  <h3 style={styles.sessionDevice}>
                    {session.device}
                    {session.isCurrent && <span style={styles.currentBadge}>Current</span>}
                  </h3>
                  <p style={styles.sessionBrowser}>{session.browser}</p>
                </div>
              </div>
              {!session.isCurrent && (
                <button
                  onClick={() => handleLogoutSession(session.id)}
                  disabled={loading}
                  style={styles.logoutButton}
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            <div style={styles.sessionMeta}>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>IP Address:</span>
                <span style={styles.metaValue}>{session.ipAddress}</span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Last Active:</span>
                <span style={styles.metaValue}>{session.lastActive}</span>
              </div>
              <div style={styles.metaItem}>
                <span style={styles.metaLabel}>Created:</span>
                <span style={styles.metaValue}>{session.createdAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sessions.length > 1 && (
        <button onClick={handleLogoutAllOthers} disabled={loading} style={styles.logoutAllButton}>
          Log Out All Other Sessions
        </button>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '600px',
  },
  title: {
    margin: '0 0 0.5rem',
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  description: {
    margin: '0 0 1.5rem',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    marginBottom: '1.5rem',
    background: '#fee2e2',
    color: '#991b1b',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
  },
  sessionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  sessionCard: {
    padding: '1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    background: '#f8fafc',
  },
  sessionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  sessionIconAndInfo: {
    display: 'flex',
    gap: '1rem',
    flex: 1,
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    background: 'white',
    borderRadius: '0.5rem',
    flexShrink: 0,
  },
  sessionInfoText: {
    flex: 1,
  },
  sessionDevice: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  currentBadge: {
    display: 'inline-block',
    padding: '0.125rem 0.5rem',
    background: '#dbeafe',
    color: '#0c4a6e',
    borderRadius: '9999px',
    fontSize: '0.7rem',
    fontWeight: 700,
  },
  sessionBrowser: {
    margin: '0.25rem 0 0',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  logoutButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#dc2626',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
  },
  sessionMeta: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    fontSize: '0.875rem',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  metaLabel: {
    color: '#64748b',
    fontWeight: 600,
  },
  metaValue: {
    color: '#475569',
  },
  logoutAllButton: {
    padding: '0.75rem 1.5rem',
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default ActiveSessions;
