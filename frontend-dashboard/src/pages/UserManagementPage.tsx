import { useState, useMemo } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { UserTable } from '../features/users/components/UserTable';
import { UserFilters } from '../features/users/components/UserFilters';
import { usePermission } from '../hooks/usePermission';
import { Permission } from '../enums/Permission';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'DISASTER_ADMIN' | 'NGO_COORDINATOR' | 'VOLUNTEER';
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'invited';
}

// Mock user data
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@sevasync.com',
    name: 'Admin User',
    role: 'SUPER_ADMIN',
    createdAt: '2024-01-01',
    lastLogin: '2026-04-21',
    status: 'active',
  },
  {
    id: '2',
    email: 'disaster@sevasync.com',
    name: 'Disaster Admin',
    role: 'DISASTER_ADMIN',
    createdAt: '2024-01-15',
    lastLogin: '2026-04-20',
    status: 'active',
  },
  {
    id: '3',
    email: 'coordinator@sevasync.com',
    name: 'NGO Coordinator',
    role: 'NGO_COORDINATOR',
    createdAt: '2024-02-01',
    lastLogin: '2026-04-18',
    status: 'active',
  },
  {
    id: '4',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'VOLUNTEER',
    createdAt: '2024-03-01',
    lastLogin: '2026-04-10',
    status: 'active',
  },
  {
    id: '5',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    role: 'NGO_COORDINATOR',
    createdAt: '2024-03-15',
    lastLogin: undefined,
    status: 'invited',
  },
];

export default function UserManagementPage() {
  const { canAccess } = usePermission();
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canViewUsers = canAccess(Permission.USER_VIEW);
  const canCreateUsers = canAccess(Permission.USER_CREATE);
  const canEditUsers = canAccess(Permission.USER_EDIT);
  const canDeleteUsers = canAccess(Permission.USER_DELETE);

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleEdit = (user: User) => {
    console.log('Edit user:', user);
    // TODO: Open edit modal
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setLoading(true);
      setError('');
      try {
        setUsers(users.filter((u) => u.id !== userId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete user');
      }
      setLoading(false);
    }
  };

  const handleResendInvite = (userId: string) => {
    setLoading(true);
    setError('');
    try {
      const user = users.find((u) => u.id === userId);
      if (user) {
        console.log('Invite resent to:', user.email);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend invite');
    }
    setLoading(false);
  };

  const handleReset = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  if (!canViewUsers) {
    return (
      <div style={styles.accessDeniedContainer}>
        <AlertCircle size={48} style={{ color: '#dc2626', marginBottom: '1rem' }} />
        <h1 style={styles.accessDeniedTitle}>Access Denied</h1>
        <p style={styles.accessDeniedText}>
          You don't have permission to view user management.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>User Management</h1>
          <p style={styles.subtitle}>Manage team members, roles, and access permissions</p>
        </div>
        {canCreateUsers && (
          <button style={styles.createButton}>
            <Plus size={20} />
            <span>Invite User</span>
          </button>
        )}
      </div>

      {error && (
        <div style={styles.errorAlert}>
          <AlertCircle size={18} />
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            style={styles.closeError}
          >
            ×
          </button>
        </div>
      )}

      <div style={styles.content}>
        <UserFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          roleFilter={roleFilter}
          onRoleChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onReset={handleReset}
        />

        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Total Users</span>
            <span style={styles.statValue}>{filteredUsers.length}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Active</span>
            <span style={styles.statValue}>{filteredUsers.filter((u) => u.status === 'active').length}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Invited</span>
            <span style={styles.statValue}>{filteredUsers.filter((u) => u.status === 'invited').length}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Admins</span>
            <span style={styles.statValue}>
              {filteredUsers.filter((u) => ['SUPER_ADMIN', 'DISASTER_ADMIN'].includes(u.role)).length}
            </span>
          </div>
        </div>

        <UserTable
          users={filteredUsers}
          loading={loading}
          onEdit={canEditUsers ? handleEdit : undefined}
          onDelete={canDeleteUsers ? handleDelete : undefined}
          onResendInvite={handleResendInvite}
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '2rem',
    background: '#f8fafc',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
  },
  title: {
    margin: 0,
    fontSize: '1.875rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  subtitle: {
    margin: '0.5rem 0 0',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1.25rem',
    background: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  content: {
    background: 'white',
    borderRadius: '0.75rem',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    marginBottom: '1.5rem',
    background: '#fee2e2',
    color: '#991b1b',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
  },
  closeError: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#991b1b',
    fontSize: '1.5rem',
    padding: 0,
  },
  statsBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
    padding: '1rem',
    background: '#f1f5f9',
    borderRadius: '0.5rem',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  accessDeniedContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#f8fafc',
    textAlign: 'center',
  },
  accessDeniedTitle: {
    margin: 0,
    fontSize: '1.875rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  accessDeniedText: {
    margin: '0.75rem 0 0',
    color: '#64748b',
  },
};
