import { Clock, Users, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

interface TaskCardProps {
  id: string;
  title: string;
  type: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: string;
  disasterName: string;
  assignedVolunteer?: { name: string; id: string };
  requiredSkills: string[];
  estimatedHours?: number;
  maxVolunteers: number;
  currentVolunteers: number;
  onViewDetails?: (taskId: string) => void;
  onAssign?: (taskId: string) => void;
  onStatusChange?: (taskId: string) => void;
}

const taskTypeEmojis: Record<string, string> = {
  RESCUE: '🚨',
  MEDICAL: '🏥',
  FOOD_DISTRIBUTION: '🍽️',
  SHELTER: '🏠',
  LOGISTICS: '📦',
  COMMUNICATION: '📞',
  TRANSPORT: '🚗',
  SUPPLY_COLLECTION: '📦',
  SAFETY: '⚠️',
  OTHER: '📋',
};

const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
  OPEN: { bg: '#f0f4f8', text: '#475569', icon: '⭕' },
  ASSIGNED: { bg: '#eff6ff', text: '#1e40af', icon: '✅' },
  IN_PROGRESS: { bg: '#fef3c7', text: '#92400e', icon: '⏳' },
  COMPLETED: { bg: '#dcfce7', text: '#166534', icon: '✓' },
  CANCELLED: { bg: '#fee2e2', text: '#7f1d1d', icon: '✗' },
};

const urgencyColors: Record<string, { bg: string; text: string }> = {
  LOW: { bg: '#dcfce7', text: '#166534' },
  MEDIUM: { bg: '#fef3c7', text: '#92400e' },
  HIGH: { bg: '#fed7aa', text: '#9a3412' },
  CRITICAL: { bg: '#fee2e2', text: '#991b1b' },
};

export default function TaskCard({
  id,
  title,
  type,
  status,
  urgency,
  location,
  disasterName,
  assignedVolunteer,
  requiredSkills,
  estimatedHours,
  maxVolunteers,
  currentVolunteers,
  onViewDetails,
  onAssign,
  onStatusChange,
}: TaskCardProps) {
  const statusColor = statusColors[status];
  const urgencyColor = urgencyColors[urgency];
  const typeEmoji = taskTypeEmojis[type] || '📋';

  return (
    <div style={styles.card}>
      {/* Header with title and badges */}
      <div style={styles.cardHeader}>
        <div style={styles.titleSection}>
          <span style={styles.typeEmoji}>{typeEmoji}</span>
          <h3 style={styles.title}>{title}</h3>
        </div>
        <div style={styles.badgeGroup}>
          <span
            style={{
              ...styles.badge,
              background: statusColor.bg,
              color: statusColor.text,
            }}
          >
            {statusColor.icon} {status}
          </span>
          <span
            style={{
              ...styles.badge,
              background: urgencyColor.bg,
              color: urgencyColor.text,
            }}
          >
            {urgency}
          </span>
        </div>
      </div>

      {/* Disaster name */}
      <p style={styles.disasterName}>{disasterName}</p>

      {/* Details row 1: Location & Hours */}
      <div style={styles.detailsRow}>
        <div style={styles.detail}>
          <MapPin size={14} style={{ color: '#64748b' }} />
          <span style={styles.detailText}>{location}</span>
        </div>
        {estimatedHours && (
          <div style={styles.detail}>
            <Clock size={14} style={{ color: '#64748b' }} />
            <span style={styles.detailText}>{estimatedHours}h</span>
          </div>
        )}
      </div>

      {/* Skills required */}
      {requiredSkills.length > 0 && (
        <div style={styles.skillsContainer}>
          <span style={styles.skillsLabel}>Required Skills:</span>
          <div style={styles.skillsList}>
            {requiredSkills.slice(0, 3).map((skill) => (
              <span key={skill} style={styles.skillBadge}>
                {skill}
              </span>
            ))}
            {requiredSkills.length > 3 && (
              <span style={styles.skillBadge}>+{requiredSkills.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {/* Volunteer assignment status */}
      <div style={styles.assignmentSection}>
        {assignedVolunteer ? (
          <div style={styles.assignedVolunteer}>
            <span style={styles.assignmentLabel}>👤 Assigned to:</span>
            <span style={styles.volunteerName}>{assignedVolunteer.name}</span>
          </div>
        ) : (
          <div style={styles.unassigned}>
            <AlertCircle size={14} style={{ color: '#f97316' }} />
            <span style={styles.unassignedText}>Unassigned</span>
          </div>
        )}
      </div>

      {/* Volunteers progress bar */}
      <div style={styles.progressSection}>
        <div style={styles.progressLabel}>
          <Users size={14} />
          <span>{currentVolunteers} / {maxVolunteers} volunteers</span>
        </div>
        <div style={styles.progressBar}>
          <div
            style={{
              ...styles.progressFill,
              width: `${Math.min((currentVolunteers / maxVolunteers) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={styles.actionButtons}>
        <button
          onClick={() => onViewDetails?.(id)}
          style={styles.viewBtn}
        >
          👁️ View Details
        </button>
        {status === 'OPEN' && (
          <button
            onClick={() => onAssign?.(id)}
            style={styles.assignBtn}
          >
            + Assign
          </button>
        )}
        {status === 'ASSIGNED' && currentVolunteers > 0 && (
          <button
            onClick={() => onStatusChange?.(id)}
            style={styles.progressBtn}
          >
            ▶️ Start
          </button>
        )}
        {status === 'IN_PROGRESS' && (
          <button
            onClick={() => onStatusChange?.(id)}
            style={styles.completeBtn}
          >
            <CheckCircle2 size={14} /> Complete
          </button>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '0.75rem',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    transition: 'all 0.3s',
    cursor: 'pointer',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  titleSection: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    flex: 1,
  },
  typeEmoji: {
    fontSize: '1.25rem',
    marginTop: '0.125rem',
  },
  title: {
    margin: 0,
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: '#1e293b',
    lineHeight: 1.4,
  },
  badgeGroup: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  badge: {
    padding: '0.375rem 0.625rem',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  disasterName: {
    margin: 0,
    fontSize: '0.8125rem',
    color: '#64748b',
  },
  detailsRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  detail: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
  },
  detailText: {
    fontSize: '0.8125rem',
    color: '#475569',
  },
  skillsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  skillsLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#64748b',
    whiteSpace: 'nowrap',
  },
  skillsList: {
    display: 'flex',
    gap: '0.375rem',
    flexWrap: 'wrap',
  },
  skillBadge: {
    background: '#e0f2fe',
    color: '#0369a1',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  assignmentSection: {
    padding: '0.5rem',
    background: '#f8fafc',
    borderRadius: '0.375rem',
  },
  assignedVolunteer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8125rem',
  },
  assignmentLabel: {
    fontWeight: 600,
    color: '#475569',
  },
  volunteerName: {
    color: '#0369a1',
    fontWeight: 500,
  },
  unassigned: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.8125rem',
    color: '#f97316',
    fontWeight: 500,
  },
  unassignedText: {},
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  progressLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 500,
  },
  progressBar: {
    height: '0.375rem',
    background: '#e2e8f0',
    borderRadius: '0.25rem',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#3b82f6',
    transition: 'width 0.3s',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  viewBtn: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    background: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '0.375rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    color: '#475569',
    transition: 'all 0.2s',
  },
  assignBtn: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  progressBtn: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  completeBtn: {
    flex: 1,
    padding: '0.5rem 0.75rem',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.375rem',
    transition: 'all 0.2s',
  },
};
