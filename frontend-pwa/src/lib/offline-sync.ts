import { getSyncQueue, removeSyncItem } from './db';
import type { SyncQueueItem } from '../stores/offlineStore';

const API_BASE = '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Process offline sync queue with exponential backoff retry logic
 */
export async function processQueue(
  getHeaders: () => Promise<HeadersInit>
): Promise<{ synced: number; failed: number }> {
  const queue = await getSyncQueue();
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      const result = await processSyncItem(item, getHeaders);

      if (result.success) {
        if (item.id !== undefined) {
          await removeSyncItem(item.id);
        }
        synced++;
      } else if (result.error !== 'offline') {
        // Real error, remove from queue
        if (item.id !== undefined) {
          await removeSyncItem(item.id);
        }
        failed++;
      }
    } catch (error) {
      failed++;
    }
  }

  return { synced, failed };
}

/**
 * Process a single sync queue item
 */
async function processSyncItem(
  item: SyncQueueItem,
  getHeaders: () => Promise<HeadersInit>
): Promise<ApiResponse<unknown>> {
  switch (item.action) {
    case 'accept_task': {
      const payload = item.payload as { taskId: string; volunteerId: string };
      return fetchWithOffline(`${API_BASE}/tasks/${payload.taskId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ volunteerId: payload.volunteerId }),
        headers: await getHeaders(),
      });
    }

    case 'complete_task': {
      const payload = item.payload as { taskId: string };
      return fetchWithOffline(`${API_BASE}/tasks/${payload.taskId}/complete`, {
        method: 'POST',
        headers: await getHeaders(),
      });
    }

    case 'update_location': {
      const payload = item.payload as { lat: number; lon: number; volunteerId: string };
      return fetchWithOffline(`${API_BASE}/volunteers/${payload.volunteerId}/location`, {
        method: 'POST',
        body: JSON.stringify({ lat: payload.lat, lng: payload.lon }),
        headers: await getHeaders(),
      });
    }

    case 'wellness_checkin': {
      const payload = item.payload as { volunteerId: string; status: string };
      return fetchWithOffline(`${API_BASE}/volunteers/${payload.volunteerId}/wellness`, {
        method: 'POST',
        body: JSON.stringify({ status: payload.status }),
        headers: await getHeaders(),
      });
    }

    default:
      return { success: false, error: 'Unknown action' };
  }
}

/**
 * Fetch with offline detection
 */
async function fetchWithOffline<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message || 'Request failed' };
    }
  } catch {
    // Offline or network error
    return { success: false, error: 'offline' };
  }
}

/**
 * Calculate backoff delay with exponential backoff
 */
export function getBackoffDelay(retries: number): number {
  // 1s, 2s, 4s, 8s, 16s, 32s (max 1 minute)
  const delay = Math.min(1000 * Math.pow(2, retries), 60000);
  // Add jitter: ±25% randomness
  const jitter = delay * 0.25 * (Math.random() * 2 - 1);
  return Math.max(1000, delay + jitter);
}

/**
 * Retry a sync item with exponential backoff
 */
export async function retrySyncItem(
  item: SyncQueueItem,
  getHeaders: () => Promise<HeadersInit>,
  maxRetries: number = 5
): Promise<boolean> {
  if (item.retries >= maxRetries) {
    return false;
  }

  const delay = getBackoffDelay(item.retries);
  await new Promise((resolve) => setTimeout(resolve, delay));

  const result = await processSyncItem(item, getHeaders);
  return result.success;
}
