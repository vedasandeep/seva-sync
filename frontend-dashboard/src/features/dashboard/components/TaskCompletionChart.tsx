import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WidgetCard, WidgetHeader } from '../../../components/dashboard';

interface ChartData {
  date: string;
  completed: number;
  pending: number;
}

interface TaskCompletionChartProps {
  data: ChartData[];
}

export default function TaskCompletionChart({ data }: TaskCompletionChartProps) {
  return (
    <WidgetCard>
      <div className="p-4 sm:p-6">
        <WidgetHeader title="Task Completion Trend" subtitle="Last 7 days" />

        <div className="mt-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#22c55e"
                name="Completed"
                strokeWidth={2}
                dot={{ fill: '#22c55e', r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="pending"
                stroke="#ef4444"
                name="Pending"
                strokeWidth={2}
                dot={{ fill: '#ef4444', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}
