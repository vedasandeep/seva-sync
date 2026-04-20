interface BurnoutAlert {
  id: string;
  volunteerId: string;
  volunteerName: string;
  burnoutScore: number;
  level: 'high' | 'critical';
  reason: string;
  suggestedActions: string[];
  createdAt: string;
  status: 'new' | 'acknowledged' | 'resolved';
}

interface BurnoutAlertsPanelProps {
  alerts: BurnoutAlert[];
  onAction?: (action: 'checkin' | 'reassign' | 'break' | 'acknowledge', alertId: string) => void;
}

const getAlertColor = (level: BurnoutAlert['level']): Record<string, string> => {
  if (level === 'critical') {
    return {
      bg: '#fef2f2',
      border: '#fecaca',
      text: '#991b1b',
      icon: '🚨',
    };
  }
  return {
    bg: '#fffbeb',
    border: '#fde68a',
    text: '#92400e',
    icon: '⚠️',
  };
};

export default function BurnoutAlertsPanel({
  alerts,
  onAction,
}: BurnoutAlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>✅</div>
        <p style={styles.emptyText}>All volunteers are doing well!</p>
      </div>
    );
  }

  // Group alerts by status
  const newAlerts = alerts.filter((a) => a.status === 'new');
  const acknowledgedAlerts = alerts.filter((a) => a.status === 'acknowledged');
  const resolvedAlerts = alerts.filter((a) => a.status === 'resolved');

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>
        Burnout Alerts ({alerts.length})
      </h3>

      {/* Alert Summary */}
      <div style={styles.summary}>
        {newAlerts.length > 0 && (
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>🔴 New</span>
            <span style={styles.summaryValue}>{newAlerts.length}</span>
          </div>
        )}
        {acknowledgedAlerts.length > 0 && (
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>🟡 In Progress</span>
            <span style={styles.summaryValue}>{acknowledgedAlerts.length}</span>
          </div>
        )}
        {resolvedAlerts.length > 0 && (
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>✅ Resolved</span>
            <span style={styles.summaryValue}>{resolvedAlerts.length}</span>
          </div>
        )}
      </div>

      {/* Alert Groups */}
      {newAlerts.length > 0 && (
        <div style={styles.alertGroup}>
          <h4 style={styles.groupTitle}>New Alerts</h4>
          <div style={styles.alertsList}>
            {newAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAction={onAction}
              />
            ))}
          </div>
        </div>
      )}

      {acknowledgedAlerts.length > 0 && (
        <div style={styles.alertGroup}>
          <h4 style={styles.groupTitle}>In Progress</h4>
          <div style={styles.alertsList}>
            {acknowledgedAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAction={onAction}
              />
            ))}
          </div>
        </div>
      )}

      {resolvedAlerts.length > 0 && (
        <details style={styles.details}>
          <summary style={styles.summary}>
            Resolved ({resolvedAlerts.length})
          </summary>
          <div style={styles.alertsList}>
            {resolvedAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAction={onAction}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function AlertCard({
  alert,
  onAction,
}: {
  alert: BurnoutAlert;
  onAction?: (action: 'checkin' | 'reassign' | 'break' | 'acknowledge', alertId: string) => void;
}) {
  const colors = getAlertColor(alert.level);

  return (
    <div
      style={{
        ...styles.alertCard,
        backgroundColor: colors.bg,
        borderColor: colors.border,
      }}
    >
      {/* Header */}
      <div style={styles.alertHeader}>
        <div style={styles.alertTitle}>
          <span style={{ fontSize: '1.25rem' }}>{colors.icon}</span>
          <div>
            <h5 style={styles.alertVolunteerName}>{alert.volunteerName}</h5>
            <p style={styles.alertReason}>{alert.reason}</p>
          </div>
        </div>
        <div
          style={{
            ...styles.alertScore,
            backgroundColor: alert.level === 'critical' ? '#ef4444' : '#f59e0b',
            color: 'white',
          }}
        >
          {alert.burnoutScore.toFixed(0)}
        </div>
      </div>

      {/* Suggested Actions */}
      {alert.suggestedActions.length > 0 && (
        <div style={styles.suggestedActions}>
          <div style={styles.suggestedLabel}>Suggested Actions:</div>
          <ul style={styles.actionList}>
            {alert.suggestedActions.map((action, index) => (
              <li key={index} style={styles.actionItem}>
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div style={styles.actionButtons}>
        <button
          style={styles.actionBtn}
          onClick={() => onAction?.('checkin', alert.id)}
          title="Send wellness check-in"
        >
          💚 Check-in
        </button>
        <button
          style={styles.actionBtn}
          onClick={() => onAction?.('reassign', alert.id)}
          title="Reassign tasks"
        >
          🔄 Reassign
        </button>
        <button
          style={styles.actionBtn}
          onClick={() => onAction?.('break', alert.id)}
          title="Schedule break"
        >
          ☕ Break
        </button>
        {alert.status !== 'acknowledged' && (
          <button
            style={{ ...styles.actionBtn, ...styles.acknowledgeBtn }}
            onClick={() => onAction?.('acknowledge', alert.id)}
          >
            ✓ Acknowledge
          </button>
        )}
      </div>

      {/* Time Info */}
      <div style={styles.alertTime}>
        {new Date(alert.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  summary: {
    display: 'flex',
    gap: '1rem',
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    flexWrap: 'wrap',
  },
  summaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  summaryLabel: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#475569',
  },
  summaryValue: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  details: {
    cursor: 'pointer',
  },
  alertGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  groupTitle: {
    margin: '0.5rem 0',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#475569',
  },
  alertsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  alertCard: {
    padding: '1rem',
    border: '2px solid',
    borderRadius: '0.375rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  alertHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  alertTitle: {
    display: 'flex',
    gap: '0.75rem',
    flex: 1,
  },
  alertVolunteerName: {
    margin: 0,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  alertReason: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.75rem',
    color: '#64748b',
  },
  alertScore: {
    width: '48px',
    height: '48px',
    borderRadius: '0.375rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '1.125rem',
  },
  suggestedActions: {
    padding: '0.75rem',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '0.25rem',
  },
  suggestedLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '0.5rem',
  },
  actionList: {
    margin: 0,
    paddingLeft: '1.25rem',
    fontSize: '0.75rem',
  },
  actionItem: {
    marginBottom: '0.25rem',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  actionBtn: {
    padding: '0.375rem 0.75rem',
    backgroundColor: 'white',
    border: '1px solid #cbd5e1',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 600,
    transition: 'all 0.2s ease',
  },
  acknowledgeBtn: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
  },
  alertTime: {
    fontSize: '0.7rem',
    color: '#94a3b8',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    color: '#94a3b8',
  },
  emptyIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  emptyText: {
    margin: 0,
    fontSize: '0.875rem',
  },
};
