import { useEffect, useState } from 'react';
import { disasters } from '../lib/api';

interface Disaster {
  id: string;
  name: string;
  type: string;
  status: string;
  location: string;
  totalTasks?: number;
  completedTasks?: number;
  openTasks?: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ active: 0, total: 0, disasters: [] as Disaster[] });

  useEffect(() => {
    disasters.list().then((list) => {
      setStats({
        active: list.filter((d) => d.status === 'ACTIVE').length,
        total: list.length,
        disasters: list.slice(0, 5),
      });
    });
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard</h1>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.active}</div>
          <div style={styles.statLabel}>Active Disasters</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Total Disasters</div>
        </div>
      </div>

      {/* Recent Disasters */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Recent Disasters</h2>
        {stats.disasters.length === 0 ? (
          <div style={styles.empty}>No disasters yet. Go to Disasters page to create one.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Tasks</th>
              </tr>
            </thead>
            <tbody>
              {stats.disasters.map((d) => (
                <tr key={d.id}>
                  <td style={styles.td}>{d.name}</td>
                  <td style={styles.td}>{d.type}</td>
                  <td style={styles.td}>{d.location}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, background: d.status === 'ACTIVE' ? '#22c55e' : d.status === 'PLANNING' ? '#f59e0b' : '#64748b' }}>
                      {d.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {d.totalTasks !== undefined ? `${d.completedTasks ?? 0}/${d.totalTasks}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '2rem' },
  title: { margin: '0 0 1.5rem', color: '#1e293b' },
  stats: { display: 'flex', gap: '1rem', marginBottom: '2rem' },
  statCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    flex: 1,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  statValue: { fontSize: '2.5rem', fontWeight: 700, color: '#1e40af' },
  statLabel: { color: '#64748b' },
  section: { background: 'white', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  sectionTitle: { margin: '0 0 1rem', fontSize: '1.125rem', color: '#1e293b' },
  empty: { color: '#64748b', textAlign: 'center', padding: '2rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '0.75rem', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 500 },
  td: { padding: '0.75rem', borderBottom: '1px solid #e2e8f0' },
  badge: { padding: '0.25rem 0.5rem', borderRadius: '0.25rem', color: 'white', fontSize: '0.75rem', fontWeight: 600 },
};
