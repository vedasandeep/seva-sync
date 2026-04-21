import { useCallback, useState, useEffect } from 'react';
import { getConflictTasks, markTaskSynced } from '../lib/db';
import { getVolunteer } from '../lib/db';

interface ConflictTask {
  id: string;
  title: string;
  status: string;
  urgency: string;
  description?: string;
  localVersion: {
    status: string;
    description?: string;
    updatedAt: string;
  };
  serverVersion: {
    status: string;
    description?: string;
    updatedAt: string;
    updatedBy?: string;
  };
}

/**
 * Hook for managing conflict resolution
 */
export function useConflictResolution() {
  const [conflicts, setConflicts] = useState<ConflictTask[]>([]);
  const [currentConflict, setCurrentConflict] = useState<ConflictTask | null>(null);
  const [resolving, setResolving] = useState(false);

  // Load conflicts on mount
  useEffect(() => {
    const loadConflicts = async () => {
      const conflictTasks = await getConflictTasks();
      // Transform to ConflictTask format (would need server data)
      // For now, just count them
      setConflicts(
        conflictTasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          urgency: t.urgency,
          description: t.description,
          localVersion: {
            status: t.status,
            description: t.description,
            updatedAt: t.updatedAt,
          },
          serverVersion: {
            status: t.status,
            description: t.description,
            updatedAt: t.lastUpdatedAt || t.updatedAt,
            updatedBy: t.updatedBy,
          },
        }))
      );
    };

    loadConflicts();
  }, []);

  const resolveConflict = useCallback(
    async (taskId: string, resolution: 'local' | 'server') => {
      setResolving(true);
      try {
        const volunteer = await getVolunteer();
        if (!volunteer?.token) {
          throw new Error('Not authenticated');
        }

        // Call backend to resolve conflict
        const response = await fetch('/api/v1/sync/conflict-resolution', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${volunteer.token}`,
          },
          body: JSON.stringify({
            taskId,
            resolution,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to resolve conflict');
        }

        // Update task as synced
        await markTaskSynced(taskId, data.task);

        // Remove from conflicts list
        setConflicts(conflicts.filter((c) => c.id !== taskId));
        setCurrentConflict(null);
      } finally {
        setResolving(false);
      }
    },
    [conflicts]
  );

  const showNextConflict = useCallback(() => {
    if (conflicts.length > 0) {
      setCurrentConflict(conflicts[0]);
    } else {
      setCurrentConflict(null);
    }
  }, [conflicts]);

  return {
    conflicts,
    currentConflict,
    resolveConflict,
    showNextConflict,
    resolving,
  };
}
