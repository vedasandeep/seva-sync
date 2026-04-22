import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface EventPreference {
  eventId: string;
  eventName: string;
  description: string;
  channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  };
}

// Mock preferences
const MOCK_EVENT_PREFERENCES: EventPreference[] = [
  {
    eventId: 'task_assigned',
    eventName: 'Task Assigned',
    description: 'When a new task is assigned to you',
    channels: { email: true, sms: true, push: true, inApp: true },
  },
  {
    eventId: 'burnout_alert',
    eventName: 'Burnout Alert',
    description: 'When your workload exceeds safe levels',
    channels: { email: true, sms: false, push: true, inApp: true },
  },
  {
    eventId: 'sync_failure',
    eventName: 'Sync Failure',
    description: 'When data synchronization fails',
    channels: { email: true, sms: false, push: false, inApp: true },
  },
  {
    eventId: 'ivr_emergency',
    eventName: 'IVR Emergency',
    description: 'When an emergency is reported via IVR',
    channels: { email: true, sms: true, push: true, inApp: true },
  },
  {
    eventId: 'report_generated',
    eventName: 'Report Generated',
    description: 'When a new report is ready for download',
    channels: { email: true, sms: false, push: true, inApp: true },
  },
];

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<EventPreference[]>(MOCK_EVENT_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');

  const toggleChannel = (eventId: string, channel: keyof EventPreference['channels']) => {
    setPreferences(
      preferences.map((pref) =>
        pref.eventId === eventId
          ? {
              ...pref,
              channels: {
                ...pref.channels,
                [channel]: !pref.channels[channel],
              },
            }
          : pref
      )
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Mock API call
      console.log('Saving preferences:', { preferences, quietHoursEnabled, quietHoursStart, quietHoursEnd });
      setSuccess('Notification preferences saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
    }
    setLoading(false);
  };

  const handleResetToDefaults = async () => {
    if (!window.confirm('Reset all notification preferences to defaults?')) return;
    setPreferences(MOCK_EVENT_PREFERENCES);
    setQuietHoursEnabled(true);
    setQuietHoursStart('22:00');
    setQuietHoursEnd('08:00');
    setSuccess('Preferences reset to defaults');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Notification Preferences</h1>
          <p style={styles.subtitle}>Customize how and when you receive notifications</p>
        </div>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError('')} style={styles.closeButton}>×</button>
        </div>
      )}

      {success && (
        <div style={styles.successAlert}>
          <span>✓</span>
          <span>{success}</span>
          <button onClick={() => setSuccess('')} style={styles.closeButton}>×</button>
        </div>
      )}

      <div style={styles.content}>
        <form onSubmit={handleSave} style={styles.form}>
          {/* Event Preferences */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Event Notifications</h2>
            <p style={styles.sectionDescription}>
              Choose which notification channels to use for each event type
            </p>

            <div style={styles.preferencesGrid}>
              {preferences.map((pref) => (
                <div key={pref.eventId} style={styles.preferenceCard}>
                  <div style={styles.preferenceHeader}>
                    <h3 style={styles.preferenceName}>{pref.eventName}</h3>
                    <p style={styles.preferenceDescription}>{pref.description}</p>
                  </div>

                  <div style={styles.channelsGrid}>
                    <label style={styles.channelCheckbox}>
                      <input
                        type="checkbox"
                        checked={pref.channels.email}
                        onChange={() => toggleChannel(pref.eventId, 'email')}
                        disabled={loading}
                        style={styles.input}
                      />
                      <span style={styles.checkboxLabel}>📧 Email</span>
                    </label>
                    <label style={styles.channelCheckbox}>
                      <input
                        type="checkbox"
                        checked={pref.channels.sms}
                        onChange={() => toggleChannel(pref.eventId, 'sms')}
                        disabled={loading}
                        style={styles.input}
                      />
                      <span style={styles.checkboxLabel}>📱 SMS</span>
                    </label>
                    <label style={styles.channelCheckbox}>
                      <input
                        type="checkbox"
                        checked={pref.channels.push}
                        onChange={() => toggleChannel(pref.eventId, 'push')}
                        disabled={loading}
                        style={styles.input}
                      />
                      <span style={styles.checkboxLabel}>🔔 Push</span>
                    </label>
                    <label style={styles.channelCheckbox}>
                      <input
                        type="checkbox"
                        checked={pref.channels.inApp}
                        onChange={() => toggleChannel(pref.eventId, 'inApp')}
                        disabled={loading}
                        style={styles.input}
                      />
                      <span style={styles.checkboxLabel}>💬 In-App</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Quiet Hours</h2>
            <p style={styles.sectionDescription}>
              Pause non-urgent notifications during these hours
            </p>

            <div style={styles.quietHoursCard}>
              <label style={styles.quietHoursCheckbox}>
                <input
                  type="checkbox"
                  checked={quietHoursEnabled}
                  onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                  disabled={loading}
                  style={styles.input}
                />
                <span>Enable Quiet Hours</span>
              </label>

              {quietHoursEnabled && (
                <div style={styles.timeInputs}>
                  <div style={styles.timeGroup}>
                    <label style={styles.label}>From</label>
                    <input
                      type="time"
                      value={quietHoursStart}
                      onChange={(e) => setQuietHoursStart(e.target.value)}
                      style={styles.timeInput}
                      disabled={loading}
                    />
                  </div>
                  <div style={styles.timeGroup}>
                    <label style={styles.label}>To</label>
                    <input
                      type="time"
                      value={quietHoursEnd}
                      onChange={(e) => setQuietHoursEnd(e.target.value)}
                      style={styles.timeInput}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button
              type="button"
              onClick={handleResetToDefaults}
              style={styles.secondaryButton}
              disabled={loading}
            >
              Reset to Defaults
            </button>
            <button type="submit" style={styles.primaryButton} disabled={loading}>
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
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
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  section: {
    paddingBottom: '2rem',
    borderBottom: '1px solid #e2e8f0',
  },
  sectionTitle: {
    margin: '0 0 0.5rem',
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  sectionDescription: {
    margin: '0 0 1.5rem',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  preferencesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  preferenceCard: {
    padding: '1.25rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    background: '#f8fafc',
  },
  preferenceHeader: {
    marginBottom: '1rem',
  },
  preferenceName: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  preferenceDescription: {
    margin: '0.25rem 0 0',
    fontSize: '0.8rem',
    color: '#64748b',
  },
  channelsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
  },
  channelCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: '#475569',
  },
  input: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontWeight: 500,
  },
  quietHoursCard: {
    padding: '1.25rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    background: '#f8fafc',
  },
  quietHoursCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#334155',
    marginBottom: '1rem',
  },
  timeInputs: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
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
  timeInput: {
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    boxSizing: 'border-box',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    paddingTop: '1rem',
    marginTop: '1rem',
    borderTop: '1px solid #e2e8f0',
  },
  primaryButton: {
    padding: '0.875rem 1.5rem',
    background: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '0.875rem 1.5rem',
    background: '#f1f5f9',
    color: '#334155',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
