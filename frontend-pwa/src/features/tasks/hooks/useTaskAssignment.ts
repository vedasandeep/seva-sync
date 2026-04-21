import { useCallback, useState, useEffect } from 'react';
import { acceptTask, completeTask } from '../../../lib/api';
import { useTasks } from './useTasks';
import { useOffline } from '../../../hooks/useOffline';
import { getSyncQueue } from '../../../lib/db';
import { useOfflineStore } from '../../../stores/offlineStore';

/**
 * Hook for managing task assignments
 */
export function useTaskAssignment() {
  const { updateTask } = useTasks();
  const { isOffline } = useOffline();
  const [loading, setLoading] = useState(false);
  const updatePendingCount = useOfflineStore((state) => state.updatePendingCount);

  // Update pending count when offline status changes
  useEffect(() => {
    const updateCount = async () => {
      const queue = await getSyncQueue();
      updatePendingCount(queue.length);
    };
    updateCount();
  }, [isOffline, updatePendingCount]);

  const handleAcceptTask = useCallback(
    async (taskId: string) => {
      setLoading(true);
      try {
        const result = await acceptTask(taskId);
        if (result.success) {
          // Update task status
          await updateTask(taskId, { status: 'IN_PROGRESS' });
          
          // If queued offline, update pending count
          const queued = (result.data as { queued?: boolean })?.queued;
          if (queued) {
            const queue = await getSyncQueue();
            updatePendingCount(queue.length);
          }
          
          return { success: true, queued };
        } else {
          return { success: false, error: result.error };
        }
      } finally {
        setLoading(false);
      }
    },
    [updateTask, updatePendingCount]
  );

  const handleCompleteTask = useCallback(
    async (taskId: string) => {
      setLoading(true);
      try {
        const result = await completeTask(taskId);
        if (result.success) {
          // Update task status
          await updateTask(taskId, { status: 'COMPLETED' });
          
          // If queued offline, update pending count
          const queued = (result.data as { queued?: boolean })?.queued;
          if (queued) {
            const queue = await getSyncQueue();
            updatePendingCount(queue.length);
          }
          
          return { success: true, queued };
        } else {
          return { success: false, error: result.error };
        }
      } finally {
        setLoading(false);
      }
    },
    [updateTask, updatePendingCount]
  );

  return {
    acceptTask: handleAcceptTask,
    completeTask: handleCompleteTask,
    loading,
    offline: isOffline,
  };
}
