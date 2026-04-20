import { X, Users, Clock, MapPin, AlertCircle, CheckCircle2, Activity } from 'lucide-react';
import Timeline, { TimelineEvent } from '../Timeline';

interface TaskDetailDrawerProps {
  taskId: string;
  title: string;
  type: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  urgency: string;
  location: string;
  disasterName: string;
  description?: string;
  assignedVolunteer?: { id: string; name: string };
  requiredSkills: string[];
  estimatedHours?: number;
  maxVolunteers: number;
  currentVolunteers: number;
  createdAt?: Date;
  onClose: () => void;
  onAssign?: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: string) => void;
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

// Mock activity timeline
const generateMockActivity = (_taskId: string): TimelineEvent[] => {
  return [
    {
      id: '1',
      type: 'created',
      title: 'Task created',
      actor: 'System',
      timestamp: new Date(Date.now() - 7 * 24 * 3600000),
      description: 'Initial task creation',
    },
    {
      id: '2',
      type: 'volunteer_assigned',
      title: 'Assigned to Raj Kumar',
      actor: 'Admin',
      timestamp: new Date(Date.now() - 6.9 * 24 * 3600000),
      description: 'Volunteer assignment',
    },
    {
      id: '3',
      type: 'status_changed',
      title: 'Work started',
      actor: 'Raj Kumar',
      timestamp: new Date(Date.now() - 5 * 24 * 3600000),
      description: 'Task moved to IN_PROGRESS',
    },
    {
      id: '4',
      type: 'volunteer_assigned',
      title: 'Volunteer added: Priya Singh',
      actor: 'Admin',
      timestamp: new Date(Date.now() - 3 * 24 * 3600000),
      description: 'Additional volunteer',
    },
    {
      id: '5',
      type: 'severity_changed',
      title: 'Priority updated to CRITICAL',
      actor: 'Coordinator',
      timestamp: new Date(Date.now() - 1 * 24 * 3600000),
      severity: 'critical',
      description: 'Priority elevation',
    },
  ];
};

