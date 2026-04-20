import { useState } from 'react';

export interface VolunteerCardData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  primarySkill?: string;
  burnoutScore: number;
  currentWorkload: number;
  maxWorkload: number;
  availability: 'available' | 'on_break' | 'unavailable';
  lastActiveAt?: string;
  disasterCount: number;
  location?: string;
}

interface VolunteerCardProps {
  volunteer: VolunteerCardData;
  onSelect: (id: string) => void;
  onAction?: (action: string, id: string) => void;
  isMobile?: boolean;
}

const getBurnoutColor = (score: number): string => {
  if (score <= 25) return '#10b981'; // Green
  if (score <= 50) return '#f59e0b'; // Yellow
  if (score <= 75) return '#f97316'; // Orange
  return '#ef4444'; // Red
};

const getBurnoutLevel = (score: number): string => {
  if (score <= 25) return 'Low';
  if (score <= 50) return 'Moderate';
  if (score <= 75) return 'High';
  return 'Critical';
};

const getAvailabilityBadgeColor = (availability: string): { background: string; text: string } => {
  switch (availability) {
    case 'available':
      return { background: '#dbeafe', text: '#0c4a6e' };
    case 'on_break':
      return { background: '#fef3c7', text: '#92400e' };
    case 'unavailable':
      return { background: '#fee2e2', text: '#7f1d1d' };
    default:
      return { background: '#f3f4f6', text: '#374151' };
  }
};

