import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { getVolunteer } from '../../../lib/db';

/**
 * Hook for volunteer auth state
 */
export function useAuth() {
  const volunteer = useAuthStore((state) => state.volunteer);
  const setVolunteer = useAuthStore((state) => state.setVolunteer);
  const loading = useAuthStore((state) => state.loading);
  const setLoading = useAuthStore((state) => state.setLoading);
  const error = useAuthStore((state) => state.error);
  const logout = useAuthStore((state) => state.logout);

  // Load volunteer from DB on mount
  useEffect(() => {
    const loadVolunteer = async () => {
      setLoading(true);
      try {
        const vol = await getVolunteer();
        if (vol) {
          setVolunteer(vol as any);
        }
      } finally {
        setLoading(false);
      }
    };

    loadVolunteer();
  }, [setLoading, setVolunteer]);

  return {
    volunteer,
    loading,
    error,
    isLoggedIn: !!volunteer,
    logout,
  };
}