export default function TaskDetailDrawer({
  taskId,
  title,
  type,
  status,
  urgency,
  location,
  disasterName,
  description,
  assignedVolunteer,
  requiredSkills,
  estimatedHours,
  maxVolunteers,
  currentVolunteers,
  createdAt,
  onClose,
  onAssign,
  onStatusChange,
}: TaskDetailDrawerProps) {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'history'>('overview');
  const statusColor = statusColors[status];
  const urgencyColor = urgencyColors[urgency];
  const typeEmoji = taskTypeEmojis[type] || '📋';
  const activities = generateMockActivity(taskId);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.titleSection}>
            <span style={styles.typeEmoji}>{typeEmoji}</span>
            <div>
              <h2 style={styles.title}>{title}</h2>
              <p style={styles.disasterName}>{disasterName}</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Status badges */}
        <div style={styles.badgeRow}>
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
          <span style={styles.typeBadge}>{type.replace(/_/g, ' ')}</span>
        </div>

        {/* Tab navigation */}
        <div style={styles.tabNav}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              ...styles.tabBtn,
              borderBottomColor: activeTab === 'overview' ? '#3b82f6' : 'transparent',
              color: activeTab === 'overview' ? '#3b82f6' : '#64748b',
            }}
          >
            📋 Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              ...styles.tabBtn,
              borderBottomColor: activeTab === 'history' ? '#3b82f6' : 'transparent',
              color: activeTab === 'history' ? '#3b82f6' : '#64748b',
            }}
          >
            ⏱️ Activity
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {activeTab === 'overview' && (
            <div style={styles.overviewTab}>
              {/* Description */}
              {description && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Description</h3>
                  <p style={styles.description}>{description}</p>
                </div>
              )}

              {/* Location & Time */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Details</h3>
                <div style={styles.detailsList}>
                  <div style={styles.detailItem}>
                    <MapPin size={16} style={{ color: '#64748b' }} />
                    <div>
                      <span style={styles.detailLabel}>Location</span>
                      <span style={styles.detailValue}>{location}</span>
                    </div>
                  </div>
                  {estimatedHours && (
                    <div style={styles.detailItem}>
                      <Clock size={16} style={{ color: '#64748b' }} />
                      <div>
                        <span style={styles.detailLabel}>Est. Duration</span>
                        <span style={styles.detailValue}>{estimatedHours} hours</span>
                      </div>
                    </div>
                  )}
                  {createdAt && (
                    <div style={styles.detailItem}>
                      <Activity size={16} style={{ color: '#64748b' }} />
                      <div>
                        <span style={styles.detailLabel}>Created</span>
                        <span style={styles.detailValue}>
                          {new Date(createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Required Skills */}
              {requiredSkills.length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Required Skills</h3>
                  <div style={styles.skillsList}>
                    {requiredSkills.map((skill) => (
                      <span key={skill} style={styles.skillTag}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Volunteer Assignment */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Volunteers</h3>
                <div style={styles.volunteerSection}>
                  {assignedVolunteer ? (
                    <div style={styles.assignedVolunteerCard}>
                      <span style={styles.volunteerIcon}>👤</span>
                      <div>
                        <span style={styles.volunteerName}>{assignedVolunteer.name}</span>
                        <span style={styles.volunteerStatus}>Assigned</span>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.unassignedCard}>
                      <AlertCircle size={16} style={{ color: '#f97316' }} />
                      <span style={styles.unassignedText}>No volunteer assigned</span>
                    </div>
                  )}

                  {/* Progress bar */}
                  <div style={styles.progressSection}>
                    <div style={styles.progressLabel}>
                      <Users size={14} />
                      <span>
                        {currentVolunteers} / {maxVolunteers} volunteers
                      </span>
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
                </div>
              </div>

              {/* Action Buttons */}
              <div style={styles.actionButtons}>
                {status === 'OPEN' && (
                  <button onClick={() => onAssign?.(taskId)} style={styles.assignBtn}>
                    👥 Assign Volunteer
                  </button>
                )}
                {status === 'ASSIGNED' && (
                  <button
                    onClick={() => onStatusChange?.(taskId, 'IN_PROGRESS')}
                    style={styles.startBtn}
                  >
                    ▶️ Start Work
                  </button>
                )}
                {status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => onStatusChange?.(taskId, 'COMPLETED')}
                    style={styles.completeBtn}
                  >
                    <CheckCircle2 size={14} /> Mark Complete
                  </button>
                )}
                <button style={styles.editBtn}>✏️ Edit Task</button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div style={styles.historyTab}>
              <Timeline events={activities} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add React import for useState
import React from 'react';

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  drawer: {
    background: 'white',
    width: '100%',
    maxWidth: '500px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.15)',
    animation: 'slideIn 0.3s ease-out',
  },
  header: {
    padding: '1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  titleSection: {
    display: 'flex',
    gap: '0.75rem',
    flex: 1,
  },
  typeEmoji: {
    fontSize: '1.75rem',
    marginTop: '0.25rem',
  },
  title: {
    margin: '0 0 0.25rem 0',
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  disasterName: {
    margin: 0,
    fontSize: '0.8125rem',
    color: '#64748b',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    color: '#64748b',
    transition: 'color 0.2s',
  },
  badgeRow: {
    display: 'flex',
    gap: '0.75rem',
    padding: '0 1.5rem',
    flexWrap: 'wrap',
  },
  badge: {
    padding: '0.375rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  typeBadge: {
    background: '#e0f2fe',
    color: '#0369a1',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  tabNav: {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
    padding: '1rem 1.5rem 0',
    gap: '1.5rem',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid',
    padding: '0.75rem 0',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.875rem',
    transition: 'all 0.2s',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem',
  },
  overviewTab: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  historyTab: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  description: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#475569',
    lineHeight: 1.6,
  },
  detailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  detailItem: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
  },
  detailLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 600,
    marginBottom: '0.25rem',
  },
  detailValue: {
    display: 'block',
    fontSize: '0.875rem',
    color: '#1e293b',
    fontWeight: 500,
  },
  skillsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  skillTag: {
    background: '#e0f2fe',
    color: '#0369a1',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  volunteerSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  assignedVolunteerCard: {
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  volunteerIcon: {
    fontSize: '1.5rem',
  },
  volunteerName: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#0369a1',
  },
  volunteerStatus: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#0284c7',
  },
  unassignedCard: {
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  unassignedText: {
    fontSize: '0.875rem',
    color: '#f97316',
    fontWeight: 600,
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  progressLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 600,
  },
  progressBar: {
    height: '0.5rem',
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
    flexDirection: 'column',
    gap: '0.75rem',
  },
  assignBtn: {
    padding: '0.75rem 1rem',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  startBtn: {
    padding: '0.75rem 1rem',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  completeBtn: {
    padding: '0.75rem 1rem',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  editBtn: {
    padding: '0.75rem 1rem',
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '0.5rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
