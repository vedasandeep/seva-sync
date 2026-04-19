import {
  CheckCircle2,
  AlertTriangle,
  Users,
  Clock,
  MessageSquare,
  MapPin,
  Phone,
} from 'lucide-react';
import { WidgetCard, WidgetHeader } from '../../../components/dashboard';
import { formatDistanceToNow } from 'date-fns';

type ActivityType = 'task_completed' | 'alert' | 'volunteer_joined' | 'status_update' | 'message' | 'location_update' | 'ivr_call' | 'TASK_COMPLETED' | 'DISASTER_ACTIVATED' | 'TASK_ASSIGNED' | 'BURNOUT_ALERT' | 'IVR_CALL' | 'SYNC_COMPLETE' | string;

interface ActivityEvent {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: Date;
  actor?: string;
  title?: string;
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  events: ActivityEvent[];
}

const getActivityIcon = (type: ActivityType) => {
  const typeStr = String(type).toLowerCase();
  if (typeStr.includes('task_completed') || typeStr.includes('task completed')) {
    return <CheckCircle2 size={16} className="text-green-500" />;
  } else if (typeStr.includes('alert') || typeStr.includes('burnout') || typeStr.includes('disaster')) {
    return <AlertTriangle size={16} className="text-red-500" />;
  } else if (typeStr.includes('volunteer')) {
    return <Users size={16} className="text-blue-500" />;
  } else if (typeStr.includes('status') || typeStr.includes('assigned')) {
    return <Clock size={16} className="text-purple-500" />;
  } else if (typeStr.includes('message')) {
    return <MessageSquare size={16} className="text-slate-500" />;
  } else if (typeStr.includes('location')) {
    return <MapPin size={16} className="text-orange-500" />;
  } else if (typeStr.includes('ivr') || typeStr.includes('call')) {
    return <Phone size={16} className="text-indigo-500" />;
  }
  return <Clock size={16} className="text-slate-500" />;
};

const getActivityColor = (type: ActivityType) => {
  const typeStr = String(type).toLowerCase();
  if (typeStr.includes('task_completed') || typeStr.includes('task completed')) {
    return 'bg-green-50 border-green-200';
  } else if (typeStr.includes('alert') || typeStr.includes('burnout') || typeStr.includes('disaster')) {
    return 'bg-red-50 border-red-200';
  } else if (typeStr.includes('volunteer')) {
    return 'bg-blue-50 border-blue-200';
  } else if (typeStr.includes('status') || typeStr.includes('assigned')) {
    return 'bg-purple-50 border-purple-200';
  } else if (typeStr.includes('message')) {
    return 'bg-slate-50 border-slate-200';
  } else if (typeStr.includes('location')) {
    return 'bg-orange-50 border-orange-200';
  } else if (typeStr.includes('ivr') || typeStr.includes('call')) {
    return 'bg-indigo-50 border-indigo-200';
  }
  return 'bg-slate-50 border-slate-200';
};

export default function ActivityFeed({ events }: ActivityFeedProps) {
  return (
    <WidgetCard>
      <div className="p-4 sm:p-6">
        <WidgetHeader title="Recent Activity" subtitle="Live updates from the field" />

        <div className="mt-6 space-y-3 max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">No recent activity</p>
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${getActivityColor(event.type)}`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(event.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900">
                    {event.actor && (
                      <span className="font-medium">{event.actor}</span>
                    )}
                    {event.actor ? ' - ' : ''}{event.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </WidgetCard>
  );
}
