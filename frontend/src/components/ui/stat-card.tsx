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
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        )}
      </CardHeader>
      <CardContent>
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
                      'inline-flex items-center gap-0.5 font-medium',
                      isPositive ? 'text-success' : 'text-destructive'
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
