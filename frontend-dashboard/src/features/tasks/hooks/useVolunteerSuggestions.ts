import { useQuery } from '@tanstack/react-query';

export interface VolunteerSuggestion {
  volunteerId: string;
  volunteer: {
    id: string;
    name: string;
    skills: string[];
    burnoutScore: number;
    isAvailable: boolean;
    currentLocation?: {
      lat: number;
      lng: number;
    };
    currentActiveTasks: number;
  };
  scoreBreakdown: {
    skillMatch: number;
    distanceScore: number;
    availabilityScore: number;
    burnoutScore: number;
    workloadScore: number;
    finalScore: number;
  };
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  ranking: number;
}

const QUERY_KEY = ['tasks', 'suggestions'];

async function fetchVolunteerSuggestions(taskId: string): Promise<VolunteerSuggestion[]> {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/tasks/${taskId}/suggestions`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) throw new Error('Failed to fetch volunteer suggestions');
  const data = await response.json();

  return data.suggestions || [];
}

export const useVolunteerSuggestions = (taskId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, taskId],
    queryFn: () => fetchVolunteerSuggestions(taskId),
    enabled: !!taskId, // Only fetch if taskId is provided
    refetchInterval: 60000, // 60 seconds
    staleTime: 30000, // 30 seconds
    retry: 1,
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
