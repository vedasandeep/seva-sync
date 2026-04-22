import { useState } from 'react';
import { Users, LogIn, Mail, TrendingUp, AlertCircle } from 'lucide-react';
import { usePermission } from '../hooks/usePermission';

interface KPICard {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
}

interface ActivityData {
  date: string;
  logins: number;
  taskAssignments: number;
  reportExports: number;
}

// Mock data
const MOCK_KPIS: KPICard[] = [
  {
    icon: <Users size={24} />,
    label: 'Active Users',
    value: 1247,
    change: '+12.5% from last month',
    changeType: 'positive',
  },
  {
    icon: <LogIn size={24} />,
    label: 'Logins (Today)',
    value: 342,
    change: '+8.2% from yesterday',
    changeType: 'positive',
  },
  {
    icon: <Mail size={24} />,
    label: 'Invitations Pending',
    value: 23,
    change: '+4 new invites',
    changeType: 'neutral',
  },
  {
    icon: <TrendingUp size={24} />,
    label: 'Task Completion Rate',
    value: '87.3%',
    change: '+2.1% from last week',
    changeType: 'positive',
  },
];

const MOCK_ACTIVITY: ActivityData[] = [
  { date: '2026-04-21', logins: 342, taskAssignments: 156, reportExports: 42 },
  { date: '2026-04-20', logins: 318, taskAssignments: 142, reportExports: 38 },
  { date: '2026-04-19', logins: 305, taskAssignments: 128, reportExports: 35 },
  { date: '2026-04-18', logins: 328, taskAssignments: 165, reportExports: 48 },
  { date: '2026-04-17', logins: 312, taskAssignments: 139, reportExports: 41 },
  { date: '2026-04-16', logins: 295, taskAssignments: 124, reportExports: 33 },
  { date: '2026-04-15', logins: 287, taskAssignments: 118, reportExports: 29 },
];

const FAILED_LOGINS = [
  { date: '2026-04-21', count: 12 },
  { date: '2026-04-20', count: 8 },
  { date: '2026-04-19', count: 15 },
  { date: '2026-04-18', count: 5 },
  { date: '2026-04-17', count: 11 },
];

