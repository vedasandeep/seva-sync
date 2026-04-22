import React from 'react';
import { Clock, MapPin, AlertCircle, CheckCircle2, Users } from 'lucide-react';

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  location: string;
  distance?: number;
  requiredSkills?: string[];
  assignedVolunteers?: number;
  maxVolunteers?: number;
  deadline?: Date;
  onClick?: () => void;
  onAccept?: () => void;
}

/**
 * TaskCard Component
 * Displays a task with polished UI and animations
 */
export const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  priority,
  status,
  location,
  distance,
  requiredSkills = [],
  assignedVolunteers = 0,
  maxVolunteers = 5,
  deadline,
  onClick,
  onAccept,
}) => {
  const priorityColors = {
    URGENT: { bg: '#fee2e2', border: '#dc2626', text: '#991b1b' },
    HIGH: { bg: '#fef3c7', border: '#ca8a04', text: '#92400e' },
    MEDIUM: { bg: '#dbeafe', border: '#1e40af', text: '#1e3a8a' },
    LOW: { bg: '#dcfce7', border: '#16a34a', text: '#15803d' },
  };

  const statusIcons = {
    PENDING: { icon: AlertCircle, color: '#ca8a04' },
    IN_PROGRESS: { icon: Users, color: '#1e40af' },
    COMPLETED: { icon: CheckCircle2, color: '#16a34a' },
  };

  const StatusIcon = statusIcons[status].icon;
  const color = priorityColors[priority];

  const isDeadlineClose = deadline
    ? new Date(deadline).getTime() - Date.now() < 24 * 60 * 60 * 1000
    : false;

  const hoursRemaining = deadline
    ? Math.round((new Date(deadline).getTime() - Date.now()) / (60 * 60 * 1000))
    : null;

  return (
    <div
      style={styles.card}
      className="animate-slideInUp"
      onClick={onClick}
    >
      {/* Header */}
      <div style={styles.header}>
        <div style={{ flex: 1 }}>
          <h3 style={styles.title}>{title}</h3>
          {description && <p style={styles.description}>{description}</p>}
        </div>
        <div
          style={{
            ...styles.priorityBadge,
            backgroundColor: color.bg,
            borderColor: color.border,
          }}
        >
          <span style={{ color: color.text, fontWeight: 600 }}>
            {priority}
          </span>
        </div>
      </div>

      {/* Location */}
      <div style={styles.locationRow}>
        <MapPin size={16} style={{ color: '#64748b' }} />
        <span style={styles.locationText}>{location}</span>
        {distance && (
          <span style={styles.distance}>
            {distance.toFixed(1)} km away
          </span>
        )}
      </div>

      {/* Skills */}
      {requiredSkills.length > 0 && (
        <div style={styles.skillsRow}>
          {requiredSkills.slice(0, 3).map((skill) => (
            <span key={skill} style={styles.skillBadge}>
              {skill}
            </span>
          ))}
          {requiredSkills.length > 3 && (
            <span style={styles.skillBadge}>
              +{requiredSkills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.stat}>
          <Users size={16} style={{ color: '#64748b' }} />
          <span style={styles.statText}>
            {assignedVolunteers}/{maxVolunteers} assigned
          </span>
        </div>

        {deadline && (
          <div style={styles.stat}>
            <Clock
              size={16}
              style={{
                color: isDeadlineClose ? '#dc2626' : '#64748b',
              }}
            />
            <span
              style={{
                ...styles.statText,
                color: isDeadlineClose ? '#dc2626' : '#475569',
                fontWeight: isDeadlineClose ? 600 : 400,
              }}
            >
              {hoursRemaining !== null && hoursRemaining > 0
                ? `${hoursRemaining}h remaining`
                : 'Urgent'}
            </span>
          </div>
        )}

        <div style={styles.stat}>
          <StatusIcon
            size={16}
            style={{ color: statusIcons[status].color }}
          />
          <span style={styles.statText}>{status}</span>
        </div>
      </div>

      {/* Action Button */}
      {onAccept && status === 'PENDING' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAccept();
          }}
          style={styles.acceptButton}
          className="animate-scaleIn"
        >
          Accept Task
        </button>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1rem',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  description: {
    margin: '0.5rem 0 0 0',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  priorityBadge: {
    padding: '0.25rem 0.75rem',
    border: '1px solid',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  locationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
  },
  locationText: {
    color: '#475569',
    flex: 1,
  },
  distance: {
    color: '#64748b',
    fontSize: '0.8rem',
  },
  skillsRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  skillBadge: {
    padding: '0.25rem 0.5rem',
    background: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    color: '#475569',
  },
  statsRow: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.875rem',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#475569',
  },
  statText: {
    fontSize: '0.875rem',
    color: '#475569',
  },
  acceptButton: {
    padding: '0.5rem 1rem',
    background: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
  },
};

export default TaskCard;
