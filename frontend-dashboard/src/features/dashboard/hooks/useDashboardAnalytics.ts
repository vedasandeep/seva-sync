import { useQuery } from '@tanstack/react-query';

export interface DashboardAnalytics {
  taskCompletion: Array<{ date: string; completed: number; pending: number }>;
  volunteerActivity: Array<{ date: string; active: number; inactive: number }>;
  disasterDistribution: Array<{ name: string; value: number }>;
  burnoutRisk: Array<{ level: string; count: number }>;
}

const QUERY_KEY = ['dashboard', 'analytics'];

async function fetchDashboardAnalytics(): Promise<DashboardAnalytics> {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/dashboard/analytics', {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
}

export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchDashboardAnalytics,
    refetchInterval: 60000, // 60 seconds
    staleTime: 30000, // 30 seconds
    retry: 1,
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
