import { CheckCircle2, AlertTriangle, Clock, Wifi, WifiOff } from 'lucide-react';
import { WidgetCard, WidgetHeader } from '../../../components/dashboard';

interface SyncData {
  totalVolunteers: number;
  volunteersOnline: number;
  volunteersOffline: number;
  pendingSyncs: number;
  syncedToday: number;
  conflictsPending: number;
  lastSyncTime?: string;
  syncHealthStatus: 'good' | 'warning' | 'critical';
}

interface SyncSummaryPanelProps {
  data: SyncData;
}

export default function SyncSummaryPanel({ data }: SyncSummaryPanelProps) {
  const syncStatusColor = {
    good: 'text-green-600 bg-green-50',
    warning: 'text-yellow-600 bg-yellow-50',
    critical: 'text-red-600 bg-red-50',
  };

  const syncStatusLabel = {
    good: 'Syncing Normally',
    warning: 'Sync Issues Detected',
    critical: 'Critical Sync Problems',
  };

  return (
    <WidgetCard>
      <WidgetHeader
        title="Offline-First Sync Status"
        subtitle="Volunteer app sync health and offline queue"
      />

      <div className="space-y-4">
        {/* Overall Status */}
        <div className={`p-4 rounded-lg ${syncStatusColor[data.syncHealthStatus]}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">
                {syncStatusLabel[data.syncHealthStatus]}
              </p>
              {data.lastSyncTime && (
                <p className="text-xs opacity-75 mt-1">
                  Last sync: {data.lastSyncTime}
                </p>
              )}
            </div>
            <div className="text-right">
              {data.syncHealthStatus === 'good' && (
                <CheckCircle2 size={32} className="text-green-600" />
              )}
              {data.syncHealthStatus === 'warning' && (
                <AlertTriangle size={32} className="text-yellow-600" />
              )}
              {data.syncHealthStatus === 'critical' && (
                <AlertTriangle size={32} className="text-red-600" />
              )}
            </div>
          </div>
        </div>

        {/* Connectivity Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Wifi size={16} className="text-green-600" />
              <span className="text-xs font-semibold text-gray-700">Online</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {data.volunteersOnline}
            </p>
            <p className="text-xs text-gray-600">
              of {data.totalVolunteers} volunteers
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <WifiOff size={16} className="text-gray-600" />
              <span className="text-xs font-semibold text-gray-700">Offline</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {data.volunteersOffline}
            </p>
            <p className="text-xs text-gray-600">
              {data.volunteersOffline > 0 && 'queuing locally'}
              {data.volunteersOffline === 0 && 'all syncing'}
            </p>
          </div>
        </div>

        {/* Sync Queue Status */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Pending Syncs</span>
            </div>
            <span className="text-lg font-bold text-blue-600">
              {data.pendingSyncs}
            </span>
          </div>

          {data.conflictsPending > 0 && (
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-orange-600" />
                <span className="text-sm font-medium text-gray-700">
                  Conflicts Pending
                </span>
              </div>
              <span className="text-lg font-bold text-orange-600">
                {data.conflictsPending}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-600" />
              <span className="text-sm font-medium text-gray-700">Synced Today</span>
            </div>
            <span className="text-lg font-bold text-green-600">
              {data.syncedToday}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 bg-blue-50 rounded text-xs text-blue-700 border border-blue-200">
          <p>
            <strong>Offline-First PWA:</strong> Volunteers can accept/complete tasks
            without internet. Changes sync automatically when online.
          </p>
        </div>
      </div>
    </WidgetCard>
  );
}
