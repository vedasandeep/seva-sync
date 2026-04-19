import { useQuery } from '@tanstack/react-query';

export interface DashboardSummary {
  activeDasasters: number;
  activeVolunteers: number;
  tasksCompletedToday: number;
  pendingTasks: number;
  burnoutAlerts: number;
  ivrCallsToday: number;
  syncFailures: number;
  avgResponseTime: string;
}

const QUERY_KEY = ['dashboard', 'summary'];

async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/dashboard/summary', {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) throw new Error('Failed to fetch summary');
  return response.json();
}

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchDashboardSummary,
    refetchInterval: 60000, // 60 seconds
    staleTime: 30000, // 30 seconds
    retry: 1,
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
