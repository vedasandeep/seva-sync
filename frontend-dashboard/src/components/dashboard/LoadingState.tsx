import { Loader } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Loader className="w-8 h-8 text-blue-500 animate-spin mb-4" />
      <p className="text-slate-600 text-sm">{message}</p>
    </div>
  );
}
