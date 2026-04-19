import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { WidgetCard, WidgetHeader } from '../../../components/dashboard';

interface ChartData {
  name: string;
  value: number;
}

interface DisasterDistributionChartProps {
  data: ChartData[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

export default function DisasterDistributionChart({ data }: DisasterDistributionChartProps) {
  return (
    <WidgetCard>
      <div className="p-4 sm:p-6">
        <WidgetHeader title="Disaster Distribution" subtitle="By type" />

        <div className="mt-6">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </WidgetCard>
  );
}
