import { X, Users, MapPin, Zap, AlertCircle } from 'lucide-react';
import { MOCK_VOLUNTEER_SUGGESTIONS } from '../../lib/mockData';

interface VolunteerSuggestionsModalProps {
  taskTitle: string;
  requiredSkills: string[];
  onClose: () => void;
  onAssign?: (volunteerId: string, volunteerName: string) => void;
}

export default function VolunteerSuggestionsModal({
  taskTitle,
  requiredSkills,
  onClose,
  onAssign,
}: VolunteerSuggestionsModalProps) {
  const suggestions = MOCK_VOLUNTEER_SUGGESTIONS.slice(0, 5);

  const getScoreColor = (score: number) => {
    if (score >= 85) return { bg: '#dcfce7', text: '#166534' }; // Green - Excellent
    if (score >= 70) return { bg: '#fef3c7', text: '#92400e' }; // Yellow - Good
    if (score >= 55) return { bg: '#fed7aa', text: '#9a3412' }; // Orange - Fair
    return { bg: '#fee2e2', text: '#991b1b' }; // Red - Poor
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent Match';
    if (score >= 70) return 'Good Match';
    if (score >= 55) return 'Fair Match';
    return 'Poor Match';
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Assign Volunteer</h2>
            <p style={styles.subtitle}>{taskTitle}</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        {/* Required skills */}
        {requiredSkills.length > 0 && (
          <div style={styles.skillsSection}>
            <span style={styles.skillsLabel}>Required Skills:</span>
            <div style={styles.skillsList}>
              {requiredSkills.map((skill) => (
                <span key={skill} style={styles.skillTag}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions list */}
        <div style={styles.suggestionsContainer}>
          {suggestions.length === 0 ? (
            <div style={styles.emptyState}>
              <AlertCircle size={32} style={{ color: '#f97316' }} />
              <p style={styles.emptyText}>No matching volunteers found</p>
            </div>
          ) : (
            suggestions.map((suggestion, index) => {
              const scoreColor = getScoreColor(suggestion.scoreBreakdown.finalScore);

              return (
                <div
                  key={suggestion.volunteerId}
                  style={{
                    ...styles.volunteerCard,
                    borderLeft: `4px solid ${scoreColor.bg}`,
                  }}
                >
                  {/* Ranking badge */}
                  <div style={styles.rankingBadge}>
                    #{index + 1}
                  </div>

                  {/* Volunteer info */}
                  <div style={styles.volunteerInfo}>
                    <div style={styles.nameRow}>
                      <span style={styles.volunteerAvatar}>
                        {suggestion.volunteer.avatar}
                      </span>
                      <div>
                        <h4 style={styles.volunteerName}>
                          {suggestion.volunteer.name}
                        </h4>
                        <span style={styles.volunteerStatus}>
                          {suggestion.volunteer.isAvailable ? '🟢 Available' : '🔴 Busy'}
                        </span>
                      </div>
                    </div>

                    {/* Skills match */}
                    <div style={styles.skillsMatch}>
                      <span style={styles.matchLabel}>Skills:</span>
                      <div style={styles.matchSkills}>
                        {suggestion.volunteer.skills.slice(0, 2).map((skill) => (
                          <span key={skill} style={styles.matchSkillTag}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Score breakdown */}
                    <div style={styles.scoreSection}>
                      <div style={styles.scoreBreakdownRow}>
                        <div style={styles.scoreItem}>
                          <span style={styles.scoreItemLabel}>Skill Match</span>
                          <span style={styles.scoreItemValue}>
                            {suggestion.scoreBreakdown.skillMatch}%
                          </span>
                        </div>
                        <div style={styles.scoreItem}>
                          <span style={styles.scoreItemLabel}>Distance</span>
                          <span style={styles.scoreItemValue}>
                            {suggestion.scoreBreakdown.distanceScore}%
                          </span>
                        </div>
                        <div style={styles.scoreItem}>
                          <span style={styles.scoreItemLabel}>Availability</span>
                          <span style={styles.scoreItemValue}>
                            {suggestion.scoreBreakdown.availabilityScore}%
                          </span>
                        </div>
                      </div>

                      <div style={styles.scoreBreakdownRow}>
                        <div style={styles.scoreItem}>
                          <span style={styles.scoreItemLabel}>Burnout Risk</span>
                          <span style={styles.scoreItemValue}>
                            {suggestion.scoreBreakdown.burnoutScore}%
                          </span>
                        </div>
                        <div style={styles.scoreItem}>
                          <span style={styles.scoreItemLabel}>Workload</span>
                          <span style={styles.scoreItemValue}>
                            {suggestion.scoreBreakdown.workloadScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Volunteer details */}
                    <div style={styles.volunteerDetails}>
                      {suggestion.volunteer.currentActiveTasks > 0 && (
                        <div style={styles.detailItem}>
                          <Users size={14} />
                          <span>{suggestion.volunteer.currentActiveTasks} active tasks</span>
                        </div>
                      )}
                      {suggestion.volunteer.currentLocation && (
                        <div style={styles.detailItem}>
                          <MapPin size={14} />
                          <span>Near task location</span>
                        </div>
                      )}
                      <div style={styles.detailItem}>
                        <Zap size={14} />
                        <span>Burnout: {suggestion.volunteer.burnoutScore}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Final score */}
                  <div style={styles.scoreCard}>
                    <div
                      style={{
                        ...styles.finalScore,
                        background: scoreColor.bg,
                        color: scoreColor.text,
                      }}
                    >
                      <span style={styles.scoreValue}>
                        {suggestion.scoreBreakdown.finalScore}
                      </span>
                      <span style={styles.scoreMax}>/ 100</span>
                    </div>
                    <span
                      style={{
                        ...styles.scoreLabel,
                        color: scoreColor.text,
                      }}
                    >
                      {getScoreLabel(suggestion.scoreBreakdown.finalScore)}
                    </span>
                  </div>

                  {/* Assign button */}
                  <button
                    onClick={() => {
                      onAssign?.(
                        suggestion.volunteer.id,
                        suggestion.volunteer.name
                      );
                      onClose();
                    }}
                    style={styles.assignBtn}
                  >
                    ✓ Assign
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Volunteers are ranked by skill match (50%), distance (20%), availability (15%),
            burnout risk (10%), and workload (5%)
          </p>
          <button onClick={onClose} style={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 900,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  },
  modal: {
    background: 'white',
    borderRadius: '0.75rem',
    width: '100%',
    maxWidth: '700px',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
  },
  header: {
    padding: '1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    margin: '0 0 0.25rem 0',
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  subtitle: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#64748b',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    color: '#64748b',
  },
  skillsSection: {
    padding: '0 1.5rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    borderBottom: '1px solid #f1f5f9',
  },
  skillsLabel: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: '#475569',
  },
  skillsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  skillTag: {
    background: '#e0f2fe',
    color: '#0369a1',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  suggestionsContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1rem',
    color: '#94a3b8',
  },
  emptyText: {
    margin: '0.75rem 0 0 0',
    fontSize: '0.875rem',
  },
  volunteerCard: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    padding: '1rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
    position: 'relative',
  },
  rankingBadge: {
    background: '#1e40af',
    color: 'white',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.875rem',
    flexShrink: 0,
  },
  volunteerInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  volunteerAvatar: {
    fontSize: '1.5rem',
    marginTop: '0.125rem',
  },
  volunteerName: {
    margin: '0 0 0.125rem 0',
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  volunteerStatus: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  skillsMatch: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  matchLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#64748b',
  },
  matchSkills: {
    display: 'flex',
    gap: '0.375rem',
  },
  matchSkillTag: {
    background: '#dbeafe',
    color: '#0284c7',
    padding: '0.25rem 0.375rem',
    borderRadius: '0.25rem',
    fontSize: '0.7rem',
    fontWeight: 500,
  },
  scoreSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  scoreBreakdownRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.375rem',
  },
  scoreItem: {
    background: 'white',
    padding: '0.375rem 0.5rem',
    borderRadius: '0.25rem',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  scoreItemLabel: {
    fontSize: '0.7rem',
    color: '#94a3b8',
    fontWeight: 500,
  },
  scoreItemValue: {
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  volunteerDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.75rem',
    color: '#475569',
  },
  scoreCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.75rem',
    background: 'white',
    borderRadius: '0.375rem',
    minWidth: '70px',
  },
  finalScore: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.125rem',
    fontWeight: 700,
  },
  scoreValue: {
    fontSize: '1.5rem',
  },
  scoreMax: {
    fontSize: '0.75rem',
  },
  scoreLabel: {
    fontSize: '0.7rem',
    fontWeight: 600,
  },
  assignBtn: {
    padding: '0.75rem 1.25rem',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.8125rem',
    transition: 'all 0.2s',
  },
  footer: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid #e2e8f0',
    background: '#f8fafc',
    borderBottomLeftRadius: '0.75rem',
    borderBottomRightRadius: '0.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  footerText: {
    margin: 0,
    fontSize: '0.75rem',
    color: '#64748b',
    flex: 1,
  },
  cancelBtn: {
    padding: '0.5rem 1rem',
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.8125rem',
  },
};
