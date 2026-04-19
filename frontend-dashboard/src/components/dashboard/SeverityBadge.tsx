type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

const severityConfig: Record<Severity, { bg: string; text: string }> = {
  Low: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  High: { bg: 'bg-orange-100', text: 'text-orange-700' },
  Critical: { bg: 'bg-red-100', text: 'text-red-700' },
};

export default function SeverityBadge({ severity, className = '' }: SeverityBadgeProps) {
  const config = severityConfig[severity];

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}>
      {severity}
    </span>
  );
}
