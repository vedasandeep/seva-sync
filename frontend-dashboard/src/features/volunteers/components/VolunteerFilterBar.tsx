import { useState, useCallback } from 'react';

export interface VolunteerFilters {
  search?: string;
  availability?: 'available' | 'unavailable';
  burnoutLevel?: 'low' | 'moderate' | 'high' | 'critical';
  skillCategory?: string;
  disasterId?: string;
  sort?: 'workload' | 'burnout' | 'activity' | 'newest';
}

interface VolunteerFilterBarProps {
  onFiltersChange: (filters: VolunteerFilters) => void;
  disasters?: Array<{ id: string; name: string }>;
  skillCategories?: string[];
  isMobile?: boolean;
}

export default function VolunteerFilterBar({
  onFiltersChange,
  disasters = [],
  skillCategories = [
    'Medical',
    'Rescue',
    'Shelter',
    'Food Distribution',
    'Logistics',
    'Communication',
    'Transport',
    'Child Care',
  ],
  isMobile = false,
}: VolunteerFilterBarProps) {
  const [filters, setFilters] = useState<VolunteerFilters>({});
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleSearchChange = useCallback(
    (query: string) => {
      const newFilters = { ...filters, search: query || undefined };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  const handleFilterChange = useCallback(
    (key: keyof VolunteerFilters, value: any) => {
      const newFilters = { ...filters, [key]: value || undefined };
      setFilters(newFilters);
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  const handleReset = useCallback(() => {
    setFilters({});
    onFiltersChange({});
  }, [onFiltersChange]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const filterContent = (
    <div style={styles.filterContent}>
      {/* Search */}
      <div style={styles.filterGroup}>
        <label style={styles.label}>Search</label>
        <input
          type="text"
          placeholder="Name, skill, or location"
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          style={styles.input}
        />
      </div>

      {/* Availability */}
      <div style={styles.filterGroup}>
        <label style={styles.label}>Availability</label>
        <div style={styles.radioGroup}>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="availability"
              value="available"
              checked={filters.availability === 'available'}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
            />
            Available
          </label>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="availability"
              value="unavailable"
              checked={filters.availability === 'unavailable'}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
            />
            Unavailable
          </label>
        </div>
      </div>

      {/* Burnout Risk */}
      <div style={styles.filterGroup}>
        <label style={styles.label}>Burnout Risk</label>
        <select
          value={filters.burnoutLevel || ''}
          onChange={(e) => handleFilterChange('burnoutLevel', e.target.value)}
          style={styles.select}
        >
          <option value="">All levels</option>
          <option value="low">Low</option>
          <option value="moderate">Moderate</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Skill Category */}
      <div style={styles.filterGroup}>
        <label style={styles.label}>Skill Category</label>
        <select
          value={filters.skillCategory || ''}
          onChange={(e) => handleFilterChange('skillCategory', e.target.value)}
          style={styles.select}
        >
          <option value="">All categories</option>
          {skillCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Active Disaster */}
      <div style={styles.filterGroup}>
        <label style={styles.label}>Active Disaster</label>
        <select
          value={filters.disasterId || ''}
          onChange={(e) => handleFilterChange('disasterId', e.target.value)}
          style={styles.select}
        >
          <option value="">All disasters</option>
          {disasters.map((disaster) => (
            <option key={disaster.id} value={disaster.id}>
              {disaster.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div style={styles.filterGroup}>
        <label style={styles.label}>Sort By</label>
        <select
          value={filters.sort || 'newest'}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          style={styles.select}
        >
          <option value="newest">Newest</option>
          <option value="workload">Workload (High to Low)</option>
          <option value="burnout">Burnout Score</option>
          <option value="activity">Recent Activity</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div style={styles.filterActions}>
        <button onClick={handleReset} style={styles.resetBtn}>
          Reset
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Desktop: Inline filters */}
      {!isMobile && <div style={styles.desktopFilters}>{filterContent}</div>}

      {/* Mobile: Collapsible filter drawer */}
      {isMobile && (
        <div style={styles.mobileContainer}>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            style={styles.filterToggleBtn}
          >
            🔍 Filters {activeFilterCount > 0 && <span style={styles.badge}>{activeFilterCount}</span>}
          </button>

          {showMobileFilters && (
            <div style={styles.mobileFilterDrawer}>
              {filterContent}
            </div>
          )}
        </div>
      )}

      {/* Active Filter Count Badge */}
      {activeFilterCount > 0 && !isMobile && (
        <div style={styles.activeFiltersInfo}>
          {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '0.375rem',
    marginBottom: '1.5rem',
    border: '1px solid #e2e8f0',
  },
  desktopFilters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  filterContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  mobileContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  filterToggleBtn: {
    padding: '0.625rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    minHeight: '44px',
  },
  mobileFilterDrawer: {
    padding: '1rem',
    backgroundColor: 'white',
    borderRadius: '0.375rem',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#475569',
  },
  input: {
    padding: '0.625rem 0.75rem',
    border: '1px solid #cbd5e1',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
  },
  select: {
    padding: '0.625rem 0.75rem',
    border: '1px solid #cbd5e1',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    backgroundColor: 'white',
  },
  radioGroup: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  filterActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  resetBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    minHeight: '40px',
  },
  badge: {
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '9999px',
    padding: '0.125rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: 700,
    marginLeft: '0.25rem',
  },
  activeFiltersInfo: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '0.5rem',
  },
};
