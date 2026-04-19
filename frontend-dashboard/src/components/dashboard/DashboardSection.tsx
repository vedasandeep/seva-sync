interface DashboardSectionProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export default function DashboardSection({
  children,
  title,
  className = '',
}: DashboardSectionProps) {
  return (
    <section className={`space-y-4 ${className}`}>
      {title && (
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
