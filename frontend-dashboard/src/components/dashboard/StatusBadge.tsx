type Status = 'ACTIVE' | 'RESOLVED' | 'ARCHIVED' | 'PENDING' | 'MONITORING';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
  RESOLVED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Resolved' },
  ARCHIVED: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Archived' },
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
  MONITORING: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Monitoring' },
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}
    >
      {config.label}
    </span>
  );
}
