import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WidgetCard, WidgetHeader } from '../../../components/dashboard';

interface ChartData {
  level: string;
  count: number;
}

interface BurnoutRiskChartProps {
  data: ChartData[];
}

export default function BurnoutRiskChart({ data }: BurnoutRiskChartProps) {
  return (
    <WidgetCard>
      <div className="p-4 sm:p-6">
        <WidgetHeader title="Burnout Risk Distribution" subtitle="By severity level" />

        <div className="mt-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="level" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Volunteers" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}
