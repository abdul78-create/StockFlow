import * as React from 'react';
import { type LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  loading?: boolean;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  loading,
  className,
}: StatCardProps) {
  const isPositive = trend && trend.value >= 0;

  return (
    <Card className={cn(
      'group relative overflow-hidden transition-all duration-300',
      'hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5',
      className
    )}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground/80 tracking-tight">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        )}
      </CardHeader>
      <CardContent className="relative z-10">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-semibold tracking-tight text-foreground">
              {value}
            </div>
            {(description || trend) && (
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                {trend && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-0.5 font-medium px-1.5 py-0.5 rounded-md',
                      isPositive 
                        ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400' 
                        : 'text-rose-600 bg-rose-500/10 dark:text-rose-400'
                    )}
                  >
                    {isPositive ? (
                      <TrendingUp className="size-3" />
                    ) : (
                      <TrendingDown className="size-3" />
                    )}
                    {Math.abs(trend.value)}%
                  </span>
                )}
                {description && <span>{description}</span>}
                {trend?.label && <span>{trend.label}</span>}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
