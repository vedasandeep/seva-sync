import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Task {
  id: string;
  title: string;
  description?: string;
  urgency: string;
  status: string;
  latitude?: number;
  longitude?: number;
  estimatedHours?: number;
  disasterName?: string;
  assignedAt?: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
  updatedAt: string;
}

interface TasksOfflineState {
  tasks: Task[];
  lastFetch: Date | null;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  setLastFetch: (time: Date | null) => void;
}

export const useTasksOfflineStore = create<TasksOfflineState>()(
  persist(
    (set) => ({
      tasks: [],
      lastFetch: null,

      setTasks: (tasks) => set({ tasks }),

      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  ...updates,
                  syncStatus: 'pending' as const,
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        })),

      removeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      setLastFetch: (time) => set({ lastFetch: time }),
    }),
    {
      name: 'tasks-offline-store',
      version: 1,
    }
  )
);
