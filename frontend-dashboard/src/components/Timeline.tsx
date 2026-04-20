import { Activity, AlertCircle, CheckCircle2, Clock, Zap, Users, Briefcase } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  type: 'created' | 'activated' | 'task_added' | 'volunteer_assigned' | 'task_completed' | 'status_changed' | 'severity_changed' | 'paused' | 'resolved' | 'archived';
  title: string;
  description?: string;
  actor: string;
  timestamp: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface Props {
  events: TimelineEvent[];
  isLoading?: boolean;
}

const EVENT_ICONS: Record<string, any> = {
  created: Activity,
  activated: Zap,
  task_added: Briefcase,
  volunteer_assigned: Users,
  task_completed: CheckCircle2,
  status_changed: Clock,
  severity_changed: AlertCircle,
  paused: Clock,
  resolved: CheckCircle2,
  archived: Activity,
};

const EVENT_COLORS: Record<string, string> = {
  created: 'text-slate-600',
  activated: 'text-green-600',
  task_added: 'text-blue-600',
  volunteer_assigned: 'text-purple-600',
  task_completed: 'text-green-600',
  status_changed: 'text-slate-600',
  severity_changed: 'text-red-600',
  paused: 'text-orange-600',
  resolved: 'text-green-600',
  archived: 'text-slate-600',
};

export default function Timeline({ events, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded animate-pulse w-1/3" />
              <div className="h-3 bg-slate-200 rounded animate-pulse w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-slate-600">
        <p>No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => {
        const IconComponent = EVENT_ICONS[event.type] || Activity;
        const iconColor = EVENT_COLORS[event.type] || 'text-slate-600';

        return (
          <div key={event.id} className="flex gap-4">
            {/* Timeline line and icon */}
            <div className="flex flex-col items-center">
              <div
                className={`p-2 rounded-full ${
                  event.severity === 'critical'
                    ? 'bg-red-100'
                    : event.severity === 'high'
                    ? 'bg-orange-100'
                    : 'bg-slate-100'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${iconColor}`} />
              </div>
              {index < events.length - 1 && (
                <div className="w-0.5 h-8 bg-slate-200 my-2" />
              )}
            </div>

            {/* Event content */}
            <div className="flex-1 pt-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{event.title}</p>
                  {event.description && (
                    <p className="text-sm text-slate-600 mt-1">{event.description}</p>
                  )}
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                  {event.timestamp instanceof Date
                    ? event.timestamp.toLocaleString()
                    : new Date(event.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">by {event.actor}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
