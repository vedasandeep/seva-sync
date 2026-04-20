import { MapPin, Calendar } from 'lucide-react';

export interface DisasterCardData {
  id: string;
  name: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'PLANNING' | 'ACTIVE' | 'RESOLVED' | 'ARCHIVED';
  location: string;
  startDate: string | Date;
  totalTasks: number;
  completedTasks: number;
  openTasks: number;
  assignedVolunteers: number;
}

interface Props {
  disaster: DisasterCardData;
  onView: (id: string) => void;
  onActivate: (id: string) => void;
  onResolve: (id: string) => void;
  onArchive: (id: string) => void;
  isLoading?: boolean;
}

const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  LOW: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  MEDIUM: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PLANNING: { bg: 'bg-orange-100', text: 'text-orange-800' },
  ACTIVE: { bg: 'bg-green-100', text: 'text-green-800' },
  RESOLVED: { bg: 'bg-slate-100', text: 'text-slate-800' },
  ARCHIVED: { bg: 'bg-slate-100', text: 'text-slate-600' },
};

const DISASTER_TYPE_ICONS: Record<string, string> = {
  FLOOD: '🌊',
  CYCLONE: '🌪️',
  EARTHQUAKE: '🏚️',
  LANDSLIDE: '🏔️',
  FIRE: '🔥',
  OTHER: '⚠️',
};

export default function DisasterCard({
  disaster,
  onView,
  onActivate,
  onResolve,
  onArchive,
  isLoading = false,
}: Props) {
  const completionRate = disaster.totalTasks > 0 ? Math.round((disaster.completedTasks / disaster.totalTasks) * 100) : 0;
  const severityColor = SEVERITY_COLORS[disaster.severity] || SEVERITY_COLORS.LOW;
  const statusColor = STATUS_COLORS[disaster.status] || STATUS_COLORS.ACTIVE;

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 space-y-3">
      {/* Header: Name + Type + Badges */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{DISASTER_TYPE_ICONS[disaster.type]}</span>
            <h3 className="text-base font-semibold text-slate-900 truncate">
              {disaster.name}
            </h3>
          </div>
          <p className="text-xs text-slate-600">{disaster.type}</p>
        </div>

        {/* Status & Severity Badges */}
        <div className="flex gap-1.5 flex-shrink-0">
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColor.bg} ${statusColor.text}`}
          >
            {disaster.status}
          </span>
          <span
            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${severityColor.bg} ${severityColor.text} border ${severityColor.border}`}
          >
            {disaster.severity}
          </span>
        </div>
      </div>

      {/* Location & Date */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{disaster.location}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>{formatDate(disaster.startDate)}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-2 py-2 border-t border-b border-slate-100">
        <div className="text-center">
          <div className="text-lg font-bold text-slate-900">{disaster.assignedVolunteers}</div>
          <div className="text-xs text-slate-600">Volunteers</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-slate-900">{disaster.openTasks}</div>
          <div className="text-xs text-slate-600">Open Tasks</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Completion</span>
          <span className="text-sm font-semibold text-slate-900">{completionRate}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              completionRate < 50
                ? 'bg-orange-500'
                : completionRate < 80
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.max(completionRate, 5)}%` }}
          />
        </div>
        <div className="text-xs text-slate-600 text-right">
          {disaster.completedTasks} of {disaster.totalTasks} tasks
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onView(disaster.id)}
          disabled={isLoading}
          className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          View Details
        </button>

        {disaster.status === 'PLANNING' && (
          <button
            onClick={() => onActivate(disaster.id)}
            disabled={isLoading}
            className="flex-1 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Activate
          </button>
        )}

        {disaster.status === 'ACTIVE' && (
          <button
            onClick={() => onResolve(disaster.id)}
            disabled={isLoading}
            className="flex-1 px-3 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Resolve
          </button>
        )}

        {(disaster.status === 'RESOLVED' || disaster.status === 'PLANNING') && (
          <button
            onClick={() => onArchive(disaster.id)}
            disabled={isLoading}
            className="flex-1 px-3 py-2 bg-slate-50 text-slate-600 hover:bg-slate-100 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            Archive
          </button>
        )}
      </div>
    </div>
  );
}
