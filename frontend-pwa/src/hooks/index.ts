import { useState, useEffect, useCallback } from 'react';
import { getVolunteer, getAllTasks } from '../lib/db';
import { syncPendingActions, isOnline } from '../lib/api';

/**
 * Hook for checking online/offline status
 */
export function useOnlineStatus() {
  const [online, setOnline] = useState(isOnline());

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return online;
}

/**
 * Hook for volunteer auth state
 */
export function useAuth() {
  const [volunteer, setVolunteer] = useState<{
    id: string;
    name: string;
    phone: string;
    skills: string[];
    token: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVolunteer().then((v) => {
      setVolunteer(v);
      setLoading(false);
    });
  }, []);

  const refresh = useCallback(async () => {
    const v = await getVolunteer();
    setVolunteer(v);
  }, []);

  return { volunteer, loading, refresh, isLoggedIn: !!volunteer };
}

/**
 * Hook for tasks from IndexedDB (offline-first)
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Array<{
    id: string;
    title: string;
    description?: string;
    urgency: string;
    status: string;
    syncStatus: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const t = await getAllTasks();
    setTasks(t);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tasks, loading, refresh };
}

/**
 * Hook for syncing pending actions when online
 */
export function useSync() {
  const online = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const sync = useCallback(async () => {
    if (!online || syncing) return { synced: 0, failed: 0 };
    
    setSyncing(true);
    try {
      const result = await syncPendingActions();
      setLastSync(new Date());
      return result;
    } finally {
      setSyncing(false);
    }
  }, [online, syncing]);

  // Auto-sync when coming online
  useEffect(() => {
    if (online) {
      sync();
    }
  }, [online, sync]);

  return { sync, syncing, lastSync, online };
}

/**
 * Hook for geolocation
 */
export function useGeolocation() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setError(null);
      },
      (err) => {
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { location, error, refresh };
}
