import * as React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Icons } from '@/lib/icons';
import { DashboardMetrics } from '@/lib/hooks/useDashboard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiItemProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: { value: number; direction: 'up' | 'down' | 'neutral'; label: string };
  href: string;
  accentClass: string;
  iconBgClass: string;
}

function KpiItem({ title, value, description, icon, trend, href, accentClass, iconBgClass }: KpiItemProps) {
  const TrendIcon = trend?.direction === 'up'
    ? TrendingUp
    : trend?.direction === 'down'
    ? TrendingDown
    : Minus;

  return (
    <Link
      to={href}
      className={cn(
        'group relative flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-5',
        'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-border',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      {/* Top row: title + icon */}
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110', iconBgClass)}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div className="space-y-1.5">
        <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {/* Trend */}
      {trend && (
        <div className="flex items-center gap-1.5">
          <span className={cn(
            'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-semibold',
            trend.direction === 'up' && 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
            trend.direction === 'down' && 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
            trend.direction === 'neutral' && 'bg-muted text-muted-foreground',
          )}>
            <TrendIcon className="h-3 w-3" />
            {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-muted-foreground">{trend.label}</span>
        </div>
      )}

      {/* Hover accent line */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100',
        accentClass
      )} />
    </Link>
  );
}

function formatCurrency(value: number | undefined | null): string {
  const num = Number(value ?? 0);
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ExecutiveKpis({ metrics }: { metrics: DashboardMetrics }) {
  const kpis: KpiItemProps[] = [
    {
      title: 'Revenue',
      value: formatCurrency(metrics.revenue),
      description: 'Total confirmed revenue',
      href: '/reports',
      icon: <Icons.trendUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
      iconBgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
      accentClass: 'bg-emerald-500',
      trend: { value: 0, direction: 'neutral', label: 'vs last period' },
    },
    {
      title: 'Expenses',
      value: formatCurrency(metrics.expenses),
      description: 'Total operational expenses',
      href: '/reports',
      icon: <Icons.cart className="h-4 w-4 text-rose-600 dark:text-rose-400" />,
      iconBgClass: 'bg-rose-50 dark:bg-rose-950/40',
      accentClass: 'bg-rose-500',
    },
    {
      title: 'Net Profit',
      value: formatCurrency(metrics.profit),
      description: metrics.profit >= 0 ? 'Profitable period' : 'Operating at a loss',
      href: '/reports',
      icon: <Icons.info className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
      iconBgClass: 'bg-blue-50 dark:bg-blue-950/40',
      accentClass: metrics.profit >= 0 ? 'bg-emerald-500' : 'bg-rose-500',
      trend: metrics.profit >= 0
        ? { value: 0, direction: 'neutral', label: 'vs last period' }
        : undefined,
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(metrics.inventoryValue),
      description: `${metrics.totalProducts} products across ${metrics.totalWarehouses} warehouse${metrics.totalWarehouses !== 1 ? 's' : ''}`,
      href: '/inventory',
      icon: <Icons.inventory className="h-4 w-4 text-violet-600 dark:text-violet-400" />,
      iconBgClass: 'bg-violet-50 dark:bg-violet-950/40',
      accentClass: 'bg-violet-500',
    },
    {
      title: 'Sales Orders',
      value: metrics.totalSalesOrders,
      description: `${metrics.pendingSalesOrders} pending`,
      href: '/sales-orders',
      icon: <Icons.salesOrders className="h-4 w-4 text-amber-600 dark:text-amber-400" />,
      iconBgClass: 'bg-amber-50 dark:bg-amber-950/40',
      accentClass: 'bg-amber-500',
    },
    {
      title: 'Customers',
      value: metrics.totalCustomers,
      description: 'Total active customers',
      href: '/customers',
      icon: <Icons.users className="h-4 w-4 text-sky-600 dark:text-sky-400" />,
      iconBgClass: 'bg-sky-50 dark:bg-sky-950/40',
      accentClass: 'bg-sky-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {kpis.map(kpi => (
        <div key={kpi.title} className="col-span-1 sm:col-span-1">
          <KpiItem {...kpi} />
        </div>
      ))}
    </div>
  );
}
