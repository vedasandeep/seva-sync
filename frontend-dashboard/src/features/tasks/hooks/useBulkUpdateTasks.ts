import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface BulkUpdatePayload {
  taskIds: string[];
  status?: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type?: string;
  assignedVolunteerId?: string;
  archived?: boolean;
}

interface BulkUpdateResponse {
  message: string;
  updated: number;
  tasks: any[];
}

async function bulkUpdateTasks(payload: BulkUpdatePayload): Promise<BulkUpdateResponse> {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/tasks/bulk-update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error('Failed to update tasks');
  return response.json();
}

export const useBulkUpdateTasks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUpdateTasks,
    onSuccess: () => {
      // Invalidate task queries to refetch
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    retry: 1,
  });
};
