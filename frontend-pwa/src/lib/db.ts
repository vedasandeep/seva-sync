import { openDB, DBSchema, IDBPDatabase } from 'idb';

/**
 * IndexedDB Schema for offline storage
 */
interface SevasyncDB extends DBSchema {
  tasks: {
    key: string;
    value: {
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
    };
    indexes: { 'by-status': string; 'by-sync': string };
  };
  syncQueue: {
    key: number;
    value: {
      id?: number;
      action: 'accept_task' | 'complete_task' | 'update_location' | 'wellness_checkin';
      payload: Record<string, unknown>;
      createdAt: string;
      retries: number;
    };
  };
  volunteer: {
    key: string;
    value: {
      id: string;
      name: string;
      phone: string;
      skills: string[];
      token: string;
      currentLat?: number;
      currentLon?: number;
      lastSyncAt?: string;
    };
  };
}

let db: IDBPDatabase<SevasyncDB> | null = null;

/**
 * Initialize IndexedDB
 */
export async function initDB(): Promise<IDBPDatabase<SevasyncDB>> {
  if (db) return db;

  db = await openDB<SevasyncDB>('sevasync-offline', 1, {
    upgrade(database) {
      // Tasks store
      const taskStore = database.createObjectStore('tasks', { keyPath: 'id' });
      taskStore.createIndex('by-status', 'status');
      taskStore.createIndex('by-sync', 'syncStatus');

      // Sync queue store
      database.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });

      // Volunteer profile store
      database.createObjectStore('volunteer', { keyPath: 'id' });
    },
  });

  return db;
}

/**
 * Get database instance
 */
export async function getDB(): Promise<IDBPDatabase<SevasyncDB>> {
  if (!db) {
    return initDB();
  }
  return db;
}

// ============================================
// TASKS
// ============================================

export async function saveTasks(tasks: SevasyncDB['tasks']['value'][]) {
  const database = await getDB();
  const tx = database.transaction('tasks', 'readwrite');
  await Promise.all([
    ...tasks.map((task) => tx.store.put({ ...task, syncStatus: 'synced', updatedAt: new Date().toISOString() })),
    tx.done,
  ]);
}

export async function getTask(id: string) {
  const database = await getDB();
  return database.get('tasks', id);
}

export async function getAllTasks() {
  const database = await getDB();
  return database.getAll('tasks');
}

export async function getTasksByStatus(status: string) {
  const database = await getDB();
  return database.getAllFromIndex('tasks', 'by-status', status);
}

export async function updateTaskOffline(id: string, updates: Partial<SevasyncDB['tasks']['value']>) {
  const database = await getDB();
  const task = await database.get('tasks', id);
  if (task) {
    await database.put('tasks', {
      ...task,
      ...updates,
      syncStatus: 'pending',
      updatedAt: new Date().toISOString(),
    });
  }
}

// ============================================
// SYNC QUEUE
// ============================================

export async function addToSyncQueue(action: SevasyncDB['syncQueue']['value']['action'], payload: Record<string, unknown>) {
  const database = await getDB();
  await database.add('syncQueue', {
    action,
    payload,
    createdAt: new Date().toISOString(),
    retries: 0,
  });
}

export async function getSyncQueue() {
  const database = await getDB();
  return database.getAll('syncQueue');
}

export async function removeSyncItem(id: number) {
  const database = await getDB();
  await database.delete('syncQueue', id);
}

export async function incrementRetry(id: number) {
  const database = await getDB();
  const item = await database.get('syncQueue', id);
  if (item) {
    await database.put('syncQueue', { ...item, retries: item.retries + 1 });
  }
}

// ============================================
// VOLUNTEER PROFILE
// ============================================

export async function saveVolunteer(volunteer: SevasyncDB['volunteer']['value']) {
  const database = await getDB();
  await database.put('volunteer', volunteer);
}

export async function getVolunteer() {
  const database = await getDB();
  const all = await database.getAll('volunteer');
  return all[0] || null;
}

export async function clearVolunteer() {
  const database = await getDB();
  await database.clear('volunteer');
}

export async function updateVolunteerLocation(lat: number, lon: number) {
  const database = await getDB();
  const volunteer = await getVolunteer();
  if (volunteer) {
    await database.put('volunteer', { ...volunteer, currentLat: lat, currentLon: lon });
  }
}
