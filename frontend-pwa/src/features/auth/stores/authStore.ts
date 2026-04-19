import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Volunteer {
  id: string;
  name: string;
  phone: string;
  skills: string[];
  token: string;
  currentLat?: number;
  currentLon?: number;
  lastSyncAt?: string;
}

interface AuthState {
  volunteer: Volunteer | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setVolunteer: (volunteer: Volunteer | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  updateLocation: (lat: number, lon: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      volunteer: null,
      loading: false,
      error: null,

      setVolunteer: (volunteer) => set({ volunteer, error: null }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      logout: () =>
        set({
          volunteer: null,
          error: null,
        }),

      updateLocation: (lat, lon) =>
        set((state) => ({
          volunteer: state.volunteer
            ? { ...state.volunteer, currentLat: lat, currentLon: lon }
            : null,
        })),
    }),
    {
      name: 'auth-store',
      version: 1,
    }
  )
);