export default function AdminDashboardPage() {
  const { isAdmin } = usePermission();
  const [selectedMetric, setSelectedMetric] = useState<'logins' | 'tasks' | 'exports'>('logins');

  if (!isAdmin()) {
    return (
      <div style={styles.accessDeniedContainer}>
        <AlertCircle size={48} style={{ color: '#dc2626', marginBottom: '1rem' }} />
        <h1 style={styles.accessDeniedTitle}>Access Denied</h1>
        <p style={styles.accessDeniedText}>
          Only administrators can access the dashboard.
        </p>
      </div>
    );
  }

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'positive':
        return '#16a34a';
      case 'negative':
        return '#dc2626';
      default:
        return '#64748b';
    }
  };

  const maxLogins = Math.max(...MOCK_ACTIVITY.map((a) => a.logins));
  const maxTasks = Math.max(...MOCK_ACTIVITY.map((a) => a.taskAssignments));
  const maxExports = Math.max(...MOCK_ACTIVITY.map((a) => a.reportExports));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <p style={styles.subtitle}>System overview and activity monitoring</p>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        {MOCK_KPIS.map((kpi, index) => (
          <div key={index} style={styles.kpiCard}>
            <div style={styles.kpiIcon}>{kpi.icon}</div>
            <div style={styles.kpiContent}>
              <p style={styles.kpiLabel}>{kpi.label}</p>
              <h3 style={styles.kpiValue}>{kpi.value}</h3>
              <p style={{ ...styles.kpiChange, color: getChangeColor(kpi.changeType) }}>
                {kpi.changeType === 'positive' ? '↑' : kpi.changeType === 'negative' ? '↓' : '→'} {kpi.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Charts */}
      <div style={styles.chartsSection}>
        <h2 style={styles.sectionTitle}>Activity Trends</h2>

        <div style={styles.metricToggle}>
          {[
            { key: 'logins', label: 'Logins' },
            { key: 'tasks', label: 'Task Assignments' },
            { key: 'exports', label: 'Report Exports' },
          ].map((metric) => (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key as any)}
              style={{
                ...styles.toggleButton,
                ...(selectedMetric === metric.key ? styles.toggleButtonActive : {}),
              }}
            >
              {metric.label}
            </button>
          ))}
        </div>

        <div style={styles.chartContainer}>
          <div style={styles.chart}>
            {MOCK_ACTIVITY.map((activity, index) => {
              const maxValue =
                selectedMetric === 'logins'
                  ? maxLogins
                  : selectedMetric === 'tasks'
                  ? maxTasks
                  : maxExports;
              const value =
                selectedMetric === 'logins'
                  ? activity.logins
                  : selectedMetric === 'tasks'
                  ? activity.taskAssignments
                  : activity.reportExports;
              const height = (value / maxValue) * 250;

              return (
                <div key={index} style={styles.barGroup}>
                  <div
                    style={{
                      ...styles.bar,
                      height: `${height}px`,
                    }}
                  ></div>
                  <label style={styles.barLabel}>
                    {new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Failed Logins Alert */}
      <div style={styles.alertSection}>
        <h2 style={styles.sectionTitle}>Security Alerts</h2>

        <div style={styles.alertCard}>
          <div style={styles.alertHeader}>
            <AlertCircle size={20} style={{ color: '#f59e0b' }} />
            <h3 style={styles.alertTitle}>Failed Login Attempts (Last 7 Days)</h3>
          </div>

          <div style={styles.failedLoginsChart}>
            {FAILED_LOGINS.map((item, index) => (
              <div key={index} style={styles.failedLoginItem}>
                <div style={styles.failedLoginLabel}>{item.count}</div>
                <div style={{ ...styles.failedLoginBar, width: `${(item.count / 15) * 100}%` }}></div>
              </div>
            ))}
          </div>

          <p style={styles.alertText}>
            Peak failures on <strong>{FAILED_LOGINS.reduce((max, curr) => (curr.count > max.count ? curr : max)).date}</strong> with{' '}
            <strong>{FAILED_LOGINS.reduce((max, curr) => (curr.count > max.count ? curr : max)).count}</strong> attempts
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={styles.activitySection}>
        <h2 style={styles.sectionTitle}>Recent Activity Summary</h2>

        <div style={styles.activityGrid}>
          <div style={styles.activityItem}>
            <div style={styles.activityIcon}>👥</div>
            <div>
              <h4 style={styles.activityTitle}>Users Invited</h4>
              <p style={styles.activityValue}>23 pending, 1,247 active</p>
            </div>
          </div>

          <div style={styles.activityItem}>
            <div style={styles.activityIcon}>✅</div>
            <div>
              <h4 style={styles.activityTitle}>Tasks Assigned</h4>
              <p style={styles.activityValue}>1,156 total, 87.3% completion rate</p>
            </div>
          </div>

          <div style={styles.activityItem}>
            <div style={styles.activityIcon}>📊</div>
            <div>
              <h4 style={styles.activityTitle}>Reports Generated</h4>
              <p style={styles.activityValue}>287 total, 42 today</p>
            </div>
          </div>

          <div style={styles.activityItem}>
            <div style={styles.activityIcon}>🔐</div>
            <div>
              <h4 style={styles.activityTitle}>Security</h4>
              <p style={styles.activityValue}>51 failed logins this week</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div style={styles.healthSection}>
        <h2 style={styles.sectionTitle}>System Health</h2>

        <div style={styles.healthGrid}>
          <div style={styles.healthItem}>
            <div style={styles.healthLabel}>Database</div>
            <div style={{ ...styles.healthStatus, background: '#16a34a' }}>Healthy</div>
          </div>
          <div style={styles.healthItem}>
            <div style={styles.healthLabel}>API Server</div>
            <div style={{ ...styles.healthStatus, background: '#16a34a' }}>Healthy</div>
          </div>
          <div style={styles.healthItem}>
            <div style={styles.healthLabel}>Cache Layer</div>
            <div style={{ ...styles.healthStatus, background: '#16a34a' }}>Healthy</div>
          </div>
          <div style={styles.healthItem}>
            <div style={styles.healthLabel}>Authentication</div>
            <div style={{ ...styles.healthStatus, background: '#16a34a' }}>Healthy</div>
          </div>
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
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  kpiCard: {
    display: 'flex',
    gap: '1.5rem',
    padding: '1.5rem',
    background: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  kpiIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60px',
    height: '60px',
    background: '#f0f9ff',
    borderRadius: '0.75rem',
    color: '#0c4a6e',
    flexShrink: 0,
  },
  kpiContent: {
    flex: 1,
  },
  kpiLabel: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: 600,
    letterSpacing: '0.05em',
  },
  kpiValue: {
    margin: '0.5rem 0',
    fontSize: '1.875rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  kpiChange: {
    margin: 0,
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  chartsSection: {
    marginBottom: '2rem',
    padding: '2rem',
    background: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    margin: '0 0 1.5rem',
    fontSize: '1.125rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  metricToggle: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  toggleButton: {
    padding: '0.5rem 1rem',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#64748b',
    cursor: 'pointer',
  },
  toggleButtonActive: {
    background: '#1e40af',
    color: 'white',
    borderColor: '#1e40af',
  },
  chartContainer: {
    padding: '2rem 1rem',
    background: '#f8fafc',
    borderRadius: '0.5rem',
    overflowX: 'auto',
  },
  chart: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-end',
    minHeight: '300px',
  },
  barGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    flex: 1,
    minWidth: '50px',
  },
  bar: {
    width: '100%',
    background: 'linear-gradient(to top, #1e40af, #3b82f6)',
    borderRadius: '0.375rem 0.375rem 0 0',
    minHeight: '20px',
  },
  barLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 600,
  },
  alertSection: {
    marginBottom: '2rem',
    padding: '2rem',
    background: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  alertCard: {
    padding: '1.5rem',
    background: '#fef3c7',
    borderRadius: '0.5rem',
    border: '1px solid #fde68a',
  },
  alertHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  alertTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 700,
    color: '#92400e',
  },
  failedLoginsChart: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  failedLoginItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  failedLoginLabel: {
    width: '30px',
    textAlign: 'right',
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#92400e',
  },
  failedLoginBar: {
    height: '24px',
    background: '#f59e0b',
    borderRadius: '0.25rem',
  },
  alertText: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#92400e',
  },
  activitySection: {
    marginBottom: '2rem',
    padding: '2rem',
    background: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  activityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
  },
  activityItem: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    background: '#f8fafc',
    borderRadius: '0.5rem',
  },
  activityIcon: {
    fontSize: '2rem',
  },
  activityTitle: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  activityValue: {
    margin: '0.25rem 0 0',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  healthSection: {
    padding: '2rem',
    background: 'white',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  healthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  healthItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: '#f8fafc',
    borderRadius: '0.5rem',
  },
  healthLabel: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#334155',
  },
  healthStatus: {
    padding: '0.375rem 0.75rem',
    color: 'white',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 700,
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