export default function VolunteerCard({
  volunteer,
  onSelect,
  onAction,
  isMobile = false,
}: VolunteerCardProps) {
  const [showActions, setShowActions] = useState(false);

  const workloadPercent = (volunteer.currentWorkload / volunteer.maxWorkload) * 100;
  const availabilityColors = getAvailabilityBadgeColor(volunteer.availability);

  return (
    <div
      style={{
        ...styles.card,
        ...(isMobile ? styles.mobileCard : {}),
      }}
      onClick={() => onSelect(volunteer.id)}
      role="button"
      tabIndex={0}
    >
      {/* Header with Avatar and Basic Info */}
      <div style={styles.cardHeader}>
        <div style={styles.avatarSection}>
          <div style={styles.avatar}>
            {volunteer.avatar ? (
              <img
                src={volunteer.avatar}
                alt={`${volunteer.firstName} ${volunteer.lastName}`}
                style={styles.avatarImg}
              />
            ) : (
              <div style={styles.avatarPlaceholder}>
                {volunteer.firstName[0]}
                {volunteer.lastName[0]}
              </div>
            )}
          </div>

          <div style={styles.basicInfo}>
            <h3 style={styles.name}>
              {volunteer.firstName} {volunteer.lastName}
            </h3>
            <p style={styles.email}>{volunteer.email}</p>
            {volunteer.primarySkill && (
              <p style={styles.skill}>{volunteer.primarySkill}</p>
            )}
          </div>
        </div>

        {/* Action Menu Button */}
        <div style={styles.actionMenu}>
          <button
            style={styles.moreButton}
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            aria-label="More actions"
          >
            ⋮
          </button>

          {showActions && (
            <div style={styles.actionDropdown}>
              <button
                style={styles.actionItem}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction?.('view_details', volunteer.id);
                  setShowActions(false);
                }}
              >
                👁️ View Details
              </button>
              <button
                style={styles.actionItem}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction?.('wellness_checkin', volunteer.id);
                  setShowActions(false);
                }}
              >
                💚 Wellness Check-in
              </button>
              <button
                style={styles.actionItem}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction?.('message', volunteer.id);
                  setShowActions(false);
                }}
              >
                💬 Message
              </button>
              <button
                style={styles.actionItem}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction?.('reassign_tasks', volunteer.id);
                  setShowActions(false);
                }}
              >
                🔄 Reassign Tasks
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Badges Row */}
      <div style={styles.badgesRow}>
        <span style={{ ...styles.badge, backgroundColor: availabilityColors.background, color: availabilityColors.text }}>
          {volunteer.availability === 'available' ? '✓ Available' : volunteer.availability === 'on_break' ? '☕ On Break' : '✕ Unavailable'}
        </span>
        <span
          style={{
            ...styles.badge,
            backgroundColor: getBurnoutColor(volunteer.burnoutScore) + '20',
            color: getBurnoutColor(volunteer.burnoutScore),
            fontWeight: 600,
          }}
        >
          Burnout: {getBurnoutLevel(volunteer.burnoutScore)}
        </span>
      </div>

      {/* Metrics Section */}
      <div style={styles.metricsGrid}>
        {/* Workload */}
        <div style={styles.metric}>
          <div style={styles.metricLabel}>Workload</div>
          <div style={styles.workloadBar}>
            <div
              style={{
                ...styles.workloadFill,
                width: `${Math.min(workloadPercent, 100)}%`,
                backgroundColor: workloadPercent > 100 ? '#ef4444' : '#3b82f6',
              }}
            />
          </div>
          <div style={styles.metricValue}>
            {volunteer.currentWorkload}/{volunteer.maxWorkload} tasks
          </div>
        </div>

        {/* Burnout Score Gauge */}
        <div style={styles.metric}>
          <div style={styles.metricLabel}>Burnout Score</div>
          <div style={styles.scoreGauge}>
            <div
              style={{
                ...styles.scoreGaugeFill,
                width: `${volunteer.burnoutScore}%`,
                backgroundColor: getBurnoutColor(volunteer.burnoutScore),
              }}
            />
          </div>
          <div style={styles.metricValue}>{volunteer.burnoutScore.toFixed(1)}/100</div>
        </div>

        {/* Disasters Deployed */}
        <div style={styles.metric}>
          <div style={styles.metricLabel}>Deployments</div>
          <div style={styles.metricValue}>{volunteer.disasterCount}</div>
        </div>
      </div>

      {/* Activity Info */}
      {volunteer.lastActiveAt && (
        <div style={styles.activityInfo}>
          Last active: {new Date(volunteer.lastActiveAt).toLocaleDateString()}
        </div>
      )}

      {/* Location */}
      {volunteer.location && (
        <div style={styles.locationInfo}>
          📍 {volunteer.location}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  mobileCard: {
    paddingBottom: '1.5rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
    gap: '0.75rem',
  },
  avatarSection: {
    display: 'flex',
    gap: '0.75rem',
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: '3rem',
    height: '3rem',
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    backgroundColor: '#e2e8f0',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    color: 'white',
    fontWeight: 700,
    fontSize: '0.875rem',
  },
  basicInfo: {
    minWidth: 0,
    flex: 1,
  },
  name: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  email: {
    margin: '0.125rem 0 0 0',
    fontSize: '0.75rem',
    color: '#64748b',
  },
  skill: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: '#0c4a6e',
  },
  actionMenu: {
    position: 'relative',
  },
  moreButton: {
    padding: '0.5rem',
    backgroundColor: 'transparent',
    border: '1px solid #e2e8f0',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    fontSize: '1rem',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    overflow: 'hidden',
    zIndex: 10,
    minWidth: '150px',
  },
  actionItem: {
    display: 'block',
    width: '100%',
    padding: '0.625rem 0.75rem',
    backgroundColor: 'white',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'background-color 0.15s ease',
  },
  badgesRow: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.75rem',
    flexWrap: 'wrap',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.625rem',
    borderRadius: '9999px',
    fontSize: '0.7rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  metric: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  metricLabel: {
    fontSize: '0.7rem',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  workloadBar: {
    height: '0.375rem',
    backgroundColor: '#e2e8f0',
    borderRadius: '9999px',
    overflow: 'hidden',
  },
  workloadFill: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 0.3s ease',
  },
  scoreGauge: {
    height: '0.375rem',
    backgroundColor: '#e2e8f0',
    borderRadius: '9999px',
    overflow: 'hidden',
  },
  scoreGaugeFill: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 0.3s ease',
  },
  activityInfo: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginBottom: '0.5rem',
  },
  locationInfo: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
};
