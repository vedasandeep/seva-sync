import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// API client wrapper for volunteers
const volunteersApi = {
  list: async (filters?: any) => {
    // Will be replaced with actual API call
    const response = await fetch(`/api/volunteers?${new URLSearchParams(filters || {})}`);
    return response.json();
  },
  
  getById: async (id: string) => {
    const response = await fetch(`/api/volunteers/${id}`);
    return response.json();
  },

  getMetrics: async (id: string) => {
    const response = await fetch(`/api/volunteers/${id}/metrics`);
    return response.json();
  },

  getActivity: async (id: string, days: number = 30) => {
    const response = await fetch(`/api/volunteers/${id}/activity?days=${days}`);
    return response.json();
  },

  getWellnessHistory: async (id: string, days: number = 30) => {
    const response = await fetch(`/api/volunteers/${id}/wellness?days=${days}`);
    return response.json();
  },

  submitWellnessCheckin: async (id: string, data: any) => {
    const response = await fetch(`/api/volunteers/${id}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getBurnoutAnalytics: async (disasterId?: string) => {
    const response = await fetch(
      `/api/matching/burnout-risks${disasterId ? `?disasterId=${disasterId}` : ''}`
    );
    return response.json();
  },

  getLocations: async (disasterId?: string, radiusKm?: number) => {
    let url = '/api/volunteers/nearby';
    const params = new URLSearchParams();
    if (disasterId) params.append('disasterId', disasterId);
    if (radiusKm) params.append('radiusKm', radiusKm.toString());
    if (params.toString()) url += `?${params.toString()}`;
    const response = await fetch(url);
    return response.json();
  },

  getHeatmap: async (disasterId: string, gridSizeKm: number = 1) => {
    const response = await fetch(
      `/api/volunteers/heatmap?disasterId=${disasterId}&gridSizeKm=${gridSizeKm}`
    );
    return response.json();
  },
};

/**
 * Hook to fetch list of volunteers with optional filters
 * Refetch interval: 60s
 */
export const useVolunteers = (filters?: any) => {
  return useQuery({
    queryKey: ['volunteers', filters],
    queryFn: () => volunteersApi.list(filters),
    staleTime: 30000, // 30s
    gcTime: 600000, // 10min
    refetchInterval: 60000, // 60s
  });
};

/**
 * Hook to fetch single volunteer details
 * Refetch interval: 60s
 */
export const useVolunteer = (volunteerId: string) => {
  return useQuery({
    queryKey: ['volunteer', volunteerId],
    queryFn: () => volunteersApi.getById(volunteerId),
    staleTime: 30000, // 30s
    gcTime: 600000, // 10min
    refetchInterval: 60000, // 60s
    enabled: !!volunteerId,
  });
};

/**
 * Hook to fetch volunteer metrics (workload, assignments, etc)
 * Refetch interval: 60s
 */
export const useVolunteerMetrics = (volunteerId: string) => {
  return useQuery({
    queryKey: ['volunteer-metrics', volunteerId],
    queryFn: () => volunteersApi.getMetrics(volunteerId),
    staleTime: 30000, // 30s
    gcTime: 600000, // 10min
    refetchInterval: 60000, // 60s
    enabled: !!volunteerId,
  });
};

/**
 * Hook to fetch volunteer activity timeline (30-day default)
 * Refetch interval: 60s
 */
export const useVolunteerActivity = (volunteerId: string, days: number = 30) => {
  return useQuery({
    queryKey: ['volunteer-activity', volunteerId, days],
    queryFn: () => volunteersApi.getActivity(volunteerId, days),
    staleTime: 30000, // 30s
    gcTime: 600000, // 10min
    refetchInterval: 60000, // 60s
    enabled: !!volunteerId,
  });
};

/**
 * Hook to fetch wellness check-in history (30-day default)
 * Refetch interval: 60s
 */
export const useWellnessHistory = (volunteerId: string, days: number = 30) => {
  return useQuery({
    queryKey: ['wellness-history', volunteerId, days],
    queryFn: () => volunteersApi.getWellnessHistory(volunteerId, days),
    staleTime: 30000, // 30s
    gcTime: 600000, // 10min
    refetchInterval: 60000, // 60s
    enabled: !!volunteerId,
  });
};

/**
 * Hook to submit wellness check-in
 */
export const useWellnessCheckIn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ volunteerId, data }: { volunteerId: string; data: any }) =>
      volunteersApi.submitWellnessCheckin(volunteerId, data),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['wellness-history', variables.volunteerId] });
      queryClient.invalidateQueries({ queryKey: ['volunteer', variables.volunteerId] });
      queryClient.invalidateQueries({ queryKey: ['volunteer-metrics', variables.volunteerId] });
    },
  });
};

/**
 * Hook to fetch burnout analytics across all volunteers
 * Refetch interval: 60s
 */
export const useBurnoutAnalytics = (disasterId?: string) => {
  return useQuery({
    queryKey: ['burnout-analytics', disasterId],
    queryFn: () => volunteersApi.getBurnoutAnalytics(disasterId),
    staleTime: 30000, // 30s
    gcTime: 600000, // 10min
    refetchInterval: 60000, // 60s
  });
};

/**
 * Hook to fetch volunteer locations for map display
 * Refetch interval: 60s
 */
export const useVolunteerLocations = (disasterId?: string, radiusKm?: number) => {
  return useQuery({
    queryKey: ['volunteer-locations', disasterId, radiusKm],
    queryFn: () => volunteersApi.getLocations(disasterId, radiusKm),
    staleTime: 30000, // 30s
    gcTime: 600000, // 10min
    refetchInterval: 60000, // 60s
  });
};

/**
 * Hook to fetch volunteer density heatmap
 * Refetch interval: 60s
 */
export const useVolunteerHeatmap = (disasterId: string, gridSizeKm: number = 1) => {
  return useQuery({
    queryKey: ['volunteer-heatmap', disasterId, gridSizeKm],
    queryFn: () => volunteersApi.getHeatmap(disasterId, gridSizeKm),
    staleTime: 30000, // 30s
    gcTime: 600000, // 10min
    refetchInterval: 60000, // 60s
    enabled: !!disasterId,
  });
};
