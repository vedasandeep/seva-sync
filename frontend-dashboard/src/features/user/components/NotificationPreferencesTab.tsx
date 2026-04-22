import React, { useState } from 'react';
import { AlertCircle, Clock } from 'lucide-react';

interface NotificationPreference {
  id: string;
  name: string;
  description: string;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

interface NotificationPreferencesTabProps {
  onSuccess: (message: string) => void;
}

// Mock preferences
const MOCK_PREFERENCES: NotificationPreference[] = [
  {
    id: 'task_assigned',
    name: 'Task Assigned',
    description: 'When a new task is assigned to you',
    channels: { email: true, sms: true, push: true },
  },
  {
    id: 'burnout_alert',
    name: 'Burnout Alert',
    description: 'When your workload exceeds safe levels',
    channels: { email: true, sms: false, push: true },
  },
  {
    id: 'sync_failure',
    name: 'Sync Failure',
    description: 'When data synchronization fails',
    channels: { email: true, sms: false, push: false },
  },
  {
    id: 'report_generated',
    name: 'Report Generated',
    description: 'When a new report is ready',
    channels: { email: true, sms: false, push: true },
  },
];

export const NotificationPreferencesTab: React.FC<NotificationPreferencesTabProps> = ({ onSuccess }) => {
  const [preferences, setPreferences] = useState<NotificationPreference[]>(MOCK_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');

  const togglePreference = async (id: string, channel: keyof NotificationPreference['channels']) => {
    const updated = preferences.map((pref) => {
      if (pref.id === id) {
        return {
          ...pref,
          channels: {
            ...pref.channels,
            [channel]: !pref.channels[channel],
          },
        };
      }
      return pref;
    });
    setPreferences(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Mock API call
      console.log('Saving preferences:', { preferences, quietHoursEnabled, quietHoursStart, quietHoursEnd });
      onSuccess('Notification preferences updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Notification Preferences</h2>
      <p style={styles.description}>Choose how and when you receive notifications</p>

      {error && (
        <div style={styles.errorAlert}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} style={styles.form}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Event Notifications</h3>
          <div style={styles.preferencesGrid}>
            {preferences.map((pref) => (
              <div key={pref.id} style={styles.preferenceCard}>
                <div style={styles.preferenceInfo}>
                  <h4 style={styles.preferenceName}>{pref.name}</h4>
                  <p style={styles.preferenceDescription}>{pref.description}</p>
                </div>
                <div style={styles.channelToggles}>
                  <label style={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={pref.channels.email}
                      onChange={() => togglePreference(pref.id, 'email')}
                      style={styles.toggleInput}
                      disabled={loading}
                    />
                    <span style={styles.toggleLabel}>Email</span>
                  </label>
                  <label style={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={pref.channels.sms}
                      onChange={() => togglePreference(pref.id, 'sms')}
                      style={styles.toggleInput}
                      disabled={loading}
                    />
                    <span style={styles.toggleLabel}>SMS</span>
                  </label>
                  <label style={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={pref.channels.push}
                      onChange={() => togglePreference(pref.id, 'push')}
                      style={styles.toggleInput}
                      disabled={loading}
                    />
                    <span style={styles.toggleLabel}>Push</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Quiet Hours</h3>
          <p style={styles.sectionDescription}>Pause non-urgent notifications during these hours</p>

          <div style={styles.quietHoursContainer}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={quietHoursEnabled}
                onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                disabled={loading}
                style={styles.checkbox}
              />
              <span>Enable Quiet Hours</span>
            </label>

            {quietHoursEnabled && (
              <div style={styles.timeInputs}>
                <div style={styles.timeGroup}>
                  <label style={styles.label}>From</label>
                  <div style={styles.timeInputWrapper}>
                    <Clock size={16} style={styles.timeIcon} />
                    <input
                      type="time"
                      value={quietHoursStart}
                      onChange={(e) => setQuietHoursStart(e.target.value)}
                      style={styles.timeInput}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div style={styles.timeGroup}>
                  <label style={styles.label}>To</label>
                  <div style={styles.timeInputWrapper}>
                    <Clock size={16} style={styles.timeIcon} />
                    <input
                      type="time"
                      value={quietHoursEnd}
                      onChange={(e) => setQuietHoursEnd(e.target.value)}
                      style={styles.timeInput}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '800px',
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  section: {
    padding: '1.5rem',
    background: '#f8fafc',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0',
  },
  sectionTitle: {
    margin: '0 0 0.5rem',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  sectionDescription: {
    margin: '0 0 1rem',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  preferencesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
  },
  preferenceCard: {
    padding: '1rem',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
  },
  preferenceInfo: {
    marginBottom: '1rem',
  },
  preferenceName: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  preferenceDescription: {
    margin: '0.25rem 0 0',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  channelToggles: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  toggleInput: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  toggleLabel: {
    color: '#475569',
  },
  quietHoursContainer: {
    padding: '1rem',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#334155',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  timeInputs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0',
  },
  timeGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#334155',
  },
  timeInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  timeIcon: {
    position: 'absolute',
    left: '0.75rem',
    color: '#94a3b8',
    pointerEvents: 'none',
  },
  timeInput: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    boxSizing: 'border-box',
  },
  button: {
    padding: '0.875rem 1.5rem',
    background: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    width: 'fit-content',
  },
};

export default NotificationPreferencesTab;
