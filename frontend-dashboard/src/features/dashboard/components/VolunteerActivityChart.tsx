import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WidgetCard, WidgetHeader } from '../../../components/dashboard';

interface ChartData {
  date: string;
  active: number;
  inactive: number;
}

interface VolunteerActivityChartProps {
  data: ChartData[];
}

export default function VolunteerActivityChart({ data }: VolunteerActivityChartProps) {
  return (
    <WidgetCard>
      <div className="p-4 sm:p-6">
        <WidgetHeader title="Volunteer Activity" subtitle="Last 7 days" />

        <div className="mt-6">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorInactive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="active"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorActive)"
                name="Active"
              />
              <Area
                type="monotone"
                dataKey="inactive"
                stroke="#94a3b8"
                fillOpacity={1}
                fill="url(#colorInactive)"
                name="Inactive"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}
