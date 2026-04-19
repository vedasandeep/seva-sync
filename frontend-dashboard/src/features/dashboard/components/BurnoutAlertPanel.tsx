import { AlertCircle, AlertTriangle, AlertOctagon } from 'lucide-react';
import { WidgetCard, WidgetHeader, AlertLevelBadge } from '../../../components/dashboard';

interface BurnoutAlert {
  id: string;
  volunteerName: string;
  volunteerRole: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  hoursWorked: number;
  lastBreak: string;
  disasterAssigned: string;
  timestamp: Date;
}

interface BurnoutAlertPanelProps {
  alerts: BurnoutAlert[];
}

export default function BurnoutAlertPanel({ alerts }: BurnoutAlertPanelProps) {
  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'low':
        return <AlertCircle size={16} className="text-blue-500" />;
      case 'moderate':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'high':
        return <AlertTriangle size={16} className="text-orange-500" />;
      case 'critical':
        return <AlertOctagon size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <WidgetCard>
      <div className="p-4 sm:p-6">
        <WidgetHeader title="Burnout Alerts" subtitle="Volunteers needing attention" />

        <div className="mt-6 space-y-3 max-h-96 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500">No burnout alerts at the moment</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {getAlertIcon(alert.riskLevel)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-medium text-sm text-slate-900 truncate">
                      {alert.volunteerName}
                    </p>
                    <AlertLevelBadge level={alert.riskLevel} />
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{alert.volunteerRole}</p>
                  <div className="space-y-1 text-xs text-slate-600">
                    <p>
                      <span className="font-medium">Hours:</span> {alert.hoursWorked}h
                    </p>
                    <p>
                      <span className="font-medium">Last break:</span> {alert.lastBreak}
                    </p>
                    <p>
                      <span className="font-medium">Assigned:</span> {alert.disasterAssigned}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </WidgetCard>
  );
}
