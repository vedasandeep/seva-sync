import React, { useState } from 'react';
import { Zap, Play, Square } from 'lucide-react';
import { mockWebSocketService, NotificationType } from '../../../services/MockWebSocketService';

interface NotificationTriggerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const NOTIFICATION_TYPES: Array<{ type: NotificationType; label: string; emoji: string }> = [
  { type: 'task_assigned', label: 'Task Assigned', emoji: '✅' },
  { type: 'burnout_alert', label: 'Burnout Alert', emoji: '⚠️' },
  { type: 'sync_failure', label: 'Sync Failure', emoji: '❌' },
  { type: 'ivr_emergency', label: 'IVR Emergency', emoji: '🚨' },
  { type: 'report_generated', label: 'Report Generated', emoji: '📊' },
];

export const NotificationTrigger: React.FC<NotificationTriggerProps> = ({ isOpen = true, onClose }) => {
  const [autoTriggerEnabled, setAutoTriggerEnabled] = useState(false);
  const [autoTriggerInterval, setAutoTriggerInterval] = useState('30');
  const [stopAutoTrigger, setStopAutoTrigger] = useState<(() => void) | null>(null);
  const [lastTriggered, setLastTriggered] = useState<string | null>(null);

  const handleTriggerNotification = (type: NotificationType) => {
    mockWebSocketService.triggerNotification(type);
    setLastTriggered(type);
    setTimeout(() => setLastTriggered(null), 2000);
  };

  const handleTriggerRandom = () => {
    mockWebSocketService.triggerRandomNotification();
    setLastTriggered('random');
    setTimeout(() => setLastTriggered(null), 2000);
  };

  const handleToggleAutoTrigger = () => {
    if (autoTriggerEnabled) {
      // Stop auto-trigger
      if (stopAutoTrigger) {
        stopAutoTrigger();
      }
      setAutoTriggerEnabled(false);
      setStopAutoTrigger(null);
    } else {
      // Start auto-trigger
      const intervalMs = parseInt(autoTriggerInterval) * 1000;
      const unsubscribe = mockWebSocketService.startAutoTrigger(intervalMs);
       setStopAutoTrigger(() => unsubscribe);
       setAutoTriggerEnabled(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.container}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <Zap size={20} style={{ color: '#f59e0b' }} />
            <h3 style={styles.title}>Notification Trigger</h3>
          </div>
          {onClose && (
            <button onClick={onClose} style={styles.closeButton}>
              ×
            </button>
          )}
        </div>

        <div style={styles.content}>
          <p style={styles.description}>
            Manually trigger notifications for testing the system
          </p>

          {/* Manual Triggers */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Manual Triggers</h4>
            <div style={styles.buttonGrid}>
              {NOTIFICATION_TYPES.map((notif) => (
                <button
                  key={notif.type}
                  onClick={() => handleTriggerNotification(notif.type)}
                  style={{
                    ...styles.triggerButton,
                    ...(lastTriggered === notif.type ? styles.triggerButtonActive : {}),
                  }}
                  title={`Trigger ${notif.label}`}
                >
                  <span style={styles.emoji}>{notif.emoji}</span>
                  <span style={styles.buttonLabel}>{notif.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleTriggerRandom}
              style={styles.randomButton}
              title="Trigger a random notification"
            >
              <Play size={16} />
              <span>Trigger Random</span>
            </button>
          </div>

          {/* Auto Trigger */}
          <div style={styles.section}>
            <h4 style={styles.sectionTitle}>Auto Trigger</h4>
            <div style={styles.autoTriggerContainer}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={autoTriggerEnabled}
                  onChange={handleToggleAutoTrigger}
                  style={styles.checkbox}
                />
                <span>
                  {autoTriggerEnabled ? 'Auto-triggering enabled' : 'Enable auto-triggering'}
                </span>
              </label>

              <div style={styles.intervalGroup}>
                <label style={styles.label}>Interval (seconds)</label>
                <input
                  type="number"
                  value={autoTriggerInterval}
                  onChange={(e) => setAutoTriggerInterval(e.target.value)}
                  disabled={autoTriggerEnabled}
                  style={styles.input}
                  min="5"
                  max="300"
                />
              </div>

              {autoTriggerEnabled && (
                <button
                  onClick={handleToggleAutoTrigger}
                  style={styles.stopButton}
                  title="Stop auto-triggering"
                >
                  <Square size={16} />
                  <span>Stop Auto-Trigger</span>
                </button>
              )}
            </div>
          </div>

          <p style={styles.devNote}>
             💡 <strong>Dev Note:</strong> These mock notifications are for testing only. Real notifications will come from the server via WebSocket.
           </p>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    zIndex: 999,
    maxWidth: '500px',
  },
  panel: {
    background: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
    borderBottom: '1px solid #fde68a',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 700,
    color: '#92400e',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#92400e',
    fontSize: '1.5rem',
    padding: 0,
  },
  content: {
    padding: '1.25rem',
    maxHeight: '500px',
    overflowY: 'auto',
  },
  description: {
    margin: '0 0 1rem',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  section: {
    marginBottom: '1.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid #f1f5f9',
  },
  sectionTitle: {
    margin: '0 0 0.75rem',
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  triggerButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.75rem 0.5rem',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#334155',
    transition: 'all 0.2s',
  },
  triggerButtonActive: {
    background: '#dbeafe',
    borderColor: '#0ea5e9',
    color: '#0c4a6e',
  },
  emoji: {
    fontSize: '1.25rem',
  },
  buttonLabel: {
    display: 'block',
    textAlign: 'center',
  },
  randomButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    background: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  autoTriggerContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1rem',
    background: '#f8fafc',
    borderRadius: '0.375rem',
    border: '1px solid #e2e8f0',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#334155',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  intervalGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#64748b',
  },
  input: {
    padding: '0.5rem',
    border: '1px solid #cbd5e1',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    boxSizing: 'border-box',
  },
  stopButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem',
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  devNote: {
    margin: 0,
    padding: '0.75rem',
    background: '#ecfdf5',
    color: '#065f46',
    borderRadius: '0.375rem',
    fontSize: '0.8rem',
    lineHeight: '1.4',
  },
};

export default NotificationTrigger;
