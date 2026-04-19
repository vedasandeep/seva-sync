import { getVolunteer, saveTasks, addToSyncQueue, getSyncQueue, removeSyncItem, saveVolunteer, clearVolunteer } from './db';

const API_BASE = '/api';

/**
 * API Client with offline fallback
 */

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const volunteer = await getVolunteer();
  if (volunteer?.token) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${volunteer.token}`,
    };
  }
  return { 'Content-Type': 'application/json' };
}

async function fetchWithOffline<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: await getAuthHeaders(),
    });
    const data = await response.json();
    
    // Backend returns { message, ...rest } on success, { error, message } on failure
    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.message || 'Request failed' };
    }
  } catch {
    // Offline - return null and let caller handle
    return { success: false, error: 'offline' };
  }
}

// ============================================
// AUTH
// ============================================

export async function loginVolunteer(phone: string): Promise<ApiResponse<{ volunteer: { id: string; name: string; skills: string[] }; accessToken: string }>> {
  const result = await fetchWithOffline<{ volunteer: { id: string; name: string; skills: string[] }; accessToken: string }>(
    `${API_BASE}/auth/login-volunteer`,
    {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }
  );

  if (result.success && result.data) {
    // Save to IndexedDB
    await saveVolunteer({
      id: result.data.volunteer.id,
      name: result.data.volunteer.name,
      phone,
      skills: result.data.volunteer.skills || [],
      token: result.data.accessToken,
    });
  }

  return result;
}

export async function logout() {
  await clearVolunteer();
}

// ============================================
// TASKS
// ============================================

interface TaskResponse {
  tasks: { id: string; title: string; status: string; urgency: string }[];
  pagination?: { total: number; limit: number; offset: number };
}

export async function fetchTasks(): Promise<ApiResponse<{ id: string; title: string; status: string; urgency: string }[]>> {
  const volunteer = await getVolunteer();
  if (!volunteer) return { success: false, error: 'Not logged in' };

  const result = await fetchWithOffline<TaskResponse>(
    `${API_BASE}/tasks?assignedVolunteerId=${volunteer.id}`
  );

  if (result.success && result.data) {
    // Backend returns { tasks: [...], pagination: {...} }
    const tasksArray = result.data.tasks ?? [];
    await saveTasks(
      tasksArray.map((t) => ({
        ...t,
        syncStatus: 'synced' as const,
        updatedAt: new Date().toISOString(),
      }))
    );
    // Return just the tasks array for consistency
    return { success: true, data: tasksArray };
  }

  // On failure, return with empty data
  return { success: false, error: result.error };
}

interface NearbyTaskResponse {
  tasks: { id: string; title: string; status: string; urgency: string; distanceKm: number }[];
}

export async function fetchNearbyTasks(lat: number, lon: number, radiusKm: number = 10) {
  const result = await fetchWithOffline<NearbyTaskResponse>(
    `${API_BASE}/tasks/nearby?latitude=${lat}&longitude=${lon}&radiusKm=${radiusKm}`
  );

  if (result.success && result.data) {
    // Backend returns { tasks: [...] }
    const tasksArray = result.data.tasks ?? [];
    await saveTasks(
      tasksArray.map((t) => ({
        ...t,
        syncStatus: 'synced' as const,
        updatedAt: new Date().toISOString(),
      }))
    );
    return { success: true, data: tasksArray };
  }

  return result;
}

export async function acceptTask(taskId: string): Promise<ApiResponse<unknown>> {
  const volunteer = await getVolunteer();
  if (!volunteer) return { success: false, error: 'Not logged in' };

  const result = await fetchWithOffline(`${API_BASE}/tasks/${taskId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ volunteerId: volunteer.id }),
  });

  if (result.error === 'offline') {
    // Queue for later sync
    await addToSyncQueue('accept_task', { taskId, volunteerId: volunteer.id });
    return { success: true, data: { queued: true } };
  }

  return result;
}

export async function completeTask(taskId: string): Promise<ApiResponse<unknown>> {
  const result = await fetchWithOffline(`${API_BASE}/tasks/${taskId}/complete`, {
    method: 'POST',
  });

  if (result.error === 'offline') {
    await addToSyncQueue('complete_task', { taskId });
    return { success: true, data: { queued: true } };
  }

  return result;
}

// ============================================
// LOCATION
// ============================================

export async function updateLocation(lat: number, lon: number): Promise<ApiResponse<unknown>> {
  const volunteer = await getVolunteer();
  if (!volunteer) return { success: false, error: 'Not logged in' };

  // Backend expects { lat, lng } not { latitude, longitude }
  const result = await fetchWithOffline(`${API_BASE}/volunteers/${volunteer.id}/location`, {
    method: 'POST',
    body: JSON.stringify({ lat, lng: lon }),
  });

  if (result.error === 'offline') {
    await addToSyncQueue('update_location', { lat, lon });
    return { success: true, data: { queued: true } };
  }

  return result;
}

// ============================================
// SYNC
// ============================================

export async function syncPendingActions(): Promise<{ synced: number; failed: number }> {
  const queue = await getSyncQueue();
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      let result: ApiResponse<unknown>;

      switch (item.action) {
        case 'accept_task':
          result = await fetchWithOffline(`${API_BASE}/tasks/${item.payload.taskId}/assign`, {
            method: 'POST',
            body: JSON.stringify({ volunteerId: item.payload.volunteerId }),
          });
          break;
        case 'complete_task':
          result = await fetchWithOffline(`${API_BASE}/tasks/${item.payload.taskId}/complete`, {
            method: 'POST',
          });
          break;
        case 'update_location': {
          const volunteer = await getVolunteer();
          // Backend expects { lat, lng }
          result = await fetchWithOffline(`${API_BASE}/volunteers/${volunteer?.id}/location`, {
            method: 'POST',
            body: JSON.stringify({ lat: item.payload.lat, lng: item.payload.lon }),
          });
          break;
        }
        default:
          result = { success: false, error: 'Unknown action' };
      }

      if (result.success) {
        await removeSyncItem(item.id!);
        synced++;
      } else if (result.error !== 'offline') {
        // Real error, remove from queue
        await removeSyncItem(item.id!);
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}
