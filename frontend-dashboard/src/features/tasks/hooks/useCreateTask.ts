import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface CreateTaskPayload {
  disasterId: string;
  title: string;
  description?: string;
  type: 'RESCUE' | 'MEDICAL' | 'FOOD_DISTRIBUTION' | 'SHELTER' | 'LOGISTICS' | 'COMMUNICATION' | 'TRANSPORT' | 'SUPPLY_COLLECTION' | 'SAFETY' | 'OTHER';
  requiredSkills?: string[];
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  latitude: number;
  longitude: number;
  estimatedHours?: number;
}

interface CreateTaskResponse {
  message: string;
  task: any;
}

async function createTask(payload: CreateTaskPayload): Promise<CreateTaskResponse> {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error('Failed to create task');
  return response.json();
}

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Invalidate task queries to refetch
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    retry: 1,
  });
};
