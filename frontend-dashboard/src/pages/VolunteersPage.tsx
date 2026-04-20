import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import VolunteerFilterBar, { VolunteerFilters } from '../features/volunteers/components/VolunteerFilterBar';
import VolunteerListView from '../features/volunteers/components/VolunteerListView';
import { VolunteerCardData } from '../features/volunteers/components/VolunteerCard';
import mockData from '../lib/mockData';

interface Volunteer {
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

const mapVolunteerToCard = (volunteer: Volunteer): VolunteerCardData => ({
  id: volunteer.id,
  firstName: volunteer.firstName,
  lastName: volunteer.lastName,
  email: volunteer.email,
  phone: volunteer.phone,
  avatar: volunteer.avatar,
  primarySkill: volunteer.primarySkill,
  burnoutScore: volunteer.burnoutScore,
  currentWorkload: volunteer.currentWorkload,
  maxWorkload: volunteer.maxWorkload,
  availability: volunteer.availability,
  lastActiveAt: volunteer.lastActiveAt,
  disasterCount: volunteer.disasterCount,
  location: volunteer.location,
});

export default function VolunteersPage() {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState<VolunteerCardData[]>([]);
  const [filters, setFilters] = useState<VolunteerFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Load volunteers on mount
  useEffect(() => {
    const loadVolunteers = async () => {
      try {
        setIsLoading(true);
        // Use mock data for now (will be replaced with API call)
        const volunteers = mockData.MOCK_VOLUNTEER_SUGGESTIONS.map((suggestion) => ({
          id: suggestion.volunteerId,
          firstName: suggestion.volunteer.name.split(' ')[0],
          lastName: suggestion.volunteer.name.split(' ')[1] || '',
          email: `${suggestion.volunteer.name.toLowerCase().replace(/ /g, '.')}@example.com`,
          phone: undefined,
          avatar: suggestion.volunteer.avatar,
          primarySkill: suggestion.volunteer.skills[0],
          burnoutScore: suggestion.volunteer.burnoutScore,
          currentWorkload: suggestion.volunteer.currentActiveTasks,
          maxWorkload: 10,
          availability: (suggestion.volunteer.isAvailable ? 'available' : 'unavailable') as 'available' | 'unavailable',
          lastActiveAt: new Date().toISOString(),
          disasterCount: 3,
          location: 'India',
          tasks: [],
          skills: [],
        }));
        const data = volunteers.map(mapVolunteerToCard);
        setVolunteers(data);
      } catch (error) {
        console.error('Failed to load volunteers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVolunteers();
  }, []);

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectVolunteer = useCallback(
    (id: string) => {
      navigate(`/volunteers/${id}`);
    },
    [navigate]
  );

  const handleAction = useCallback(
    (action: string, id: string) => {
      switch (action) {
        case 'view_details':
          navigate(`/volunteers/${id}`);
          break;
        case 'wellness_checkin':
          // Open wellness check-in modal
          console.log('Wellness check-in for:', id);
          break;
        case 'message':
          // Open messaging interface
          console.log('Message:', id);
          break;
        case 'reassign_tasks':
          // Open task reassignment modal
          console.log('Reassign tasks for:', id);
          break;
        default:
          break;
      }
    },
    [navigate]
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Volunteers</h1>
          <p style={styles.subtitle}>Manage your volunteer team and monitor wellness</p>
        </div>
      </div>

      {/* Filter Bar */}
      <VolunteerFilterBar
        onFiltersChange={setFilters}
        isMobile={isMobile}
      />

      {/* List View */}
      <VolunteerListView
        volunteers={volunteers}
        filters={filters}
        onSelectVolunteer={handleSelectVolunteer}
        onAction={handleAction}
        isLoading={isLoading}
        isMobile={isMobile}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '2rem',
    height: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    margin: 0,
    fontSize: '1.875rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  subtitle: {
    margin: '0.5rem 0 0 0',
    fontSize: '0.875rem',
    color: '#64748b',
  },
};
