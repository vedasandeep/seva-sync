import { useCallback } from 'react';
import { useTasksStore } from '../stores/tasksStore';
import { getAllTasks, updateTaskOffline } from '../../../lib/db';

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

/**
 * Hook for managing tasks with local store
 */
export function useTasks() {
  const tasks = useTasksStore((state) => state.tasks);
  const setTasks = useTasksStore((state) => state.setTasks);
  const updateTask = useTasksStore((state) => state.updateTask);
  const lastFetch = useTasksStore((state) => state.lastFetch);
  const setLastFetch = useTasksStore((state) => state.setLastFetch);

  const refresh = useCallback(async () => {
    const allTasks = await getAllTasks();
    setTasks(allTasks);
    setLastFetch(new Date());
  }, [setTasks, setLastFetch]);

  const loadFromDB = useCallback(async () => {
    const allTasks = await getAllTasks();
    setTasks(allTasks);
  }, [setTasks]);

  const updateTaskLocal = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      // Update in store
      updateTask(taskId, updates);
      // Update in DB
      await updateTaskOffline(taskId, updates);
    },
    [updateTask]
  );

  return {
    tasks,
    refresh,
    loadFromDB,
    updateTask: updateTaskLocal,
    lastFetch,
  };
}
