interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export default function SkeletonCard({ className = '', lines = 3 }: SkeletonCardProps) {
  return (
    <div className={`p-4 sm:p-6 rounded-lg border border-slate-200 bg-white animate-pulse ${className}`}>
      <div className="space-y-3">
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        {Array.from({ length: lines - 1 }).map((_, i) => (
          <div key={i} className={`h-3 bg-slate-100 rounded ${i === lines - 2 ? 'w-4/5' : 'w-full'}`}></div>
        ))}
      </div>
    </div>
  );
}
