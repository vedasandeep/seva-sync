import { useState, useCallback, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface TaskFilterBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: {
    status?: string[];
    urgency?: string[];
    type?: string[];
    disasterId?: string;
  }) => void;
  onSortChange: (sort: string) => void;
  activeFilterCount?: number;
  disasters?: Array<{ id: string; name: string }>;
}

export default function TaskFilterBar({
  onSearch,
  onFilterChange,
  onSortChange,
  activeFilterCount = 0,
  disasters = [],
}: TaskFilterBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedUrgencies, setSelectedUrgencies] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDisaster, setSelectedDisaster] = useState<string>('');
  const [sortBy, setSortBy] = useState('newest');
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Debounced search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      onSearch(value);
    }, 300);
  };

  // Handle filter changes
  const toggleStatus = useCallback((status: string) => {
    const updated = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];
    setSelectedStatuses(updated);
    onFilterChange({
      status: updated.length > 0 ? updated : undefined,
      urgency: selectedUrgencies.length > 0 ? selectedUrgencies : undefined,
      type: selectedTypes.length > 0 ? selectedTypes : undefined,
      disasterId: selectedDisaster || undefined,
    });
  }, [selectedStatuses, selectedUrgencies, selectedTypes, selectedDisaster, onFilterChange]);

  const toggleUrgency = useCallback((urgency: string) => {
    const updated = selectedUrgencies.includes(urgency)
      ? selectedUrgencies.filter((u) => u !== urgency)
      : [...selectedUrgencies, urgency];
    setSelectedUrgencies(updated);
    onFilterChange({
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      urgency: updated.length > 0 ? updated : undefined,
      type: selectedTypes.length > 0 ? selectedTypes : undefined,
      disasterId: selectedDisaster || undefined,
    });
  }, [selectedStatuses, selectedUrgencies, selectedTypes, selectedDisaster, onFilterChange]);

  const toggleType = useCallback((type: string) => {
    const updated = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(updated);
    onFilterChange({
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      urgency: selectedUrgencies.length > 0 ? selectedUrgencies : undefined,
      type: updated.length > 0 ? updated : undefined,
      disasterId: selectedDisaster || undefined,
    });
  }, [selectedStatuses, selectedUrgencies, selectedTypes, selectedDisaster, onFilterChange]);

  const handleDisasterChange = (id: string) => {
    setSelectedDisaster(id);
    onFilterChange({
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      urgency: selectedUrgencies.length > 0 ? selectedUrgencies : undefined,
      type: selectedTypes.length > 0 ? selectedTypes : undefined,
      disasterId: id || undefined,
    });
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    onSortChange(newSort);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedStatuses([]);
    setSelectedUrgencies([]);
    setSelectedTypes([]);
    setSelectedDisaster('');
    setSortBy('newest');
    onSearch('');
    onFilterChange({});
    onSortChange('newest');
  };

  return (
    <div style={styles.container}>
      {/* Search Bar */}
      <div style={styles.searchWrapper}>
        <input
          type="text"
          placeholder="🔍 Search tasks by title or description..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={styles.searchInput}
        />
      </div>

      {/* Controls Row */}
      <div style={styles.controlsRow}>
        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            ...styles.filterBtn,
            background: showFilters ? '#3b82f6' : '#f1f5f9',
            color: showFilters ? 'white' : '#1e293b',
            border: showFilters ? '1px solid #3b82f6' : '1px solid #e2e8f0',
          }}
        >
          <span>⚙️ Filters</span>
          {activeFilterCount > 0 && (
            <span style={styles.badge}>{activeFilterCount}</span>
          )}
          <ChevronDown size={16} />
        </button>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value)}
          style={styles.sortSelect}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="critical">Critical First</option>
          <option value="assigned">Assigned First</option>
          <option value="completed">Completed First</option>
        </select>

        {/* Clear Filters Button */}
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} style={styles.clearBtn}>
            <X size={16} /> Clear
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div style={styles.filterPanel}>
          {/* Status Filter */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Status</label>
            <div style={styles.checkboxGroup}>
              {['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(
                (status) => (
                  <label key={status} style={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(status)}
                      onChange={() => toggleStatus(status)}
                      style={styles.checkboxInput}
                    />
                    <span>{status}</span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Urgency Filter */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Urgency</label>
            <div style={styles.checkboxGroup}>
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((urgency) => (
                <label key={urgency} style={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={selectedUrgencies.includes(urgency)}
                    onChange={() => toggleUrgency(urgency)}
                    style={styles.checkboxInput}
                  />
                  <span>{urgency}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Task Type</label>
            <div style={styles.checkboxGroup}>
              {[
                'RESCUE',
                'MEDICAL',
                'FOOD_DISTRIBUTION',
                'SHELTER',
                'LOGISTICS',
                'COMMUNICATION',
                'TRANSPORT',
                'SUPPLY_COLLECTION',
                'SAFETY',
              ].map((type) => (
                <label key={type} style={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => toggleType(type)}
                    style={styles.checkboxInput}
                  />
                  <span>{type.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Disaster Filter */}
          {disasters.length > 0 && (
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Disaster</label>
              <select
                value={selectedDisaster}
                onChange={(e) => handleDisasterChange(e.target.value)}
                style={styles.selectFilter}
              >
                <option value="">All Disasters</option>
                {disasters.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'white',
    borderRadius: '0.75rem',
    padding: '1rem',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  searchWrapper: {
    marginBottom: '1rem',
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
  },
  controlsRow: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  filterBtn: {
    padding: '0.625rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
  },
  badge: {
    background: '#ef4444',
    color: 'white',
    borderRadius: '1rem',
    padding: '0.125rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    marginLeft: '0.25rem',
  },
  sortSelect: {
    padding: '0.625rem 0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  clearBtn: {
    padding: '0.625rem 1rem',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#64748b',
  },
  filterPanel: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  filterLabel: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: '#475569',
    cursor: 'pointer',
  },
  checkboxInput: {
    cursor: 'pointer',
  },
  selectFilter: {
    padding: '0.5rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    fontSize: '0.8125rem',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
};
