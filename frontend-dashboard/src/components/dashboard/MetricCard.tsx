import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  trend?: 'up' | 'down';
  trendValue?: string;
  className?: string;
  bgColor?: string;
}

export default function MetricCard({
  icon,
  label,
  value,
  trend,
  trendValue,
  className = '',
  bgColor = 'bg-blue-50',
}: MetricCardProps) {
  return (
    <div className={`p-4 sm:p-6 rounded-lg border border-slate-200 bg-white ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-slate-600 font-medium">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {value}
          </p>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              {trendValue}
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${bgColor}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
