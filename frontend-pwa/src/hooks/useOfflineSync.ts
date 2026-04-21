import { useCallback, useState, useEffect } from 'react';
import { processQueue } from '../lib/offline-sync';
import { useOfflineStore } from '../stores/offlineStore';
import { getVolunteer, getSyncQueue } from '../lib/db';

/**
 * Hook for triggering and monitoring sync operations
 */
export function useOfflineSync() {
  const [syncing, setSyncing] = useState(false);
  const setSyncInProgress = useOfflineStore((state) => state.setSyncInProgress);
  const setLastSyncTime = useOfflineStore((state) => state.setLastSyncTime);
  const updatePendingCount = useOfflineStore((state) => state.updatePendingCount);
  const pendingSyncCount = useOfflineStore((state) => state.pendingSyncCount);

  // Sync pending count from IndexedDB on mount
  useEffect(() => {
    const syncPendingCount = async () => {
      const queue = await getSyncQueue();
      updatePendingCount(queue.length);
    };
    syncPendingCount();
  }, [updatePendingCount]);

  const syncNow = useCallback(async () => {
    if (syncing) return { synced: 0, failed: 0 };

    setSyncing(true);
    setSyncInProgress(true);

    try {
      // Get auth headers
      const volunteer = await getVolunteer();
      const headers: Record<string, string> = volunteer?.token
        ? {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${volunteer.token}`,
          }
        : { 'Content-Type': 'application/json' };

      const getHeaders = async () => headers;

      // Process the queue
      const result = await processQueue(getHeaders);

      // Update state
      setLastSyncTime(new Date());
      
      // Update pending count from DB
      const queue = await getSyncQueue();
      updatePendingCount(queue.length);

      return result;
    } finally {
      setSyncing(false);
      setSyncInProgress(false);
    }
  }, [syncing, setSyncInProgress, setLastSyncTime, updatePendingCount]);

  return {
    syncNow,
    syncing,
    pendingSyncCount,
  };
}
