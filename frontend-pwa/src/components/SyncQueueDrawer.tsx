import React, { useState, useEffect } from 'react';
import { getSyncQueue, getConflictTasks } from '../lib/db';
import { Badge } from './ui/Badge';
import { useOfflineStore } from '../stores/offlineStore';

interface SyncItem {
  id?: number;
  action: string;
  payload: Record<string, unknown>;
  createdAt: string;
  retries: number;
}

interface SyncQueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
}

export const SyncQueueDrawer: React.FC<SyncQueueDrawerProps> = ({ isOpen, onClose, onRetry }) => {
  const [queue, setQueue] = useState<SyncItem[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [conflictCount, setConflictCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'pending' | 'synced' | 'conflicts'>('pending');
  const syncInProgress = useOfflineStore((state) => state.syncInProgress);

  // Load queue data
  useEffect(() => {
    const loadQueueData = async () => {
      const [syncQueue, conflictTasks] = await Promise.all([
        getSyncQueue(),
        getConflictTasks(),
      ]);
      setQueue(syncQueue);
      setConflictCount(conflictTasks.length);
      setPendingCount(syncQueue.length);
    };

    if (isOpen) {
      loadQueueData();
      // Refresh every 2 seconds
      const interval = setInterval(loadQueueData, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      accept_task: 'Accept Task',
      complete_task: 'Complete Task',
      update_location: 'Update Location',
      wellness_checkin: 'Wellness Check-in',
    };
    return labels[action] || action;
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      accept_task: '✓',
      complete_task: '✔',
      update_location: '📍',
      wellness_checkin: '❤️',
    };
    return icons[action] || '•';
  };

  const renderQueueItem = (item: SyncItem) => (
    <div
      key={item.id}
      className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100"
    >
      <div className="text-xl">{getActionIcon(item.action)}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-gray-900">{getActionLabel(item.action)}</div>
        <div className="text-xs text-gray-500 mt-1">
          {new Date(item.createdAt).toLocaleTimeString()}
        </div>
      </div>
      {item.retries > 0 && (
        <Badge variant="warning">Retry {item.retries}</Badge>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-lg flex flex-col animate-slideIn">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Sync Queue</h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none hover:bg-blue-700 rounded p-1 w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-3 font-medium text-sm transition-colors ${
              activeTab === 'pending'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('conflicts')}
            className={`flex-1 py-3 font-medium text-sm transition-colors ${
              activeTab === 'conflicts'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Conflicts ({conflictCount})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === 'pending' && (
            <>
              {queue.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">✓</div>
                  <p className="font-medium">All synced!</p>
                  <p className="text-sm mt-1">No pending changes</p>
                </div>
              ) : (
                <>
                  <div className="text-xs text-gray-600 font-medium mb-2">
                    {syncInProgress && (
                      <span className="inline-flex items-center gap-1">
                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                        Syncing...
                      </span>
                    )}
                    {!syncInProgress && pendingCount > 0 && (
                      <span>Ready to sync</span>
                    )}
                  </div>
                  {queue.map(renderQueueItem)}
                </>
              )}
            </>
          )}

          {activeTab === 'conflicts' && (
            <>
              {conflictCount === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="font-medium">No conflicts</p>
                  <p className="text-sm mt-1">All changes are clear</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-orange-50 border border-orange-200 rounded p-3">
                    <p className="text-sm text-orange-800">
                      ⚠️ {conflictCount} item{conflictCount !== 1 ? 's' : ''} need{conflictCount !== 1 ? '' : 's'} resolution
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 p-2">
                    Open a conflicted task to resolve the change
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex gap-2">
          <button
            onClick={onRetry}
            disabled={syncInProgress || queue.length === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {syncInProgress ? 'Syncing...' : 'Sync Now'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 font-medium rounded hover:bg-gray-300 transition-colors"
          >
            Done
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
