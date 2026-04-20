export interface TimelineEvent {
  id: string;
  type:
    | 'task_assigned'
    | 'task_completed'
    | 'task_reassigned'
    | 'wellness_checkin'
    | 'break_started'
    | 'break_ended'
    | 'deployment_started'
    | 'deployment_ended'
    | 'note_added'
    | 'availability_changed';
  timestamp: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
}

const getEventIcon = (type: TimelineEvent['type']): string => {
  switch (type) {
    case 'task_assigned':
      return '📋';
    case 'task_completed':
      return '✅';
    case 'task_reassigned':
      return '🔄';
    case 'wellness_checkin':
      return '💚';
    case 'break_started':
      return '☕';
    case 'break_ended':
      return '🔄';
    case 'deployment_started':
      return '🚀';
    case 'deployment_ended':
      return '🏁';
    case 'note_added':
      return '📝';
    case 'availability_changed':
      return '📍';
    default:
      return '•';
  }
};

const getEventColor = (
  type: TimelineEvent['type']
): { dot: string; line: string } => {
  switch (type) {
    case 'task_assigned':
      return { dot: '#3b82f6', line: '#dbeafe' };
    case 'task_completed':
      return { dot: '#10b981', line: '#dcfce7' };
    case 'task_reassigned':
      return { dot: '#8b5cf6', line: '#ede9fe' };
    case 'wellness_checkin':
      return { dot: '#ec4899', line: '#fce7f3' };
    case 'break_started':
      return { dot: '#f59e0b', line: '#fef3c7' };
    case 'break_ended':
      return { dot: '#10b981', line: '#dcfce7' };
    case 'deployment_started':
      return { dot: '#ef4444', line: '#fee2e2' };
    case 'deployment_ended':
      return { dot: '#10b981', line: '#dcfce7' };
    case 'note_added':
      return { dot: '#6366f1', line: '#e0e7ff' };
    case 'availability_changed':
      return { dot: '#14b8a6', line: '#ccfbf1' };
    default:
      return { dot: '#94a3b8', line: '#e2e8f0' };
  }
};

export default function ActivityTimeline({
  events,
}: ActivityTimelineProps) {
  if (events.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>📭</div>
        <p style={styles.emptyText}>No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Activity Timeline</h3>
      <div style={styles.timeline}>
        {events.map((event, index) => {
          const colors = getEventColor(event.type);
          const isLast = index === events.length - 1;

          return (
            <div key={event.id} style={styles.timelineItem}>
              {/* Timeline Line */}
              {!isLast && (
                <div
                  style={{
                    ...styles.timelineLine,
                    backgroundColor: colors.line,
                  }}
                />
              )}

              {/* Dot and Content */}
              <div style={styles.itemContent}>
                {/* Dot */}
                <div
                  style={{
                    ...styles.timelineDot,
                    backgroundColor: colors.dot,
                  }}
                >
                  <span style={styles.eventIcon}>{getEventIcon(event.type)}</span>
                </div>

                {/* Card */}
                <div style={styles.eventCard}>
                  <div style={styles.eventHeader}>
                    <h4 style={styles.eventTitle}>{event.title}</h4>
                    <span style={styles.eventTime}>
                      {new Date(event.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {event.description && (
                    <p style={styles.eventDescription}>{event.description}</p>
                  )}

                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div style={styles.eventMeta}>
                      {Object.entries(event.metadata).map(([key, value]) => (
                        <div key={key} style={styles.metaItem}>
                          <span style={styles.metaKey}>{key}:</span>
                          <span style={styles.metaValue}>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  timelineItem: {
    display: 'flex',
    gap: '1rem',
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: '20px',
    top: '40px',
    width: '2px',
    bottom: '-1rem',
  },
  itemContent: {
    display: 'flex',
    gap: '1rem',
    paddingBottom: '1rem',
    flex: 1,
  },
  timelineDot: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
    zIndex: 1,
  },
  eventIcon: {
    fontSize: '1.25rem',
  },
  eventCard: {
    flex: 1,
    padding: '0.75rem 1rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    minWidth: 0,
  },
  eventHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
    gap: '0.75rem',
  },
  eventTitle: {
    margin: 0,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  eventTime: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  eventDescription: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#64748b',
    marginBottom: '0.5rem',
  },
  eventMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  metaItem: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  metaKey: {
    fontWeight: 600,
    color: '#475569',
  },
  metaValue: {
    marginLeft: '0.25rem',
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
