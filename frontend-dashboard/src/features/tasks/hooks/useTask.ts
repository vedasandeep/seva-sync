import { useQuery } from '@tanstack/react-query';
import { Task } from './useTasks';

interface TaskDetail extends Task {
  disaster: {
    id: string;
    name: string;
    type: string;
    status: string;
  };
  creator?: {
    id: string;
    name: string;
    role: string;
    organization: string;
  };
  taskLogs?: Array<{
    id: string;
    hoursLogged: number;
    notes?: string;
    gpsLat?: number;
    gpsLng?: number;
    proofMediaUrl?: string;
    syncStatus: string;
    syncedAt: Date;
    volunteer?: {
      id: string;
      name: string;
    };
    createdAt: Date;
  }>;
}

const QUERY_KEY = ['tasks', 'detail'];

async function fetchTask(taskId: string): Promise<TaskDetail> {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/tasks/${taskId}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) throw new Error('Failed to fetch task');
  const data = await response.json();
  const task = data.task || data;

  return {
    ...task,
    createdAt: new Date(task.createdAt),
    assignedAt: task.assignedAt ? new Date(task.assignedAt) : undefined,
    completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
    taskLogs: (task.taskLogs || []).map((log: any) => ({
      ...log,
      syncedAt: new Date(log.syncedAt),
      createdAt: new Date(log.createdAt),
    })),
  };
}

export const useTask = (taskId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, taskId],
    queryFn: () => fetchTask(taskId),
    enabled: !!taskId, // Only fetch if taskId is provided
    refetchInterval: 60000, // 60 seconds
    staleTime: 30000, // 30 seconds
    retry: 1,
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
