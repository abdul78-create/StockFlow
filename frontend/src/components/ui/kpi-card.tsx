import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/lib/icons';
import { Link } from 'react-router-dom';

export interface KpiCardProps {
  title: string;
  description?: string;
  value: string | number;
  trend?: {
    value: number; // percentage
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: keyof typeof Icons;
  status?: 'default' | 'success' | 'warning' | 'error';
  href?: string;
  className?: string;
}

export function KpiCard({ title, description, value, trend, icon, status = 'default', href, className }: KpiCardProps) {
  const Icon = icon ? Icons[icon] : null;

  const statusColors = {
    default: 'text-muted-foreground bg-muted/50 ring-1 ring-border/50',
    success: 'text-emerald-600 bg-emerald-500/10 ring-1 ring-emerald-500/20 dark:text-emerald-400',
    warning: 'text-amber-600 bg-amber-500/10 ring-1 ring-amber-500/20 dark:text-amber-400',
    error: 'text-rose-600 bg-rose-500/10 ring-1 ring-rose-500/20 dark:text-rose-400',
  };

  const content = (
    <Card className={cn(
      'group overflow-hidden relative transition-all duration-300 h-full',
      href ? 'hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 cursor-pointer' : '',
      'border-border/60 bg-gradient-to-b from-card to-card/50',
      className
    )}>
      {/* Subtle top inner highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-muted-foreground/80 tracking-tight">{title}</p>
            {description && (
              <div title={description} className="cursor-help text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                <Icons.info className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn('p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110', statusColors[status])}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
        
        <div className="mt-auto">
          <h3 className="text-3xl font-bold tracking-tight text-foreground/90">{value}</h3>
          
          {trend && (
            <div className="flex items-center mt-2.5 text-xs font-medium">
              <span 
                className={cn(
                  'flex items-center px-1.5 py-0.5 rounded-md',
                  trend.direction === 'up' ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400' : 
                  trend.direction === 'down' ? 'text-rose-600 bg-rose-500/10 dark:text-rose-400' : 'text-muted-foreground bg-muted'
                )}
              >
                {trend.direction === 'up' && <Icons.trendUp className="w-3 h-3 mr-1" />}
                {trend.direction === 'down' && <Icons.trendDown className="w-3 h-3 mr-1" />}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-muted-foreground/70 ml-2">{trend.label}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link to={href} className="block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl h-full">{content}</Link>;
  }

  return content;
}
