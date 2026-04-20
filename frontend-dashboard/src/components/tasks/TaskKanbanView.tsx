import { GripVertical, Plus } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  type: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  urgency: string;
  assignedVolunteer?: { name: string };
  currentVolunteers: number;
  maxVolunteers: number;
}

interface TaskKanbanViewProps {
  tasks: Task[];
  onViewDetails?: (taskId: string) => void;
  onAssign?: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: string) => void;
}

const KANBAN_COLUMNS = [
  { id: 'OPEN', title: 'Open', icon: '🆕' },
  { id: 'ASSIGNED', title: 'Assigned', icon: '✅' },
  { id: 'IN_PROGRESS', title: 'In Progress', icon: '⏳' },
  { id: 'COMPLETED', title: 'Completed', icon: '✓' },
];

const urgencyColors: Record<string, string> = {
  LOW: '#dcfce7',
  MEDIUM: '#fef3c7',
  HIGH: '#fed7aa',
  CRITICAL: '#fee2e2',
};

export default function TaskKanbanView({
  tasks,
  onViewDetails,
  onAssign,
  onStatusChange,
}: TaskKanbanViewProps) {
  const tasksByStatus = KANBAN_COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = tasks.filter((t) => t.status === col.id);
      return acc;
    },
    {} as Record<string, Task[]>
  );

  return (
    <div style={styles.container}>
      <div style={styles.boardWrapper}>
        {KANBAN_COLUMNS.map((column) => (
          <div key={column.id} style={styles.column}>
            {/* Column Header */}
            <div style={styles.columnHeader}>
              <div style={styles.columnTitle}>
                <span>{column.icon}</span>
                <span>{column.title}</span>
                <span style={styles.taskCount}>{tasksByStatus[column.id]?.length || 0}</span>
              </div>
            </div>

            {/* Tasks Container */}
            <div style={styles.tasksContainer}>
              {tasksByStatus[column.id]?.length === 0 ? (
                <div style={styles.emptyState}>
                  <span style={styles.emptyIcon}>📭</span>
                  <p style={styles.emptyText}>No tasks</p>
                </div>
              ) : (
                tasksByStatus[column.id]?.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      ...styles.taskCard,
                      borderLeft: `4px solid ${urgencyColors[task.urgency] || '#e2e8f0'}`,
                    }}
                    onClick={() => onViewDetails?.(task.id)}
                  >
                    {/* Drag handle */}
                    <div style={styles.dragHandle}>
                      <GripVertical size={14} color="#cbd5e1" />
                    </div>

                    {/* Task content */}
                    <div style={styles.taskContent}>
                      {/* Title */}
                      <h4 style={styles.taskTitle}>{task.title}</h4>

                      {/* Type badge */}
                      <div style={styles.typeBadge}>{task.type.replace(/_/g, ' ')}</div>

                      {/* Urgency indicator */}
                      <div
                        style={{
                          ...styles.urgencyIndicator,
                          background: urgencyColors[task.urgency],
                        }}
                      >
                        {task.urgency}
                      </div>

                      {/* Assignment info */}
                      <div style={styles.assignmentInfo}>
                        {task.assignedVolunteer ? (
                          <span style={styles.assignedName}>👤 {task.assignedVolunteer.name}</span>
                        ) : (
                          <span style={styles.unassignedLabel}>Unassigned</span>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div style={styles.progressSmall}>
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
                        <span style={styles.progressCountSmall}>
                          {task.currentVolunteers}/{task.maxVolunteers}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={styles.taskActions}>
                      {task.status === 'OPEN' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssign?.(task.id);
                          }}
                          style={styles.assignButtonSmall}
                          title="Assign volunteer"
                        >
                          + Assign
                        </button>
                      )}
                      {task.status === 'ASSIGNED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange?.(task.id, 'IN_PROGRESS');
                          }}
                          style={styles.startButtonSmall}
                          title="Start task"
                        >
                          ▶️ Start
                        </button>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange?.(task.id, 'COMPLETED');
                          }}
                          style={styles.completeButtonSmall}
                          title="Complete task"
                        >
                          ✓ Done
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add task button */}
            <button style={styles.addTaskButton}>
              <Plus size={16} /> Add Task
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: '#f8fafc',
    borderRadius: '0.75rem',
    padding: '1rem',
    overflowX: 'auto',
    minHeight: '600px',
    WebkitOverflowScrolling: 'touch',
  } as any,
  boardWrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
    minWidth: 'min-content',
  } as any,
  column: {
    background: '#f0f4f8',
    borderRadius: '0.75rem',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    minWidth: '280px',
    maxHeight: '75vh',
    overflowY: 'auto',
  },
  columnHeader: {
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid #e2e8f0',
  },
  columnTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: '#1e293b',
    wordBreak: 'break-word',
  } as any,
  taskCount: {
    background: '#e2e8f0',
    color: '#475569',
    padding: '0.125rem 0.5rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    marginLeft: 'auto',
    flexShrink: 0,
  },
  tasksContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    flex: 1,
    minHeight: '100px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1rem',
    color: '#94a3b8',
  },
  emptyIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  emptyText: {
    margin: 0,
    fontSize: '0.875rem',
  },
  taskCard: {
    background: 'white',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    cursor: 'grab',
    display: 'flex',
    gap: '0.5rem',
    transition: 'all 0.2s',
  },
  dragHandle: {
    display: 'flex',
    alignItems: 'flex-start',
    paddingTop: '0.125rem',
    cursor: 'grab',
  },
  taskContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  taskTitle: {
    margin: 0,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1e293b',
    lineHeight: 1.4,
  },
  typeBadge: {
    background: '#e0f2fe',
    color: '#0369a1',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.7rem',
    fontWeight: 500,
    width: 'fit-content',
  },
  urgencyIndicator: {
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontSize: '0.7rem',
    fontWeight: 600,
    width: 'fit-content',
  },
  assignmentInfo: {
    fontSize: '0.75rem',
  },
  assignedName: {
    color: '#0369a1',
    fontWeight: 500,
  },
  unassignedLabel: {
    color: '#f97316',
    fontWeight: 500,
  },
  progressSmall: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
  },
  progressBarSmall: {
    height: '0.25rem',
    background: '#e2e8f0',
    borderRadius: '0.25rem',
    minWidth: '30px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#3b82f6',
    transition: 'width 0.3s',
  },
  progressCountSmall: {
    fontSize: '0.7rem',
    color: '#64748b',
    fontWeight: 500,
    minWidth: '2rem',
  },
  taskActions: {
    display: 'flex',
    gap: '0.375rem',
  },
  assignButtonSmall: {
    padding: '0.375rem 0.5rem',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    fontSize: '0.7rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  startButtonSmall: {
    padding: '0.375rem 0.5rem',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    fontSize: '0.7rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  completeButtonSmall: {
    padding: '0.375rem 0.5rem',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    fontSize: '0.7rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  addTaskButton: {
    marginTop: '0.75rem',
    padding: '0.75rem',
    background: 'transparent',
    border: '2px dashed #cbd5e1',
    borderRadius: '0.5rem',
    color: '#64748b',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s',
  },
};
