import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BurnoutScoreIndicator from '../features/volunteers/components/BurnoutScoreIndicator';
import WorkloadSummary from '../features/volunteers/components/WorkloadSummary';
import SkillMatrix from '../features/volunteers/components/SkillMatrix';
import ActivityTimeline, { TimelineEvent } from '../features/volunteers/components/ActivityTimeline';
import mockData from '../lib/mockData';

interface VolunteerDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  location?: string;
  primarySkill?: string;
  availability: 'available' | 'on_break' | 'unavailable';
  burnoutScore: number;
  burnoutTrend?: 'improving' | 'stable' | 'declining';
  currentWorkload: number;
  maxWorkload: number;
  lastWellnessCheckinDate?: string;
  skills: Array<{
    category: string;
    name: string;
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    endorsements?: number;
    verified?: boolean;
  }>;
  assignedTasks: Array<{
    id: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed';
    dueDate?: string;
    disasterName?: string;
  }>;
  wellnessHistory: Array<{
    date: string;
    feeling: number;
    score: number;
    note?: string;
  }>;
  activityEvents: TimelineEvent[];
  notes?: string;
  joinedDate?: string;
  deploymentsCount: number;
}

type TabType = 'overview' | 'tasks' | 'wellness' | 'activity' | 'notes';

