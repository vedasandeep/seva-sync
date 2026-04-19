import { WidgetCard, WidgetHeader, DashboardGrid, StatusBadge } from '../../../components/dashboard';

interface Disaster {
  id: string;
  name: string;
  type: string;
  status: 'ACTIVE' | 'RESOLVED' | 'ARCHIVED' | 'PENDING' | 'MONITORING';
  location: string;
  activeVolunteers: number;
  totalVolunteers: number;
  tasksCompleted: number;
  totalTasks: number;
}

interface DisasterOverviewProps {
  disasters: Disaster[];
}

export default function DisasterOverview({ disasters }: DisasterOverviewProps) {
  const getProgressColor = (completed: number, total: number): string => {
    if (total === 0) return 'bg-slate-300';
    const percentage = (completed / total) * 100;
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <DashboardGrid cols={2} gap="md">
      {disasters.map((disaster) => {
        const taskProgress = disaster.totalTasks > 0 ? (disaster.tasksCompleted / disaster.totalTasks) * 100 : 0;
        const volunteerProgress = disaster.totalVolunteers > 0 ? (disaster.activeVolunteers / disaster.totalVolunteers) * 100 : 0;

        return (
          <WidgetCard key={disaster.id}>
            <div className="p-4 sm:p-6">
              <WidgetHeader
                title={disaster.name}
                subtitle={disaster.location}
                action={<StatusBadge status={disaster.status} />}
              />

              <div className="mt-6 space-y-4">
                {/* Type Badge */}
                <div className="inline-flex px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-700">
                  {disaster.type}
                </div>

                {/* Task Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Tasks</span>
                    <span className="text-sm text-slate-600">
                      {disaster.tasksCompleted}/{disaster.totalTasks}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getProgressColor(disaster.tasksCompleted, disaster.totalTasks)}`}
                      style={{ width: `${taskProgress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Volunteer Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Volunteers</span>
                    <span className="text-sm text-slate-600">
                      {disaster.activeVolunteers}/{disaster.totalVolunteers}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${getProgressColor(disaster.activeVolunteers, disaster.totalVolunteers)}`}
                      style={{ width: `${volunteerProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </WidgetCard>
        );
      })}
    </DashboardGrid>
  );
}
