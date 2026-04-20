interface TaskTableViewProps {
  tasks: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    urgency: string;
    disasterName: string;
    assignedVolunteer?: { name: string };
    estimatedHours?: number;
    currentVolunteers: number;
    maxVolunteers: number;
  }>;
  selectedTasks?: string[];
  onSelectTask?: (taskId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onViewDetails?: (taskId: string) => void;
  onAssign?: (taskId: string) => void;
}

const typeEmojis: Record<string, string> = {
  RESCUE: '🚨',
  MEDICAL: '🏥',
  FOOD_DISTRIBUTION: '🍽️',
  SHELTER: '🏠',
  LOGISTICS: '📦',
  COMMUNICATION: '📞',
  TRANSPORT: '🚗',
  SUPPLY_COLLECTION: '📦',
  SAFETY: '⚠️',
  OTHER: '📋',
};

const statusColors: Record<string, { bg: string; text: string }> = {
  OPEN: { bg: '#f0f4f8', text: '#475569' },
  ASSIGNED: { bg: '#eff6ff', text: '#1e40af' },
  IN_PROGRESS: { bg: '#fef3c7', text: '#92400e' },
  COMPLETED: { bg: '#dcfce7', text: '#166534' },
  CANCELLED: { bg: '#fee2e2', text: '#7f1d1d' },
};

const urgencyColors: Record<string, { bg: string; text: string }> = {
  LOW: { bg: '#dcfce7', text: '#166534' },
  MEDIUM: { bg: '#fef3c7', text: '#92400e' },
  HIGH: { bg: '#fed7aa', text: '#9a3412' },
  CRITICAL: { bg: '#fee2e2', text: '#991b1b' },
};

export default function TaskTableView({
  tasks,
  selectedTasks = [],
  onSelectTask,
  onSelectAll,
  onViewDetails,
  onAssign,
}: TaskTableViewProps) {
  const sortedTasks = [...tasks];

  const allSelected = tasks.length > 0 && selectedTasks.length === tasks.length;

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th style={styles.checkboxTh}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll?.(e.target.checked)}
                style={styles.checkbox}
              />
            </th>
            <th style={{ ...styles.th, cursor: 'pointer' }}>
              <div style={styles.headerCell}>
                Title
              </div>
            </th>
            <th style={styles.th}>Type</th>
            <th style={styles.th}>Disaster</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Urgency</th>
            <th style={styles.th}>Assigned To</th>
            <th style={styles.th}>Progress</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedTasks.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ ...styles.td, textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                No tasks found
              </td>
            </tr>
          ) : (
            sortedTasks.map((task) => (
              <tr
                key={task.id}
                style={{
                  ...styles.bodyRow,
                  background: selectedTasks.includes(task.id) ? '#eff6ff' : 'white',
                }}
              >
                <td style={styles.checkboxTd}>
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={(e) => onSelectTask?.(task.id, e.target.checked)}
                    style={styles.checkbox}
                  />
                </td>
                <td style={styles.td}>
                  <div style={styles.titleCell}>
                    <span>{typeEmojis[task.type] || '📋'}</span>
                    <span style={styles.taskTitle}>{task.title}</span>
                  </div>
                </td>
                <td style={styles.td}>
                  <span style={styles.typeTag}>{task.type.replace(/_/g, ' ')}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.disasterName}>{task.disasterName}</span>
                </td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      background: statusColors[task.status]?.bg,
                      color: statusColors[task.status]?.text,
                    }}
                  >
                    {task.status}
                  </span>
                </td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      background: urgencyColors[task.urgency]?.bg,
                      color: urgencyColors[task.urgency]?.text,
                    }}
                  >
                    {task.urgency}
                  </span>
                </td>
                <td style={styles.td}>
                  {task.assignedVolunteer ? (
                    <span style={styles.volunteerName}>{task.assignedVolunteer.name}</span>
                  ) : (
                    <span style={styles.unassigned}>—</span>
                  )}
                </td>
                <td style={styles.td}>
                  <div style={styles.progressCell}>
                    <div style={styles.progressBarSmall}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${Math.min(
                            (task.currentVolunteers / task.maxVolunteers) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span style={styles.progressText}>
                      {task.currentVolunteers}/{task.maxVolunteers}
                    </span>
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={styles.actionCell}>
                    <button
                      onClick={() => onViewDetails?.(task.id)}
                      style={styles.smallBtn}
                      title="View details"
                    >
                      👁️
                    </button>
                    {task.status === 'OPEN' && (
                      <button
                        onClick={() => onAssign?.(task.id)}
                        style={styles.assignSmallBtn}
                        title="Assign volunteer"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    overflowX: 'auto',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    background: 'white',
    borderCollapse: 'collapse',
  },
  headerRow: {
    background: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
  },
  th: {
    textAlign: 'left',
    padding: '1rem',
    color: '#475569',
    fontWeight: 600,
    fontSize: '0.875rem',
  },
  checkboxTh: {
    textAlign: 'center',
    padding: '1rem',
    width: '2.5rem',
  },
  headerCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  bodyRow: {
    borderBottom: '1px solid #e2e8f0',
    transition: 'background 0.2s',
  },
  td: {
    padding: '0.875rem 1rem',
    fontSize: '0.875rem',
    color: '#1e293b',
  },
  checkboxTd: {
    textAlign: 'center',
    padding: '0.875rem 1rem',
    width: '2.5rem',
  },
  checkbox: {
    cursor: 'pointer',
  },
  titleCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  taskTitle: {
    fontWeight: 500,
  },
  typeTag: {
    background: '#e0f2fe',
    color: '#0369a1',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  disasterName: {
    fontSize: '0.8125rem',
    color: '#64748b',
  },
  badge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    display: 'inline-block',
  },
  volunteerName: {
    color: '#0369a1',
    fontWeight: 500,
  },
  unassigned: {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  progressCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  progressBarSmall: {
    height: '0.375rem',
    background: '#e2e8f0',
    borderRadius: '0.25rem',
    minWidth: '40px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#3b82f6',
    transition: 'width 0.3s',
  },
  progressText: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 500,
    minWidth: '2rem',
  },
  actionCell: {
    display: 'flex',
    gap: '0.375rem',
  },
  smallBtn: {
    padding: '0.375rem 0.5rem',
    background: '#f1f5f9',
    border: '1px solid #cbd5e1',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    fontSize: '0.75rem',
    transition: 'all 0.2s',
  },
  assignSmallBtn: {
    padding: '0.375rem 0.5rem',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 600,
    transition: 'all 0.2s',
  },
};
