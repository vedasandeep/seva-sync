import { useEffect, useState } from 'react';
import { useTasks, useAuth, useSync, useGeolocation } from '../hooks';
import { fetchTasks, fetchNearbyTasks, acceptTask, completeTask } from '../lib/api';
import type { CSSProperties } from 'react';

export default function TasksPage() {
  const { volunteer } = useAuth();
  const { tasks, refresh: refreshTasks } = useTasks();
  const { sync, syncing, online } = useSync();
  const { location } = useGeolocation();
  const [activeTab, setActiveTab] = useState<'my' | 'nearby'>('my');
  const [loading, setLoading] = useState(false);

  // Fetch tasks on mount and when online
  useEffect(() => {
    if (online && volunteer) {
      setLoading(true);
      fetchTasks().then(() => {
        refreshTasks();
        setLoading(false);
      });
    }
  }, [online, volunteer, refreshTasks]);

  const handleFetchNearby = async () => {
    if (!location) {
      alert('Location not available');
      return;
    }
    setLoading(true);
    await fetchNearbyTasks(location.lat, location.lon);
    await refreshTasks();
    setLoading(false);
  };

  const handleAccept = async (taskId: string) => {
    const result = await acceptTask(taskId);
    if (result.success) {
      await refreshTasks();
      if ((result.data as { queued?: boolean })?.queued) {
        alert('Task accepted (will sync when online)');
      }
    }
  };

  const handleComplete = async (taskId: string) => {
    const result = await completeTask(taskId);
    if (result.success) {
      await refreshTasks();
      if ((result.data as { queued?: boolean })?.queued) {
        alert('Task completed (will sync when online)');
      }
    }
  };

  const myTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const nearbyTasks = tasks.filter((t) => t.status === 'OPEN');

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Tasks</h1>
          <p style={styles.greeting}>Hello, {volunteer?.name}</p>
        </div>
        <div style={getStatusBadgeStyle(online)}>
          {online ? 'Online' : 'Offline'}
        </div>
      </header>

      {/* Sync Banner */}
      {!online && (
        <div style={styles.offlineBanner}>
          You're offline. Changes will sync when connected.
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={getTabStyle(activeTab === 'my')}
          onClick={() => setActiveTab('my')}
        >
          My Tasks ({myTasks.length})
        </button>
        <button
          style={getTabStyle(activeTab === 'nearby')}
          onClick={() => setActiveTab('nearby')}
        >
          Nearby ({nearbyTasks.length})
        </button>
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        {activeTab === 'nearby' && (
          <button onClick={handleFetchNearby} style={styles.actionBtn} disabled={!online}>
            Find Nearby Tasks
          </button>
        )}
        <button onClick={sync} style={styles.actionBtn} disabled={syncing || !online}>
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* Task List */}
      <div style={styles.taskList}>
        {loading ? (
          <p style={styles.empty}>Loading...</p>
        ) : activeTab === 'my' ? (
          myTasks.length === 0 ? (
            <p style={styles.empty}>No active tasks. Check nearby tasks!</p>
          ) : (
            myTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={() => handleComplete(task.id)}
              />
            ))
          )
        ) : nearbyTasks.length === 0 ? (
          <p style={styles.empty}>No nearby tasks found.</p>
        ) : (
          nearbyTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onAccept={() => handleAccept(task.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onAccept,
  onComplete,
}: {
  task: { id: string; title: string; description?: string; urgency: string; status: string; syncStatus: string };
  onAccept?: () => void;
  onComplete?: () => void;
}) {
  const urgencyColors: Record<string, string> = {
    CRITICAL: '#dc2626',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#22c55e',
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>{task.title}</h3>
        <span style={{ ...styles.urgencyBadge, background: urgencyColors[task.urgency] || '#6b7280' }}>
          {task.urgency}
        </span>
      </div>
      {task.description && <p style={styles.cardDesc}>{task.description}</p>}
      <div style={styles.cardFooter}>
        {task.syncStatus === 'pending' && (
          <span style={styles.pendingBadge}>Pending sync</span>
        )}
        {onAccept && (
          <button onClick={onAccept} style={styles.acceptBtn}>
            Accept Task
          </button>
        )}
        {onComplete && (
          <button onClick={onComplete} style={styles.completeBtn}>
            Mark Complete
          </button>
        )}
      </div>
    </div>
  );
}

// Dynamic style functions
const getStatusBadgeStyle = (online: boolean): CSSProperties => ({
  padding: '0.25rem 0.75rem',
  borderRadius: '9999px',
  fontSize: '0.75rem',
  fontWeight: 600,
  background: online ? '#22c55e' : '#ef4444',
});

const getTabStyle = (active: boolean): CSSProperties => ({
  flex: 1,
  padding: '1rem',
  border: 'none',
  background: 'transparent',
  fontWeight: 600,
  color: active ? '#1e40af' : '#64748b',
  borderBottom: active ? '2px solid #1e40af' : '2px solid transparent',
  cursor: 'pointer',
});

// Static styles
const styles: Record<string, CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#f1f5f9',
  },
  header: {
    background: '#1e40af',
    color: 'white',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
  },
  greeting: {
    margin: '0.25rem 0 0',
    fontSize: '0.875rem',
    opacity: 0.9,
  },
  offlineBanner: {
    background: '#fef3c7',
    color: '#92400e',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    textAlign: 'center',
  },
  tabs: {
    display: 'flex',
    background: 'white',
    borderBottom: '1px solid #e5e7eb',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    padding: '1rem',
  },
  actionBtn: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #1e40af',
    background: 'white',
    color: '#1e40af',
    borderRadius: '0.5rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  taskList: {
    padding: '0 1rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  empty: {
    textAlign: 'center',
    color: '#64748b',
    padding: '2rem',
  },
  card: {
    background: 'white',
    borderRadius: '0.75rem',
    padding: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1rem',
    color: '#1f2937',
  },
  urgencyBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.625rem',
    fontWeight: 700,
    color: 'white',
    textTransform: 'uppercase',
  },
  cardDesc: {
    margin: '0.5rem 0 0',
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  cardFooter: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingBadge: {
    fontSize: '0.75rem',
    color: '#f97316',
    fontWeight: 500,
  },
  acceptBtn: {
    padding: '0.5rem 1rem',
    background: '#22c55e',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  completeBtn: {
    padding: '0.5rem 1rem',
    background: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginLeft: 'auto',
  },
};
