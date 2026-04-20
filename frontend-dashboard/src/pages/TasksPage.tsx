import { useEffect, useState } from 'react';
import { tasks, disasters as disastersApi } from '../lib/api';
import { TaskFilterBar, TaskCard, TaskTableView, TaskKanbanView } from '../components/tasks';
import { MOCK_TASKS_EXTENDED } from '../lib/mockData';

interface TaskData {
  id: string;
  title: string;
  type: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: string;
  disasterId: string;
  disasterName: string;
  assignedVolunteer?: { name: string; id: string };
  requiredSkills: string[];
  estimatedHours?: number;
  maxVolunteers: number;
  currentVolunteers: number;
  description?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: Date;
}

interface Disaster {
  id: string;
  name: string;
}

export default function TasksPage() {
  const [allTasks, setAllTasks] = useState<TaskData[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskData[]>([]);
  const [disasterList, setDisasterList] = useState<Disaster[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'kanban'>('grid');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Load initial data
  useEffect(() => {
    loadTasks();
    loadDisasters();
  }, []);

  const loadTasks = async () => {
    try {
      const result = await tasks.list();
      // Use real data if available, fall back to mock
      const taskData = result.length > 0 ? result as TaskData[] : MOCK_TASKS_EXTENDED as TaskData[];
      setAllTasks(taskData);
      setFilteredTasks(taskData);
    } catch (err) {
      // Fall back to mock data on error
      const mockData = MOCK_TASKS_EXTENDED as TaskData[];
      setAllTasks(mockData);
      setFilteredTasks(mockData);
    }
  };

  const loadDisasters = async () => {
    try {
      const result = await disastersApi.list({ status: 'ACTIVE' });
      setDisasterList(result.length > 0 ? result : []);
    } catch (err) {
      // Silently fail if can't load disasters
      setDisasterList([]);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    const filtered = allTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        task.description?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredTasks(filtered);
    updateFilterCount(query ? 1 : 0);
  };

  // Handle filter changes
  const handleFilterChange = (filterObj: {
    status?: string[];
    urgency?: string[];
    type?: string[];
    disasterId?: string;
  }) => {
    let filtered = [...allTasks];

    if (filterObj.status?.length) {
      filtered = filtered.filter((t) => filterObj.status!.includes(t.status));
    }
    if (filterObj.urgency?.length) {
      filtered = filtered.filter((t) => filterObj.urgency!.includes(t.urgency));
    }
    if (filterObj.type?.length) {
      filtered = filtered.filter((t) => filterObj.type!.includes(t.type));
    }
    if (filterObj.disasterId) {
      filtered = filtered.filter((t) => t.disasterId === filterObj.disasterId);
    }

    setFilteredTasks(filtered);

    const filterCount = [
      filterObj.status?.length || 0,
      filterObj.urgency?.length || 0,
      filterObj.type?.length || 0,
      filterObj.disasterId ? 1 : 0,
    ].reduce((a, b) => a + b, 0);

    updateFilterCount(filterCount);
  };

  // Handle sort changes
  const handleSortChange = (sortBy: string) => {
    let sorted = [...filteredTasks];

    switch (sortBy) {
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        break;
      case 'critical':
        const urgencyRank: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        sorted.sort((a, b) => (urgencyRank[a.urgency] || 99) - (urgencyRank[b.urgency] || 99));
        break;
      case 'assigned':
        sorted.sort((a, b) => (b.assignedVolunteer ? 1 : 0) - (a.assignedVolunteer ? 1 : 0));
        break;
      case 'completed':
        sorted.sort((a, b) => (b.status === 'COMPLETED' ? 1 : 0) - (a.status === 'COMPLETED' ? 1 : 0));
        break;
      default: // newest
        sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    setFilteredTasks(sorted);
  };

  const updateFilterCount = (count: number) => {
    setActiveFilterCount(count);
  };

  // Handle task selection
  const handleSelectTask = (taskId: string, selected: boolean) => {
    setSelectedTasks((prev) =>
      selected ? [...prev, taskId] : prev.filter((id) => id !== taskId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedTasks(selected ? filteredTasks.map((t) => t.id) : []);
  };

  const handleViewDetails = (taskId: string) => {
    console.log('View details for task:', taskId);
    // TODO: Open task detail drawer
  };

  const handleAssignTask = (taskId: string) => {
    console.log('Assign task:', taskId);
    // TODO: Open assignment modal
  };

  const mappedDisasters = disasterList.map((d) => ({
    id: d.id,
    name: d.name,
  }));

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Tasks</h1>
        <div style={styles.viewModeButtons}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              ...styles.viewModeBtn,
              background: viewMode === 'grid' ? '#3b82f6' : '#f1f5f9',
              color: viewMode === 'grid' ? 'white' : '#475569',
            }}
          >
            📋 Grid
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              ...styles.viewModeBtn,
              background: viewMode === 'table' ? '#3b82f6' : '#f1f5f9',
              color: viewMode === 'table' ? 'white' : '#475569',
            }}
          >
            📊 Table
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            style={{
              ...styles.viewModeBtn,
              background: viewMode === 'kanban' ? '#3b82f6' : '#f1f5f9',
              color: viewMode === 'kanban' ? 'white' : '#475569',
            }}
          >
            📌 Kanban
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <TaskFilterBar
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        activeFilterCount={activeFilterCount}
        disasters={mappedDisasters}
      />

      {/* Bulk actions bar (shown when tasks are selected) */}
      {selectedTasks.length > 0 && (
        <div style={styles.bulkActionsBar}>
          <span style={styles.bulkActionText}>
            {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
          </span>
          <button style={styles.bulkActionBtn}>🔄 Change Status</button>
          <button style={styles.bulkActionBtn}>👥 Bulk Assign</button>
          <button style={styles.bulkActionBtn}>🗑️ Delete</button>
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'grid' && (
        <div style={styles.gridContainer}>
          {filteredTasks.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>📭</span>
              <p style={styles.emptyText}>No tasks found</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                id={task.id}
                title={task.title}
                type={task.type}
                status={task.status}
                urgency={task.urgency}
                location={task.location}
                disasterName={task.disasterName}
                assignedVolunteer={task.assignedVolunteer}
                requiredSkills={task.requiredSkills}
                estimatedHours={task.estimatedHours}
                maxVolunteers={task.maxVolunteers}
                currentVolunteers={task.currentVolunteers}
                onViewDetails={handleViewDetails}
                onAssign={handleAssignTask}
              />
            ))
          )}
        </div>
      )}

      {viewMode === 'table' && (
        <TaskTableView
          tasks={filteredTasks.map((t) => ({
            id: t.id,
            title: t.title,
            type: t.type,
            status: t.status,
            urgency: t.urgency,
            disasterName: t.disasterName,
            assignedVolunteer: t.assignedVolunteer,
            estimatedHours: t.estimatedHours,
            currentVolunteers: t.currentVolunteers,
            maxVolunteers: t.maxVolunteers,
          }))}
          selectedTasks={selectedTasks}
          onSelectTask={handleSelectTask}
          onSelectAll={handleSelectAll}
          onViewDetails={handleViewDetails}
          onAssign={handleAssignTask}
        />
      )}

      {viewMode === 'kanban' && (
        <TaskKanbanView
          tasks={filteredTasks.map((t) => ({
            id: t.id,
            title: t.title,
            type: t.type,
            status: t.status as 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
            urgency: t.urgency,
            assignedVolunteer: t.assignedVolunteer,
            currentVolunteers: t.currentVolunteers,
            maxVolunteers: t.maxVolunteers,
          }))}
          onViewDetails={handleViewDetails}
          onAssign={handleAssignTask}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    margin: 0,
    fontSize: '1.875rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  viewModeButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  viewModeBtn: {
    padding: '0.625rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  bulkActionsBar: {
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  bulkActionText: {
    fontWeight: 600,
    color: '#1e40af',
    fontSize: '0.875rem',
  },
  bulkActionBtn: {
    padding: '0.5rem 1rem',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  emptyState: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    color: '#94a3b8',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  emptyText: {
    margin: 0,
    fontSize: '1rem',
    color: '#64748b',
  },
};
