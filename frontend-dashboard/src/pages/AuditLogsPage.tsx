import { useState, useMemo } from 'react';
import { Download, AlertCircle, Search, X } from 'lucide-react';
import { usePermission } from '../hooks/usePermission';
import { Permission } from '../enums/Permission';

interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  status: 'success' | 'failure';
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

// Mock audit logs
const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: '1',
    userId: 'user_1',
    userName: 'Admin User',
    action: 'LOGIN',
    resource: 'AUTH',
    resourceId: 'session_123',
    status: 'success',
    details: 'User logged in successfully',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 125.0 on Windows',
    timestamp: '2026-04-21T14:30:00Z',
  },
  {
    id: '2',
    userId: 'user_2',
    userName: 'Disaster Admin',
    action: 'CREATE',
    resource: 'DISASTER',
    resourceId: 'disaster_456',
    status: 'success',
    details: 'Created new disaster: Kerala Floods 2026',
    ipAddress: '203.0.113.45',
    userAgent: 'Safari 17.0 on iOS',
    timestamp: '2026-04-21T14:15:00Z',
  },
  {
    id: '3',
    userId: 'user_3',
    userName: 'NGO Coordinator',
    action: 'EDIT',
    resource: 'TASK',
    resourceId: 'task_789',
    status: 'success',
    details: 'Updated task status to In Progress',
    ipAddress: '198.51.100.89',
    userAgent: 'Chrome 125.0 on macOS',
    timestamp: '2026-04-21T14:00:00Z',
  },
  {
    id: '4',
    userId: 'user_1',
    userName: 'Admin User',
    action: 'DELETE',
    resource: 'USER',
    resourceId: 'user_999',
    status: 'success',
    details: 'Deleted inactive user account',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 125.0 on Windows',
    timestamp: '2026-04-21T13:45:00Z',
  },
  {
    id: '5',
    userId: 'user_4',
    userName: 'NGO Coordinator',
    action: 'FAILED_LOGIN',
    resource: 'AUTH',
    resourceId: 'attempt_111',
    status: 'failure',
    details: 'Invalid password attempt',
    ipAddress: '210.45.67.89',
    userAgent: 'Chrome 125.0 on Windows',
    timestamp: '2026-04-21T13:30:00Z',
  },
  {
    id: '6',
    userId: 'user_2',
    userName: 'Disaster Admin',
    action: 'EXPORT',
    resource: 'REPORT',
    resourceId: 'report_222',
    status: 'success',
    details: 'Exported activity report as CSV',
    ipAddress: '203.0.113.45',
    userAgent: 'Safari 17.0 on iOS',
    timestamp: '2026-04-21T13:15:00Z',
  },
];

export default function AuditLogsPage() {
  const { canAccess } = usePermission();
  const [logs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failure'>('all');

  const canViewAudit = canAccess(Permission.ADMIN_VIEW_AUDIT);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.includes(searchTerm);
      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

      return matchesSearch && matchesAction && matchesStatus;
    });
  }, [logs, searchTerm, actionFilter, statusFilter]);

  const handleExportLogs = () => {
    const csv = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Status', 'IP Address', 'Details'],
      ...filteredLogs.map((log) => [
        log.timestamp,
        log.userName,
        log.action,
        log.resource,
        log.status,
        log.ipAddress,
        log.details,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleReset = () => {
    setSearchTerm('');
    setActionFilter('all');
    setStatusFilter('all');
  };

  if (!canViewAudit) {
    return (
      <div style={styles.accessDeniedContainer}>
        <AlertCircle size={48} style={{ color: '#dc2626', marginBottom: '1rem' }} />
        <h1 style={styles.accessDeniedTitle}>Access Denied</h1>
        <p style={styles.accessDeniedText}>
          You don't have permission to view audit logs.
        </p>
      </div>
    );
  }

  const hasActiveFilters = searchTerm || actionFilter !== 'all' || statusFilter !== 'all';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Audit Logs</h1>
          <p style={styles.subtitle}>Track all user actions and system events for security and compliance</p>
        </div>
        <button onClick={handleExportLogs} style={styles.exportButton}>
          <Download size={18} />
          <span>Export</span>
        </button>
      </div>

      <div style={styles.content}>
        {/* Filters */}
        <div style={styles.filterSection}>
          <div style={styles.searchBox}>
            <Search size={18} style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by user, action, or IP address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={styles.clearButton}
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div style={styles.filterGroup}>
            <div style={styles.filterItem}>
              <label style={styles.label}>Action</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                style={styles.select}
              >
                <option value="all">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="FAILED_LOGIN">Failed Login</option>
                <option value="CREATE">Create</option>
                <option value="EDIT">Edit</option>
                <option value="DELETE">Delete</option>
                <option value="EXPORT">Export</option>
              </select>
            </div>

            <div style={styles.filterItem}>
              <label style={styles.label}>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                style={styles.select}
              >
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button onClick={handleReset} style={styles.resetButton}>
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={styles.statsBar}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Total Events</span>
            <span style={styles.statValue}>{filteredLogs.length}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Successful</span>
            <span style={styles.statValue}>{filteredLogs.filter((l) => l.status === 'success').length}</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Failed</span>
            <span style={styles.statValue}>{filteredLogs.filter((l) => l.status === 'failure').length}</span>
          </div>
        </div>

        {/* Logs Table */}
        <div style={styles.tableWrapper}>
          {filteredLogs.length === 0 ? (
            <div style={styles.emptyState}>
              <AlertCircle size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
              <h3 style={styles.emptyTitle}>No audit logs found</h3>
              <p style={styles.emptyText}>Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.headerRow}>
                  <th style={styles.th}>Timestamp</th>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Action</th>
                  <th style={styles.th}>Resource</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} style={styles.row}>
                    <td style={styles.td}>
                      <div style={styles.timestamp}>
                        {new Date(log.timestamp).toLocaleDateString()}
                        <br />
                        <small>{new Date(log.timestamp).toLocaleTimeString()}</small>
                      </div>
                    </td>
                    <td style={styles.td}>{log.userName}</td>
                    <td style={styles.td}>
                      <span style={styles.action}>{log.action}</span>
                    </td>
                    <td style={styles.td}>{log.resource}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          background: log.status === 'success' ? '#d1fae5' : '#fee2e2',
                          color: log.status === 'success' ? '#065f46' : '#991b1b',
                        }}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td style={styles.td}>{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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
  exportButton: {
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
  filterSection: {
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #e2e8f0',
  },
  searchBox: {
    position: 'relative',
    marginBottom: '1rem',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
    pointerEvents: 'none',
  },
  searchInput: {
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
    alignItems: 'flex-end',
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
    minWidth: '150px',
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
  statsBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
    padding: '1rem',
    background: '#f8fafc',
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
  timestamp: {
    fontSize: '0.875rem',
  },
  action: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    background: '#f1f5f9',
    color: '#334155',
    borderRadius: '0.375rem',
    fontWeight: 600,
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 1rem',
    textAlign: 'center',
  },
  emptyTitle: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  emptyText: {
    margin: '0.5rem 0 0',
    fontSize: '0.875rem',
    color: '#64748b',
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
