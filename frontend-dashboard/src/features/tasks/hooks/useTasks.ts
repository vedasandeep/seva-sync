import { useQuery } from '@tanstack/react-query';

export interface Task {
  id: string;
  disasterId: string;
  title: string;
  type: 'RESCUE' | 'MEDICAL' | 'FOOD_DISTRIBUTION' | 'SHELTER' | 'LOGISTICS' | 'COMMUNICATION' | 'TRANSPORT' | 'SUPPLY_COLLECTION' | 'SAFETY' | 'OTHER';
  description?: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  latitude: number;
  longitude: number;
  requiredSkills?: string[];
  estimatedHours?: number;
  assignedVolunteerId?: string;
  assignedVolunteer?: {
    id: string;
    name: string;
    skills: string[];
  };
  createdAt: Date;
  assignedAt?: Date;
  completedAt?: Date;
}

export interface TasksResponse {
  tasks: Task[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
}

interface TasksFilters {
  disasterId?: string;
  status?: string;
  urgency?: string;
  type?: string;
  assignedVolunteerId?: string;
  limit?: number;
  offset?: number;
}

const QUERY_KEY = ['tasks'];

async function fetchTasks(filters?: TasksFilters): Promise<TasksResponse> {
  const token = localStorage.getItem('token');
  
  // Build query string from filters
  const params = new URLSearchParams();
  if (filters?.disasterId) params.append('disasterId', filters.disasterId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.urgency) params.append('urgency', filters.urgency);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.assignedVolunteerId) params.append('assignedVolunteerId', filters.assignedVolunteerId);
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.offset) params.append('offset', String(filters.offset));

  const queryString = params.toString();
  const url = `/api/tasks${queryString ? '?' + queryString : ''}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) throw new Error('Failed to fetch tasks');
  const data = await response.json();
  
  return {
    tasks: (data.tasks || []).map((task: any) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      assignedAt: task.assignedAt ? new Date(task.assignedAt) : undefined,
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
    })),
    pagination: data.pagination || { total: 0, limit: 50, offset: 0, pages: 0 },
  };
}

export const useTasks = (filters?: TasksFilters) => {
  return useQuery({
    queryKey: filters ? [QUERY_KEY, filters] : QUERY_KEY,
    queryFn: () => fetchTasks(filters),
    refetchInterval: 60000, // 60 seconds
    staleTime: 30000, // 30 seconds
    retry: 1,
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
