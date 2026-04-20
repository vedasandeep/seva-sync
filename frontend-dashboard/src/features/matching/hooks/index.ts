import { useQuery } from '@tanstack/react-query';

// API client for matching
const matchingApi = {
  findMatches: async (taskId: string, radiusKm?: number) => {
    let url = `/api/tasks/${taskId}/matches`;
    if (radiusKm) url += `?radiusKm=${radiusKm}`;
    const response = await fetch(url);
    return response.json();
  },

  getMatchingMap: async (taskId: string, radiusKm?: number) => {
    let url = `/api/tasks/${taskId}/nearby-volunteers`;
    if (radiusKm) url += `?radiusKm=${radiusKm}`;
    const response = await fetch(url);
    return response.json();
  },
};

/**
 * Hook to fetch matching volunteers for a specific task
 * Refetch interval: 60s
 */
export const useTaskMatches = (taskId: string, radiusKm?: number) => {
  return useQuery({
    queryKey: ['task-matches', taskId, radiusKm],
    queryFn: () => matchingApi.findMatches(taskId, radiusKm),
    staleTime: 30000, // 30s
    gcTime: 600000, // 10min
    refetchInterval: 60000, // 60s
    enabled: !!taskId,
  });
};

/**
 * Hook to fetch matching visualization data for map
 * Refetch interval: 60s
 */
export const useMatchingMap = (taskId: string, radiusKm?: number) => {
  return useQuery({
    queryKey: ['matching-map', taskId, radiusKm],
    queryFn: () => matchingApi.getMatchingMap(taskId, radiusKm),
    staleTime: 30000, // 30s
    gcTime: 600000, // 10min
    refetchInterval: 60000, // 60s
    enabled: !!taskId,
  });
};
