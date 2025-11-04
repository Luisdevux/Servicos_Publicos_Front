// src/components/MetricCard.tsx

"use client";

import type { MetricCardProps } from "@/types/admin";

export function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <div className={`bg-global-text-secondary rounded-md p-6  hover:shadow-md transition-shadow`} data-test="metric-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-global-bg mb-1">{title}</p>
          <p className="text-2xl font-bold text-global-bg">{value}</p>
        </div>
        {icon && ( 
          <div className="text-global-bg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}