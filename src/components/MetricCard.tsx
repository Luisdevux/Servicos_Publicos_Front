 "use client";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <div className={`bg-[var(--global-bg-card)] rounded-md p-6  hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-[var(--global-text-secondary)]">{value}</p>
        </div>
        {icon && ( 
          <div className="text-[var(--global-text-primary)]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}