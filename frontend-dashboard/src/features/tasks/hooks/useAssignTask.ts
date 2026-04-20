import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface AssignTaskPayload {
  volunteerId: string;
}

interface AssignTaskResponse {
  message: string;
  task: any;
}

async function assignTask(taskId: string, payload: AssignTaskPayload): Promise<AssignTaskResponse> {
  const token = localStorage.getItem('token');
  const response = await fetch(`/api/tasks/${taskId}/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error('Failed to assign task');
  return response.json();
}

export const useAssignTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { taskId: string; payload: AssignTaskPayload }) =>
      assignTask(params.taskId, params.payload),
    onSuccess: (_, variables) => {
      // Invalidate specific task and tasks list
      queryClient.invalidateQueries({ queryKey: ['tasks', 'detail', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    retry: 1,
  });
};
