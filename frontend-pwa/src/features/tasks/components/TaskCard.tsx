import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';

interface Task {
  id: string;
  title: string;
  description?: string;
  urgency: string;
  status: string;
  syncStatus: 'synced' | 'pending' | 'conflict';
  syncError?: string;
}

interface TaskCardProps {
  task: Task;
  onAccept?: () => void | Promise<void>;
  onComplete?: () => void | Promise<void>;
  loading?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onAccept,
  onComplete,
  loading = false,
}) => {
  const urgencyColors: Record<string, 'success' | 'info' | 'warning' | 'default' | 'primary' | 'danger'> = {
    CRITICAL: 'danger',
    HIGH: 'warning',
    MEDIUM: 'info',
    LOW: 'success',
  };

  const getStatusColor = (status: string): 'success' | 'info' | 'warning' | 'default' | 'primary' | 'danger' => {
    switch (status) {
      case 'OPEN':
        return 'default';
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Card hoverable className={`space-y-3 ${task.syncStatus === 'conflict' ? 'border-orange-300 bg-orange-50' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
          {task.description && (
            <p className="text-gray-600 text-sm mt-1">{task.description}</p>
          )}
        </div>
        <Badge variant={urgencyColors[task.urgency]}>
          {task.urgency}
        </Badge>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={getStatusColor(task.status)}>
          {task.status}
        </Badge>
        
        {/* Sync Status Indicator */}
        {task.syncStatus === 'pending' && (
          <Badge variant="warning" className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-yellow-600 rounded-full animate-pulse" />
            Pending sync
          </Badge>
        )}
        
        {task.syncStatus === 'conflict' && (
          <Badge variant="danger">⚠️ Needs Resolution</Badge>
        )}
        
        {task.syncStatus === 'synced' && (
          <Badge variant="success">✓ Synced</Badge>
        )}
      </div>

      {/* Error Message */}
      {task.syncError && (
        <div className="bg-red-50 border border-red-200 rounded p-2">
          <p className="text-xs text-red-700">❌ {task.syncError}</p>
        </div>
      )}

      {(onAccept || onComplete) && (
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          {onAccept && (
            <button
              onClick={onAccept}
              disabled={loading}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 font-medium text-sm min-h-[44px] flex items-center justify-center transition-colors"
              title="Accept Task"
            >
              {loading ? 'Processing...' : 'Accept Task'}
            </button>
          )}
          {onComplete && (
            <button
              onClick={onComplete}
              disabled={loading}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 font-medium text-sm min-h-[44px] flex items-center justify-center transition-colors"
              title="Mark Task Complete"
            >
              {loading ? 'Processing...' : 'Mark Complete'}
            </button>
          )}
        </div>
      )}
    </Card>
  );
};
