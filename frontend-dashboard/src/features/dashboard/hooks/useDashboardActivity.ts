import { useQuery } from '@tanstack/react-query';

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
}

const QUERY_KEY = ['dashboard', 'activity'];

async function fetchDashboardActivity(): Promise<ActivityItem[]> {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/dashboard/activity', {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) throw new Error('Failed to fetch activity');
  const data = await response.json();
  return Array.isArray(data) ? data.map((item: any) => ({
    ...item,
    timestamp: new Date(item.timestamp),
  })) : [];
}

export const useDashboardActivity = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchDashboardActivity,
    refetchInterval: 60000, // 60 seconds
    staleTime: 30000, // 30 seconds
    retry: 1,
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
