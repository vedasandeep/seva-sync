import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SyncQueueItem {
  id?: number;
  action: 'accept_task' | 'complete_task' | 'update_location' | 'wellness_checkin';
  payload: Record<string, unknown>;
  createdAt: string;
  retries: number;
}

interface OfflineState {
  isOffline: boolean;
  syncQueue: SyncQueueItem[];
  pendingSyncCount: number;
  lastSyncTime: Date | null;
  syncInProgress: boolean;
  conflictItems: string[]; // IDs of items with conflicts
  
  // Actions
  setIsOffline: (offline: boolean) => void;
  addToQueue: (item: Omit<SyncQueueItem, 'id'>) => void;
  removeFromQueue: (id: number) => void;
  clearQueue: () => void;
  setSyncInProgress: (inProgress: boolean) => void;
  setLastSyncTime: (time: Date | null) => void;
  updatePendingCount: (count: number) => void;
  setConflictItems: (items: string[]) => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set) => ({
      isOffline: !navigator.onLine,
      syncQueue: [],
      pendingSyncCount: 0,
      lastSyncTime: null,
      syncInProgress: false,
      conflictItems: [],

      setIsOffline: (offline) => set({ isOffline: offline }),

      addToQueue: (item) =>
        set((state) => ({
          syncQueue: [...state.syncQueue, { ...item, id: Date.now() }],
          pendingSyncCount: state.syncQueue.length + 1,
        })),

      removeFromQueue: (id) =>
        set((state) => ({
          syncQueue: state.syncQueue.filter((item) => item.id !== id),
          pendingSyncCount: Math.max(0, state.syncQueue.length - 1),
        })),

      clearQueue: () =>
        set({
          syncQueue: [],
          pendingSyncCount: 0,
        }),

      setSyncInProgress: (inProgress) => set({ syncInProgress: inProgress }),

      setLastSyncTime: (time) => set({ lastSyncTime: time }),

      updatePendingCount: (count) => set({ pendingSyncCount: count }),

      setConflictItems: (items) => set({ conflictItems: items }),
    }),
    {
      name: 'offline-store',
      version: 1,
    }
  )
);
