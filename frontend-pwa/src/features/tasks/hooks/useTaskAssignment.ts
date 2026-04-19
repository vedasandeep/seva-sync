import { useCallback, useState } from 'react';
import { acceptTask, completeTask } from '../../../lib/api';
import { useTasks } from './useTasks';
import { useOffline } from '../../../hooks/useOffline';

/**
 * Hook for managing task assignments
 */
export function useTaskAssignment() {
  const { updateTask } = useTasks();
  const { isOffline } = useOffline();
  const [loading, setLoading] = useState(false);

  const handleAcceptTask = useCallback(
    async (taskId: string) => {
      setLoading(true);
      try {
        const result = await acceptTask(taskId);
        if (result.success) {
          // Update task status
          await updateTask(taskId, { status: 'IN_PROGRESS' });
          return { success: true, queued: (result.data as { queued?: boolean })?.queued };
        } else {
          return { success: false, error: result.error };
        }
      } finally {
        setLoading(false);
      }
    },
    [updateTask]
  );

  const handleCompleteTask = useCallback(
    async (taskId: string) => {
      setLoading(true);
      try {
        const result = await completeTask(taskId);
        if (result.success) {
          // Update task status
          await updateTask(taskId, { status: 'COMPLETED' });
          return { success: true, queued: (result.data as { queued?: boolean })?.queued };
        } else {
          return { success: false, error: result.error };
        }
      } finally {
        setLoading(false);
      }
    },
    [updateTask]
  );

  return {
    acceptTask: handleAcceptTask,
    completeTask: handleCompleteTask,
    loading,
    offline: isOffline,
  };
}
