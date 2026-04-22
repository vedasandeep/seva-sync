import React, { useState } from 'react';
import { MoreVertical, Trash2, Edit2, Mail } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'DISASTER_ADMIN' | 'NGO_COORDINATOR' | 'VOLUNTEER';
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'inactive' | 'invited';
}

interface UserTableProps {
  users: User[];
  loading?: boolean;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
  onResendInvite?: (userId: string) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading = false,
  onEdit,
  onDelete,
  onResendInvite,
}) => {
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return '#dc2626';
      case 'DISASTER_ADMIN':
        return '#f59e0b';
      case 'NGO_COORDINATOR':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#16a34a';
      case 'inactive':
        return '#6b7280';
      case 'invited':
        return '#0ea5e9';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return <div style={styles.loadingText}>Loading users...</div>;
  }

  if (users.length === 0) {
    return <div style={styles.emptyText}>No users found</div>;
  }

  return (
    <div style={styles.tableWrapper}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Role</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Last Login</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <React.Fragment key={user.id}>
              <tr style={styles.row}>
                <td style={styles.td}>{user.name}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: getRoleColor(user.role) }}>
                    {user.role.replace(/_/g, ' ')}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, background: getStatusColor(user.status) }}>
                    {user.status}
                  </span>
                </td>
                <td style={styles.td}>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '—'}</td>
                <td style={styles.td}>
                  <button
                    onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                    style={styles.actionButton}
                  >
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
              {expandedUserId === user.id && (
                <tr style={styles.expandedRow}>
                  <td colSpan={6} style={styles.expandedCell}>
                    <div style={styles.actionMenu}>
                      {onEdit && (
                        <button onClick={() => onEdit(user)} style={styles.menuItem}>
                          <Edit2 size={16} />
                          <span>Edit User</span>
                        </button>
                      )}
                      {user.status === 'invited' && onResendInvite && (
                        <button onClick={() => onResendInvite(user.id)} style={styles.menuItem}>
                          <Mail size={16} />
                          <span>Resend Invite</span>
                        </button>
                      )}
                      {onDelete && (
                        <button onClick={() => onDelete(user.id)} style={{ ...styles.menuItem, ...styles.dangerMenuItem }}>
                          <Trash2 size={16} />
                          <span>Delete User</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
  },
  headerRow: {
    background: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
  },
  th: {
    padding: '1rem',
    textAlign: 'left',
    fontWeight: 600,
    color: '#334155',
  },
  row: {
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '1rem',
    color: '#475569',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  actionButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
  },
  expandedRow: {
    background: '#f8fafc',
  },
  expandedCell: {
    padding: '0 1rem !important',
  },
  actionMenu: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.75rem 0',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: '#334155',
  },
  dangerMenuItem: {
    color: '#dc2626',
    borderColor: '#fecaca',
  },
  loadingText: {
    padding: '2rem',
    textAlign: 'center',
    color: '#64748b',
  },
  emptyText: {
    padding: '2rem',
    textAlign: 'center',
    color: '#94a3b8',
  },
};

export default UserTable;
