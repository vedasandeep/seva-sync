import React from 'react';
import { TaskCard } from './TaskCard';
import { Spinner } from '../../../components/ui/Spinner';

interface Task {
  id: string;
  title: string;
  description?: string;
  urgency: string;
  status: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  empty?: string;
  onTaskAccept?: (taskId: string) => void | Promise<void>;
  onTaskComplete?: (taskId: string) => void | Promise<void>;
  loadingTaskId?: string | null;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading = false,
  empty = 'No tasks found',
  onTaskAccept,
  onTaskComplete,
  loadingTaskId,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <p className="text-gray-500 text-lg">{empty}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onAccept={onTaskAccept ? () => onTaskAccept(task.id) : undefined}
          onComplete={onTaskComplete ? () => onTaskComplete(task.id) : undefined}
          loading={loadingTaskId === task.id}
        />
      ))}
    </div>
  );
};
