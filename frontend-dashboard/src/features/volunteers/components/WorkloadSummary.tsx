interface WorkloadSummaryProps {
  currentWorkload: number;
  maxWorkload: number;
  assignedTasks: Array<{
    id: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed';
    dueDate?: string;
  }>;
}

export default function WorkloadSummary({
  currentWorkload,
  maxWorkload,
  assignedTasks,
}: WorkloadSummaryProps) {
  const workloadPercent = (currentWorkload / maxWorkload) * 100;
  const isOverloaded = workloadPercent > 100;

  const tasksByStatus = {
    pending: assignedTasks.filter((t) => t.status === 'pending').length,
    in_progress: assignedTasks.filter((t) => t.status === 'in_progress').length,
    completed: assignedTasks.filter((t) => t.status === 'completed').length,
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Workload Summary</h3>

      {/* Capacity Gauge */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Capacity</div>
        <div style={styles.workloadBar}>
          <div
            style={{
              ...styles.workloadFill,
              width: `${Math.min(workloadPercent, 100)}%`,
              backgroundColor: isOverloaded ? '#ef4444' : workloadPercent > 75 ? '#f97316' : '#3b82f6',
            }}
          />
        </div>
        <div style={styles.workloadStats}>
          <span style={styles.workloadLabel}>
            {currentWorkload} / {maxWorkload} tasks
          </span>
          <span style={{ ...styles.workloadPercent, color: isOverloaded ? '#ef4444' : '#64748b' }}>
            {workloadPercent.toFixed(0)}%
          </span>
        </div>
        {isOverloaded && (
          <div style={styles.overloadWarning}>
            ⚠️ Volunteer is overloaded. Consider reassigning tasks.
          </div>
        )}
      </div>

      {/* Task Breakdown */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Task Breakdown</div>
        <div style={styles.taskGrid}>
          <div style={styles.taskStat}>
            <div style={styles.taskStatValue}>{tasksByStatus.pending}</div>
            <div style={styles.taskStatLabel}>Pending</div>
          </div>
          <div style={styles.taskStat}>
            <div style={styles.taskStatValue}>{tasksByStatus.in_progress}</div>
            <div style={styles.taskStatLabel}>In Progress</div>
          </div>
          <div style={styles.taskStat}>
            <div style={styles.taskStatValue}>{tasksByStatus.completed}</div>
            <div style={styles.taskStatLabel}>Completed</div>
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div style={styles.section}>
        <div style={styles.sectionLabel}>Recent Tasks</div>
        {assignedTasks.length === 0 ? (
          <div style={styles.emptyState}>No assigned tasks</div>
        ) : (
          <div style={styles.taskList}>
            {assignedTasks.slice(0, 5).map((task) => (
              <div key={task.id} style={styles.taskItem}>
                <div style={styles.taskItemLeft}>
                  <div
                    style={{
                      ...styles.taskStatusBadge,
                      backgroundColor:
                        task.status === 'pending'
                          ? '#fef3c7'
                          : task.status === 'in_progress'
                            ? '#dbeafe'
                            : '#dcfce7',
                      color:
                        task.status === 'pending'
                          ? '#92400e'
                          : task.status === 'in_progress'
                            ? '#0c4a6e'
                            : '#166534',
                    }}
                  >
                    {task.status === 'pending'
                      ? '⏳'
                      : task.status === 'in_progress'
                        ? '▶️'
                        : '✓'}
                  </div>
                  <div>
                    <div style={styles.taskItemTitle}>{task.title}</div>
                    {task.dueDate && (
                      <div style={styles.taskItemDate}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  sectionLabel: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#475569',
  },
  workloadBar: {
    height: '0.75rem',
    backgroundColor: '#e2e8f0',
    borderRadius: '9999px',
    overflow: 'hidden',
  },
  workloadFill: {
    height: '100%',
    borderRadius: '9999px',
    transition: 'width 0.3s ease',
  },
  workloadStats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.875rem',
  },
  workloadLabel: {
    color: '#64748b',
  },
  workloadPercent: {
    fontWeight: 600,
  },
  overloadWarning: {
    padding: '0.75rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    color: '#991b1b',
    marginTop: '0.5rem',
  },
  taskGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
  },
  taskStat: {
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    textAlign: 'center',
  },
  taskStatValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  taskStatLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '0.25rem',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  taskItem: {
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskItemLeft: {
    display: 'flex',
    gap: '0.75rem',
    flex: 1,
  },
  taskStatusBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    flexShrink: 0,
  },
  taskItemTitle: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#1e293b',
  },
  taskItemDate: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '0.25rem',
  },
  emptyState: {
    padding: '1rem',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '0.875rem',
  },
};
