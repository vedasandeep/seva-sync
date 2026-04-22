import React from 'react';
import { Search, X } from 'lucide-react';

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  roleFilter: string | 'all';
  onRoleChange: (role: string) => void;
  statusFilter: string | 'all';
  onStatusChange: (status: string) => void;
  onReset?: () => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
  onReset,
}) => {
  const hasActiveFilters = searchTerm || roleFilter !== 'all' || statusFilter !== 'all';

  return (
    <div style={styles.container}>
      <div style={styles.searchBox}>
        <Search size={18} style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={styles.input}
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            style={styles.clearButton}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div style={styles.filterGroup}>
        <div style={styles.filterItem}>
          <label style={styles.label}>Role</label>
          <select
            value={roleFilter}
            onChange={(e) => onRoleChange(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="DISASTER_ADMIN">Disaster Admin</option>
            <option value="NGO_COORDINATOR">NGO Coordinator</option>
            <option value="VOLUNTEER">Volunteer</option>
          </select>
        </div>

        <div style={styles.filterItem}>
          <label style={styles.label}>Status</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            style={styles.select}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="invited">Invited</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button onClick={onReset} style={styles.resetButton}>
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
    marginBottom: '2rem',
    alignItems: 'flex-end',
  },
  searchBox: {
    position: 'relative',
    flex: 1,
    minWidth: '250px',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    boxSizing: 'border-box',
  },
  clearButton: {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
  },
  filterGroup: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  filterItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#334155',
  },
  select: {
    padding: '0.75rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    background: 'white',
    cursor: 'pointer',
  },
  resetButton: {
    padding: '0.75rem 1.25rem',
    background: '#f1f5f9',
    color: '#334155',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default UserFilters;
