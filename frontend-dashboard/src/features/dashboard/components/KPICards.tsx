import { AlertTriangle, Users, CheckCircle2, Clock, AlertCircle, Phone, Zap, Clock3 } from 'lucide-react';
import { MetricCard, DashboardGrid } from '../../../components/dashboard';

interface KPIData {
  activeDiasters: number;
  activeVolunteers: number;
  tasksCompleted: number;
  pendingTasks: number;
  burnoutAlerts: number;
  ivrCalls: number;
  syncFailures: number;
  avgResponseTime: string;
}

interface KPICardsProps {
  data: KPIData;
}

export default function KPICards({ data }: KPICardsProps) {
  const kpis = [
    {
      icon: <AlertTriangle size={24} className="text-red-600" />,
      label: 'Active Disasters',
      value: data.activeDiasters,
      bgColor: 'bg-red-50',
    },
    {
      icon: <Users size={24} className="text-blue-600" />,
      label: 'Active Volunteers',
      value: data.activeVolunteers,
      bgColor: 'bg-blue-50',
    },
    {
      icon: <CheckCircle2 size={24} className="text-green-600" />,
      label: 'Tasks Completed Today',
      value: data.tasksCompleted,
      bgColor: 'bg-green-50',
    },
    {
      icon: <Clock size={24} className="text-yellow-600" />,
      label: 'Pending Tasks',
      value: data.pendingTasks,
      bgColor: 'bg-yellow-50',
    },
    {
      icon: <AlertCircle size={24} className="text-orange-600" />,
      label: 'Burnout Alerts',
      value: data.burnoutAlerts,
      bgColor: 'bg-orange-50',
    },
    {
      icon: <Phone size={24} className="text-purple-600" />,
      label: 'IVR Calls Today',
      value: data.ivrCalls,
      bgColor: 'bg-purple-50',
    },
    {
      icon: <Zap size={24} className="text-pink-600" />,
      label: 'Sync Failures',
      value: data.syncFailures,
      bgColor: 'bg-pink-50',
    },
    {
      icon: <Clock3 size={24} className="text-indigo-600" />,
      label: 'Avg Response Time',
      value: data.avgResponseTime,
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <DashboardGrid cols={4} gap="md">
      {kpis.map((kpi) => (
        <MetricCard
          key={kpi.label}
          icon={kpi.icon}
          label={kpi.label}
          value={kpi.value}
          bgColor={kpi.bgColor}
        />
      ))}
    </DashboardGrid>
  );
}
