import { useMemo } from 'react';
import VolunteerCard, { VolunteerCardData } from './VolunteerCard';
import { VolunteerFilters } from './VolunteerFilterBar';

interface VolunteerListViewProps {
  volunteers: VolunteerCardData[];
  filters: VolunteerFilters;
  onSelectVolunteer: (id: string) => void;
  onAction: (action: string, id: string) => void;
  isLoading?: boolean;
  isMobile?: boolean;
}

const applyFilters = (
  volunteers: VolunteerCardData[],
  filters: VolunteerFilters
): VolunteerCardData[] => {
  return volunteers.filter((volunteer) => {
    // Search filter
    if (filters.search) {
      const query = filters.search.toLowerCase();
      const matchesSearch =
        volunteer.firstName.toLowerCase().includes(query) ||
        volunteer.lastName.toLowerCase().includes(query) ||
        volunteer.email.toLowerCase().includes(query) ||
        (volunteer.primarySkill?.toLowerCase().includes(query) || false) ||
        (volunteer.location?.toLowerCase().includes(query) || false);

      if (!matchesSearch) return false;
    }

    // Availability filter
    if (filters.availability && volunteer.availability !== filters.availability) {
      return false;
    }

    // Burnout level filter
    if (filters.burnoutLevel) {
      const score = volunteer.burnoutScore;
      let inRange = false;

      if (filters.burnoutLevel === 'low' && score <= 25) inRange = true;
      else if (filters.burnoutLevel === 'moderate' && score > 25 && score <= 50)
        inRange = true;
      else if (filters.burnoutLevel === 'high' && score > 50 && score <= 75)
        inRange = true;
      else if (filters.burnoutLevel === 'critical' && score > 75) inRange = true;

      if (!inRange) return false;
    }

    // Skill category filter
    if (
      filters.skillCategory &&
      volunteer.primarySkill !== filters.skillCategory
    ) {
      return false;
    }

    return true;
  });
};

const applySorting = (
  volunteers: VolunteerCardData[],
  sortBy?: string
): VolunteerCardData[] => {
  const sorted = [...volunteers];

  switch (sortBy) {
    case 'workload':
      return sorted.sort((a, b) => b.currentWorkload - a.currentWorkload);

    case 'burnout':
      return sorted.sort((a, b) => b.burnoutScore - a.burnoutScore);

    case 'activity':
      return sorted.sort(
        (a, b) =>
          (b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0) -
          (a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0)
      );

    case 'newest':
    default:
      return sorted;
  }
};

export default function VolunteerListView({
  volunteers,
  filters,
  onSelectVolunteer,
  onAction,
  isLoading = false,
  isMobile = false,
}: VolunteerListViewProps) {
  const filteredAndSorted = useMemo(() => {
    let result = applyFilters(volunteers, filters);
    result = applySorting(result, filters.sort);
    return result;
  }, [volunteers, filters]);

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner} />
        <p style={styles.loadingText}>Loading volunteers...</p>
      </div>
    );
  }

  if (filteredAndSorted.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyIcon}>🔍</div>
        <h3 style={styles.emptyTitle}>No volunteers found</h3>
        <p style={styles.emptyText}>
          Try adjusting your filters or search criteria.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        ...styles.listContainer,
        ...(isMobile && styles.mobileListContainer),
      }}
    >
      {/* Result Count */}
      <div style={styles.resultInfo}>
        Showing <strong>{filteredAndSorted.length}</strong> volunteer
        {filteredAndSorted.length !== 1 ? 's' : ''}
      </div>

      {/* List Grid */}
      <div style={styles.cardsGrid}>
        {filteredAndSorted.map((volunteer) => (
          <VolunteerCard
            key={volunteer.id}
            volunteer={volunteer}
            onSelect={onSelectVolunteer}
            onAction={onAction}
            isMobile={isMobile}
          />
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  listContainer: {
    width: '100%',
  },
  mobileListContainer: {
    width: '100%',
  },
  resultInfo: {
    fontSize: '0.875rem',
    color: '#64748b',
    marginBottom: '1rem',
    padding: '0 1rem',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1rem',
    padding: '0 1rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1rem',
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
  loadingText: {
    marginTop: '1rem',
    color: '#64748b',
    fontSize: '0.875rem',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1rem',
    minHeight: '400px',
    color: '#94a3b8',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#475569',
  },
  emptyText: {
    margin: '0.5rem 0 0 0',
    fontSize: '0.875rem',
    color: '#94a3b8',
  },
};
