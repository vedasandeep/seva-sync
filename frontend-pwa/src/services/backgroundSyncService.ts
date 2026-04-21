import { getSyncQueue } from '../lib/db';
import { processQueue } from '../lib/offline-sync';
import { getVolunteer } from '../lib/db';

/**
 * Background sync service for automatic syncing
 */

let syncInterval: ReturnType<typeof setInterval> | null = null;
let isSyncing = false;

interface BackgroundSyncOptions {
  interval?: number; // Interval in milliseconds, default 60000 (60 seconds)
  getHeaders?: () => Promise<HeadersInit>;
  onSyncStart?: () => void;
  onSyncComplete?: (result: { synced: number; failed: number }) => void;
  onSyncError?: (error: Error) => void;
}

/**
 * Start background sync service
 */
export function startBackgroundSync(options: BackgroundSyncOptions = {}) {
  const {
    interval = 60000,
    getHeaders: customGetHeaders,
    onSyncStart,
    onSyncComplete,
    onSyncError,
  } = options;

  // Clean up any existing interval
  if (syncInterval) {
    clearInterval(syncInterval);
  }

  // Function to perform sync
  const performSync = async () => {
    if (isSyncing || !navigator.onLine) {
      return; // Skip if already syncing or offline
    }

    try {
      isSyncing = true;
      onSyncStart?.();

      // Get auth headers
      let headers: HeadersInit;
      if (customGetHeaders) {
        headers = await customGetHeaders();
      } else {
        const volunteer = await getVolunteer();
        headers = volunteer?.token
          ? {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${volunteer.token}`,
            }
          : { 'Content-Type': 'application/json' };
      }

      const getHeaders = async () => headers;

      // Process the queue
      const result = await processQueue(getHeaders);
      onSyncComplete?.(result);
    } catch (error) {
      if (error instanceof Error) {
        onSyncError?.(error);
      }
    } finally {
      isSyncing = false;
    }
  };

  // Perform sync immediately if there are pending items
  const checkAndSync = async () => {
    const queue = await getSyncQueue();
    if (queue.length > 0) {
      await performSync();
    }
  };

  // Start periodic sync
  syncInterval = setInterval(performSync, interval);

  // Also perform sync on reconnect
  const handleOnline = () => checkAndSync();
  window.addEventListener('online', handleOnline);

  // Return cleanup function
  return () => {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
    window.removeEventListener('online', handleOnline);
  };
}

/**
 * Stop background sync service
 */
export function stopBackgroundSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

/**
 * Check if sync is currently in progress
 */
export function isSyncInProgress(): boolean {
  return isSyncing;
}

/**
 * Trigger manual sync (useful for user-initiated syncs)
 */
export async function triggerManualSync(getHeaders: () => Promise<HeadersInit>) {
  if (isSyncing) {
    return { synced: 0, failed: 0 };
  }

  isSyncing = true;
  try {
    const result = await processQueue(getHeaders);
    return result;
  } finally {
    isSyncing = false;
  }
}
