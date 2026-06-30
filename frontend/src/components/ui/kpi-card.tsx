import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/lib/icons';

export interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number; // percentage
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: keyof typeof Icons;
  status?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}

export function KpiCard({ title, value, trend, icon, status = 'default', className }: KpiCardProps) {
  const Icon = icon ? Icons[icon] : null;

  const statusColors = {
    default: 'text-muted-foreground bg-muted/50',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    error: 'text-destructive bg-destructive/10',
  };

  return (
    <Card className={cn('overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1', className)}>
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-muted-foreground tracking-tight">{title}</p>
          {Icon && (
            <div className={cn('p-2 rounded-md', statusColors[status])}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-3xl font-bold tracking-tight text-foreground">{value}</h3>
          
          {trend && (
            <div className="flex items-center mt-2 text-xs">
              <span 
                className={cn(
                  'flex items-center font-medium',
                  trend.direction === 'up' ? 'text-success' : 
                  trend.direction === 'down' ? 'text-destructive' : 'text-muted-foreground'
                )}
              >
                {trend.direction === 'up' && <Icons.trendUp className="w-3 h-3 mr-1" />}
                {trend.direction === 'down' && <Icons.trendDown className="w-3 h-3 mr-1" />}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground ml-1.5">{trend.label}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
