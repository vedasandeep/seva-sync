import { Phone, Clock, Volume2, CheckCircle, AlertCircle, PhoneOff } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'call_start' | 'dial_tone' | 'ivr_prompt' | 'digit_input' | 'action_selected' | 'call_end';
  message: string;
  timestamp: Date;
  data?: any;
}

interface IVRCallTimelineProps {
  events: TimelineEvent[];
}

const EVENT_ICONS: Record<TimelineEvent['type'], React.ReactNode> = {
  call_start: <Phone size={16} className="text-green-600" />,
  dial_tone: <Volume2 size={16} className="text-blue-600" />,
  ivr_prompt: <Volume2 size={16} className="text-blue-600" />,
  digit_input: <Clock size={16} className="text-amber-600" />,
  action_selected: <CheckCircle size={16} className="text-green-600" />,
  call_end: <PhoneOff size={16} className="text-red-600" />,
};

const EVENT_COLORS: Record<TimelineEvent['type'], string> = {
  call_start: 'bg-green-50 border-green-200',
  dial_tone: 'bg-blue-50 border-blue-200',
  ivr_prompt: 'bg-blue-50 border-blue-200',
  digit_input: 'bg-amber-50 border-amber-200',
  action_selected: 'bg-green-50 border-green-200',
  call_end: 'bg-red-50 border-red-200',
};

export default function IVRCallTimeline({ events }: IVRCallTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle size={32} className="text-gray-400 mb-2" />
        <p className="text-gray-600 text-sm">No events yet. Start a call to see timeline.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto">
      {events.map((event) => (
        <div
          key={event.id}
          className={`border-l-4 p-3 rounded-r-lg ${EVENT_COLORS[event.type]}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">{EVENT_ICONS[event.type]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{event.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {event.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
