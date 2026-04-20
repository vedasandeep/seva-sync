import { useQuery } from '@tanstack/react-query';

export interface TaskActivity {
  id: string;
  type: 'created' | 'assigned' | 'started' | 'updated' | 'priority_changed';
  title: string;
  actor: string;
  timestamp: Date;
  description: string;
  severity?: string;
}

const QUERY_KEY = ['tasks', 'activity'];

async function fetchTaskActivity(taskId: string): Promise<TaskActivity[]> {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/tasks/${taskId}/activity`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) throw new Error('Failed to fetch task activity');
  const data = await response.json();

  return (data.activity || []).map((event: any) => ({
    ...event,
    timestamp: new Date(event.timestamp),
  }));
}

export const useTaskActivity = (taskId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, taskId],
    queryFn: () => fetchTaskActivity(taskId),
    enabled: !!taskId, // Only fetch if taskId is provided
    refetchInterval: 60000, // 60 seconds
    staleTime: 30000, // 30 seconds
    retry: 1,
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
