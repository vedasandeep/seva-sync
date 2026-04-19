import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ title, message, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 text-slate-400">
        {icon || <AlertCircle size={40} />}
      </div>
      <h3 className="text-lg font-medium text-slate-900 mb-1">{title}</h3>
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </div>
  );
}