export default function VolunteerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [volunteer, setVolunteer] = useState<VolunteerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Load volunteer data
  useEffect(() => {
    const loadVolunteer = async () => {
      try {
        setIsLoading(true);
        // Mock data load (will be replaced with API call)
        const suggestion = mockData.MOCK_VOLUNTEER_SUGGESTIONS.find((s) => s.volunteerId === id);
        if (suggestion) {
          const mockVol = suggestion.volunteer;
          setVolunteer({
            id: suggestion.volunteerId,
            firstName: mockVol.name.split(' ')[0],
            lastName: mockVol.name.split(' ')[1] || '',
            email: `${mockVol.name.toLowerCase().replace(/ /g, '.')}@example.com`,
            phone: undefined,
            avatar: mockVol.avatar,
            location: 'India',
            primarySkill: mockVol.skills[0],
            availability: mockVol.isAvailable ? 'available' : 'unavailable',
            burnoutScore: mockVol.burnoutScore,
            burnoutTrend: 'stable',
            currentWorkload: mockVol.currentActiveTasks,
            maxWorkload: 10,
            lastWellnessCheckinDate: new Date().toISOString(),
            skills: mockVol.skills.map((skill) => ({
              category: 'General',
              name: skill,
              proficiency: 'advanced' as const,
              endorsements: Math.floor(Math.random() * 20),
              verified: Math.random() > 0.5,
            })),
            assignedTasks: [],
            wellnessHistory: [],
            activityEvents: [],
            notes: '',
            joinedDate: new Date().toISOString(),
            deploymentsCount: 3,
          });
        } else {
          navigate('/volunteers');
        }
      } catch (error) {
        console.error('Failed to load volunteer:', error);
        navigate('/volunteers');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadVolunteer();
    }
  }, [id, navigate]);

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner} />
        <p>Loading volunteer details...</p>
      </div>
    );
  }

  if (!volunteer) {
    return (
      <div style={styles.errorContainer}>
        <p>Volunteer not found</p>
      </div>
    );
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return '#10b981';
      case 'on_break':
        return '#f59e0b';
      case 'unavailable':
        return '#ef4444';
      default:
        return '#64748b';
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/volunteers')}>
          ← Back
        </button>

        <div style={styles.headerContent}>
          <div style={styles.volunteerInfo}>
            {volunteer.avatar ? (
              <img
                src={volunteer.avatar}
                alt={`${volunteer.firstName} ${volunteer.lastName}`}
                style={styles.avatar}
              />
            ) : (
              <div style={styles.avatarPlaceholder}>
                {volunteer.firstName[0]}
                {volunteer.lastName[0]}
              </div>
            )}

            <div>
              <h1 style={styles.name}>
                {volunteer.firstName} {volunteer.lastName}
              </h1>
              <p style={styles.email}>{volunteer.email}</p>
              {volunteer.location && (
                <p style={styles.location}>📍 {volunteer.location}</p>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div style={styles.statusBadge}>
            <div
              style={{
                ...styles.statusDot,
                backgroundColor: getAvailabilityColor(volunteer.availability),
              }}
            />
            <span>{volunteer.availability === 'available' ? '✓ Available' : volunteer.availability === 'on_break' ? '☕ On Break' : '✕ Unavailable'}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={styles.quickStats}>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>Burnout Score</div>
          <div
            style={{
              ...styles.statValue,
              color: volunteer.burnoutScore <= 25 ? '#10b981' : volunteer.burnoutScore <= 50 ? '#f59e0b' : volunteer.burnoutScore <= 75 ? '#f97316' : '#ef4444',
            }}
          >
            {volunteer.burnoutScore.toFixed(1)}/100
          </div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>Workload</div>
          <div style={styles.statValue}>
            {volunteer.currentWorkload}/{volunteer.maxWorkload}
          </div>
        </div>
        <div style={styles.statBox}>
          <div style={styles.statLabel}>Deployments</div>
          <div style={styles.statValue}>{volunteer.deploymentsCount}</div>
        </div>
        {volunteer.primarySkill && (
          <div style={styles.statBox}>
            <div style={styles.statLabel}>Primary Skill</div>
            <div style={styles.statValue}>{volunteer.primarySkill}</div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabNav}>
        {(['overview', 'tasks', 'wellness', 'activity', 'notes'] as TabType[]).map(
          (tab) => (
            <button
              key={tab}
              style={{
                ...styles.tabButton,
                backgroundColor: activeTab === tab ? '#3b82f6' : 'transparent',
                color: activeTab === tab ? 'white' : '#64748b',
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && '👁️ Overview'}
              {tab === 'tasks' && '📋 Tasks'}
              {tab === 'wellness' && '💚 Wellness'}
              {tab === 'activity' && '📊 Activity'}
              {tab === 'notes' && '📝 Notes'}
            </button>
          )
        )}
      </div>

      {/* Tab Content */}
      <div style={styles.tabContent}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={styles.tabPane}>
            <div style={styles.twoColumnLayout}>
              <div>
                <BurnoutScoreIndicator
                  score={volunteer.burnoutScore}
                  trend={volunteer.burnoutTrend}
                  lastCheckinDate={volunteer.lastWellnessCheckinDate}
                />
              </div>
              <div>
                <WorkloadSummary
                  currentWorkload={volunteer.currentWorkload}
                  maxWorkload={volunteer.maxWorkload}
                  assignedTasks={volunteer.assignedTasks}
                />
              </div>
            </div>

            <div style={styles.sectionDivider} />

            <div>
              <SkillMatrix skills={volunteer.skills} isMobile={isMobile} />
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div style={styles.tabPane}>
            <WorkloadSummary
              currentWorkload={volunteer.currentWorkload}
              maxWorkload={volunteer.maxWorkload}
              assignedTasks={volunteer.assignedTasks}
            />
          </div>
        )}

        {/* Wellness Tab */}
        {activeTab === 'wellness' && (
          <div style={styles.tabPane}>
            <div style={styles.wellnessContainer}>
              <h3 style={styles.sectionTitle}>Wellness Check-in History</h3>
              {volunteer.wellnessHistory.length === 0 ? (
                <div style={styles.emptyState}>
                  <p>No wellness check-ins yet</p>
                  <button style={styles.primaryButton}>+ New Check-in</button>
                </div>
              ) : (
                <div style={styles.wellnessHistoryList}>
                  {volunteer.wellnessHistory.map((entry, index) => (
                    <div key={index} style={styles.wellnessEntry}>
                      <div>{new Date(entry.date).toLocaleDateString()}</div>
                      <div>Score: {entry.score}/10</div>
                      {entry.note && <div>{entry.note}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div style={styles.tabPane}>
            <ActivityTimeline
              events={volunteer.activityEvents.length > 0 ? volunteer.activityEvents : []}
            />
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div style={styles.tabPane}>
            <div style={styles.notesContainer}>
              <h3 style={styles.sectionTitle}>Coordinator Notes</h3>
              <textarea
                style={styles.notesArea}
                placeholder="Add notes about this volunteer..."
                defaultValue={volunteer.notes}
              />
              <button style={styles.primaryButton}>Save Notes</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '2rem',
  },
  backButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    minHeight: '40px',
  },
  headerContent: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '2rem',
  },
  volunteerInfo: {
    display: 'flex',
    gap: '1rem',
    flex: 1,
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,
  },
  avatarPlaceholder: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '1.25rem',
    flexShrink: 0,
  },
  name: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  email: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  location: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  statusDot: {
    width: '0.75rem',
    height: '0.75rem',
    borderRadius: '50%',
  },
  quickStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
  },
  statBox: {
    padding: '1rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  tabNav: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '2px solid #e2e8f0',
    overflow: 'auto',
  },
  tabButton: {
    padding: '0.75rem 1rem',
    border: 'none',
    borderRadius: '0.375rem 0.375rem 0 0',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  tabContent: {
    flex: 1,
  },
  tabPane: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  twoColumnLayout: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  sectionDivider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '1rem 0',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  wellnessContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  wellnessHistoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  wellnessEntry: {
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
  },
  notesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  notesArea: {
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    fontFamily: 'inherit',
    fontSize: '0.875rem',
    minHeight: '200px',
    resize: 'vertical',
  },
  primaryButton: {
    padding: '0.625rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    minHeight: '40px',
    alignSelf: 'flex-start',
  },
  emptyState: {
    padding: '2rem 1rem',
    textAlign: 'center',
    color: '#94a3b8',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    minHeight: '400px',
  },
  loadingSpinner: {
    width: '2.5rem',
    height: '2.5rem',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorContainer: {
    padding: '2rem',
    textAlign: 'center',
    color: '#ef4444',
  },
};
