import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  type?: string;
  requiredSkills?: string[];
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  latitude?: number;
  longitude?: number;
  estimatedHours?: number;
  status?: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

interface UpdateTaskResponse {
  message: string;
  task: any;
}

async function updateTask(taskId: string, payload: UpdateTaskPayload): Promise<UpdateTaskResponse> {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { taskId: string; payload: UpdateTaskPayload }) =>
      updateTask(params.taskId, params.payload),
    onSuccess: (_, variables) => {
      // Invalidate specific task and tasks list
      queryClient.invalidateQueries({ queryKey: ['tasks', 'detail', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    retry: 1,
  });
};
