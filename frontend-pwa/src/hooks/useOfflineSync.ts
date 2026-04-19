import { useCallback, useState } from 'react';
import { processQueue } from '../lib/offline-sync';
import { useOfflineStore } from '../stores/offlineStore';
import { getVolunteer } from '../lib/db';

/**
 * Hook for triggering and monitoring sync operations
 */
export function useOfflineSync() {
  const [syncing, setSyncing] = useState(false);
  const setSyncInProgress = useOfflineStore((state) => state.setSyncInProgress);
  const setLastSyncTime = useOfflineStore((state) => state.setLastSyncTime);
  const updatePendingCount = useOfflineStore((state) => state.updatePendingCount);
  const pendingSyncCount = useOfflineStore((state) => state.pendingSyncCount);

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
      updatePendingCount(Math.max(0, pendingSyncCount - (result.synced + result.failed)));

      return result;
    } finally {
      setSyncing(false);
      setSyncInProgress(false);
    }
  }, [syncing, setSyncInProgress, setLastSyncTime, updatePendingCount, pendingSyncCount]);

  return {
    syncNow,
    syncing,
    pendingSyncCount,
  };
}
