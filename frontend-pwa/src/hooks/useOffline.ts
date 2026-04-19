import { useEffect } from 'react';
import { useOfflineStore } from '../stores/offlineStore';

/**
 * Hook for detecting offline/online status
 * Provides isOffline and pendingSyncCount
 */
export function useOffline() {
  const isOffline = useOfflineStore((state) => state.isOffline);
  const pendingSyncCount = useOfflineStore((state) => state.pendingSyncCount);
  const setIsOffline = useOfflineStore((state) => state.setIsOffline);

  useEffect(() => {
    // Set initial state
    setIsOffline(!navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOffline]);

  return {
    isOffline,
    pendingSyncCount,
    isOnline: !isOffline,
  };
}
