type AlertLevel = 'low' | 'moderate' | 'high' | 'critical';

interface AlertLevelBadgeProps {
  level: AlertLevel;
  className?: string;
}

const levelConfig: Record<AlertLevel, { bg: string; text: string; dot: string }> = {
  low: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  moderate: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  critical: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

export default function AlertLevelBadge({ level, className = '' }: AlertLevelBadgeProps) {
  const config = levelConfig[level];
  const labels: Record<AlertLevel, string> = {
    low: 'Low',
    moderate: 'Moderate',
    high: 'High',
    critical: 'Critical',
  };

  return (
    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}>
      <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
      {labels[level]}
    </div>
  );
}
