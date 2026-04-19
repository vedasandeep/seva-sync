import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { WidgetCard, WidgetHeader, DashboardGrid } from '../../../components/dashboard';

interface SkillData {
  name: string;
  count: number;
}

interface RegionData {
  name: string;
  value: number;
}

interface AvailabilityData {
  status: string;
  count: number;
}

interface VolunteerDistributionWidgetProps {
  bySkills: SkillData[];
  byRegion: RegionData[];
  byAvailability: AvailabilityData[];
}

const REGION_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function VolunteerDistributionWidget({
  bySkills,
  byRegion,
  byAvailability,
}: VolunteerDistributionWidgetProps) {
  return (
    <DashboardGrid cols={3} gap="md">
      {/* By Skills */}
      <WidgetCard>
        <div className="p-4 sm:p-6">
          <WidgetHeader title="Volunteers by Skill" />
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={bySkills} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '11px' }} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </WidgetCard>

      {/* By Region */}
      <WidgetCard>
        <div className="p-4 sm:p-6">
          <WidgetHeader title="Volunteers by Region" />
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={byRegion}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {byRegion.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={REGION_COLORS[index % REGION_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </WidgetCard>

      {/* By Availability */}
      <WidgetCard>
        <div className="p-4 sm:p-6">
          <WidgetHeader title="Availability Status" />
          <div className="mt-6 space-y-3">
            {byAvailability.map((item) => {
              const total = byAvailability.reduce((sum, x) => sum + x.count, 0);
              const percentage = (item.count / total) * 100;
              const colorMap: Record<string, string> = {
                'On-Duty': 'bg-green-500',
                'Off-Duty': 'bg-slate-400',
                'On Leave': 'bg-yellow-500',
                'On Standby': 'bg-blue-500',
              };

              return (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{item.status}</span>
                    <span className="text-sm text-slate-600">{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${colorMap[item.status] || 'bg-blue-500'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </WidgetCard>
    </DashboardGrid>
  );
}
