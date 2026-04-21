import { useEffect } from 'react';
import { startBackgroundSync, stopBackgroundSync } from '../services/backgroundSyncService';
import { useOfflineStore } from '../stores/offlineStore';
import { getSyncQueue } from '../lib/db';

/**
 * Hook for managing background sync
 * Automatically syncs every 60 seconds when online
 * and immediately when connection is restored
 */
export function useBackgroundSync() {
  const setSyncInProgress = useOfflineStore((state) => state.setSyncInProgress);
  const setLastSyncTime = useOfflineStore((state) => state.setLastSyncTime);
  const updatePendingCount = useOfflineStore((state) => state.updatePendingCount);

  useEffect(() => {
    // Start background sync service
    const cleanup = startBackgroundSync({
      interval: 60000, // 60 seconds
      onSyncStart: () => {
        setSyncInProgress(true);
      },
      onSyncComplete: async (result) => {
        setSyncInProgress(false);
        setLastSyncTime(new Date());
        
        // Update pending count from DB
        const queue = await getSyncQueue();
        updatePendingCount(queue.length);

        // Log sync result
        if (result.synced > 0 || result.failed > 0) {
          console.log(
            `[BackgroundSync] Synced: ${result.synced}, Failed: ${result.failed}`
          );
        }
      },
      onSyncError: (error) => {
        setSyncInProgress(false);
        console.error('[BackgroundSync] Sync error:', error);
      },
    });

    return () => {
      cleanup();
      stopBackgroundSync();
    };
  }, [setSyncInProgress, setLastSyncTime, updatePendingCount]);
}
