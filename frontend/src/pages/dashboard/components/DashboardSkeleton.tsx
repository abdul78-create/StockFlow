import * as React from 'react';
import { cn } from '@/lib/utils';

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-lg skeleton-shimmer',
        className
      )}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Welcome row */}
      <div className="space-y-2">
        <Shimmer className="h-7 w-64" />
        <Shimmer className="h-4 w-48" />
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border/60 p-4">
        <Shimmer className="h-4 w-28 mb-3" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Shimmer key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Shimmer key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      {/* Analytics row */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Shimmer className="col-span-1 xl:col-span-2 h-80 rounded-xl" />
        <Shimmer className="h-80 rounded-xl" />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Shimmer key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
