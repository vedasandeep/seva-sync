import React, { useState } from 'react';
import { Badge } from './ui/Badge';

interface ConflictTask {
  id: string;
  title: string;
  status: string;
  urgency: string;
  description?: string;
  // Local version (what volunteer changed)
  localVersion: {
    status: string;
    description?: string;
    updatedAt: string;
  };
  // Server version (what's on the server)
  serverVersion: {
    status: string;
    description?: string;
    updatedAt: string;
    updatedBy?: string;
  };
}

interface ConflictResolutionModalProps {
  isOpen: boolean;
  task: ConflictTask | null;
  onResolve: (taskId: string, resolution: 'local' | 'server') => Promise<void>;
  onClose: () => void;
  loading?: boolean;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  task,
  onResolve,
  onClose,
  loading = false,
}) => {
  const [selectedResolution, setSelectedResolution] = useState<'local' | 'server' | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  if (!isOpen || !task) return null;

  const handleResolve = async () => {
    if (!selectedResolution) return;

    setIsResolving(true);
    try {
      await onResolve(task.id, selectedResolution);
      setSelectedResolution(null);
      onClose();
    } finally {
      setIsResolving(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-orange-50 border-b border-orange-200 p-4">
            <h2 className="text-lg font-bold text-orange-900">Conflict Detected</h2>
            <p className="text-sm text-orange-700 mt-1">
              This task was changed both offline and on the server
            </p>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Task Title */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{task.title}</h3>
              {task.description && (
                <p className="text-gray-600 text-sm mt-1">{task.description}</p>
              )}
            </div>

            {/* Versions Comparison */}
            <div className="space-y-3">
              {/* Local Version */}
              <div
                className={`border-2 rounded p-3 cursor-pointer transition-all ${
                  selectedResolution === 'local'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedResolution('local')}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={selectedResolution === 'local'}
                    onChange={() => setSelectedResolution('local')}
                    className="mt-1 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Your Changes (Local)</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(task.localVersion.updatedAt)}
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Status:</span>
                        <Badge variant={getStatusBadgeColor(task.localVersion.status)}>
                          {task.localVersion.status}
                        </Badge>
                      </div>
                      {task.localVersion.description && (
                        <p className="text-xs text-gray-600 italic">
                          {task.localVersion.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Server Version */}
              <div
                className={`border-2 rounded p-3 cursor-pointer transition-all ${
                  selectedResolution === 'server'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedResolution('server')}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={selectedResolution === 'server'}
                    onChange={() => setSelectedResolution('server')}
                    className="mt-1 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Server Version</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(task.serverVersion.updatedAt)}
                      {task.serverVersion.updatedBy && ` by ${task.serverVersion.updatedBy}`}
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Status:</span>
                        <Badge variant={getStatusBadgeColor(task.serverVersion.status)}>
                          {task.serverVersion.status}
                        </Badge>
                      </div>
                      {task.serverVersion.description && (
                        <p className="text-xs text-gray-600 italic">
                          {task.serverVersion.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-xs text-blue-800">
                💡 Choose which version to keep. The other version will be discarded.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 flex gap-2">
            <button
              onClick={onClose}
              disabled={isResolving || loading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 font-medium rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleResolve}
              disabled={!selectedResolution || isResolving || loading}
              className="flex-1 px-4 py-2 bg-orange-600 text-white font-medium rounded hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isResolving || loading ? 'Resolving...' : 'Resolve'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
