interface WidgetCardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
}

export default function WidgetCard({
  children,
  className = '',
  interactive = false,
}: WidgetCardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 shadow-sm ${
        interactive ? 'hover:shadow-md cursor-pointer transition-shadow' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
