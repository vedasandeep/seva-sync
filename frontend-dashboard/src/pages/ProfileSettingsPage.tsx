import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { PersonalInfo } from '../features/user/components/PersonalInfo';
import { PasswordChange } from '../features/user/components/PasswordChange';
import { ActiveSessions } from '../features/user/components/ActiveSessions';
import { NotificationPreferencesTab } from '../features/user/components/NotificationPreferencesTab';

type TabType = 'personal' | 'password' | 'sessions' | 'notifications';

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'password', label: 'Password', icon: '🔐' },
    { id: 'sessions', label: 'Sessions', icon: '💻' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
  ];

  const showSuccessMessage = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  if (!user) {
    return <div style={styles.loadingText}>Loading profile...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Profile Settings</h1>
        <p style={styles.subtitle}>Manage your account and preferences</p>
      </div>

      {success && (
        <div style={styles.successAlert}>
          <CheckCircle size={18} />
          <span>{success}</span>
          <button onClick={() => setSuccess('')} style={styles.closeButton}>×</button>
        </div>
      )}

      {error && (
        <div style={styles.errorAlert}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError('')} style={styles.closeButton}>×</button>
        </div>
      )}

      <div style={styles.content}>
        <div style={styles.tabList}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.tabActive : {}),
              }}
            >
              <span style={styles.tabIcon}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div style={styles.tabContent}>
          {activeTab === 'personal' && <PersonalInfo user={user} onSuccess={showSuccessMessage} />}
           {activeTab === 'password' && <PasswordChange onSuccess={showSuccessMessage} />}
          {activeTab === 'sessions' && <ActiveSessions onSuccess={showSuccessMessage} />}
          {activeTab === 'notifications' && <NotificationPreferencesTab onSuccess={showSuccessMessage} />}
        </div>
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
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    marginBottom: '1.5rem',
    background: '#f0fdf4',
    color: '#166534',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    marginBottom: '1.5rem',
    background: '#fee2e2',
    color: '#991b1b',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
  },
  closeButton: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.5rem',
    color: 'inherit',
    padding: 0,
  },
  content: {
    background: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    display: 'flex',
  },
  tabList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    borderRight: '1px solid #e2e8f0',
    minWidth: '200px',
    padding: '1rem 0',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    background: 'none',
    border: 'none',
    borderLeft: '3px solid transparent',
    cursor: 'pointer',
    color: '#64748b',
    fontSize: '0.875rem',
    fontWeight: 500,
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  tabActive: {
    background: '#f1f5f9',
    color: '#1e40af',
    borderLeftColor: '#1e40af',
  },
  tabIcon: {
    fontSize: '1.25rem',
  },
  tabContent: {
    flex: 1,
    padding: '2rem',
  },
  loadingText: {
    padding: '2rem',
    textAlign: 'center',
    color: '#64748b',
  },
};
