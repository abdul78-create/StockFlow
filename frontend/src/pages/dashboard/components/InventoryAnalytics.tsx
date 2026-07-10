import * as React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { DashboardMetrics } from '@/lib/hooks/useDashboard';
import { Icons } from '@/lib/icons';
import { AlertTriangle, Package, Building2, ArrowRight } from 'lucide-react';

interface StatRow {
  label: string;
  sublabel: string;
  value: number | string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  href?: string;
  urgent?: boolean;
}

export function InventoryAnalytics({ metrics }: { metrics: DashboardMetrics }) {
  const rows: StatRow[] = [
    {
      label: 'Low Stock',
      sublabel: 'Below threshold',
      value: metrics.lowStockCount,
      icon: <AlertTriangle className="h-4 w-4" />,
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      textColor: 'text-amber-600 dark:text-amber-400',
      href: '/inventory',
      urgent: metrics.lowStockCount > 0,
    },
    {
      label: 'Out of Stock',
      sublabel: 'Needs restock',
      value: metrics.outOfStockCount,
      icon: <AlertTriangle className="h-4 w-4" />,
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      textColor: 'text-rose-600 dark:text-rose-400',
      href: '/inventory',
      urgent: metrics.outOfStockCount > 0,
    },
    {
      label: 'Warehouses',
      sublabel: 'Active locations',
      value: metrics.totalWarehouses,
      icon: <Building2 className="h-4 w-4" />,
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      textColor: 'text-blue-600 dark:text-blue-400',
      href: '/warehouses',
    },
    {
      label: 'Products',
      sublabel: 'In catalog',
      value: metrics.totalProducts,
      icon: <Package className="h-4 w-4" />,
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      href: '/products',
    },
  ];

  return (
    <div className="col-span-full xl:col-span-1 rounded-xl border border-border/60 bg-card">
      <div className="px-5 pt-5 pb-4">
        <h3 className="text-sm font-semibold text-foreground">Inventory Health</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Stock status across all locations</p>
      </div>

      <div className="px-4 pb-4 space-y-2">
        {metrics.totalProducts === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
            <Icons.products className="h-8 w-8 opacity-20" />
            <p className="text-sm font-medium">No inventory data</p>
            <Link
              to="/products/new"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Add your first product <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          rows.map(row => {
            const inner = (
              <div
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-3',
                  'border transition-all duration-150',
                  row.urgent
                    ? 'border-border bg-card hover:bg-muted/30 cursor-pointer'
                    : 'border-border/50 bg-card/50 hover:bg-muted/20',
                  row.href && 'cursor-pointer hover:border-border'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', row.bgColor, row.textColor)}>
                    {row.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      {row.label}
                      {row.urgent && Number(row.value) > 0 && (
                        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse-soft" />
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{row.sublabel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-lg font-bold', row.urgent && Number(row.value) > 0 ? row.textColor : 'text-foreground')}>
                    {row.value}
                  </span>
                  {row.href && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />}
                </div>
              </div>
            );

            if (row.href) {
              return (
                <Link key={row.label} to={row.href} className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
                  {inner}
                </Link>
              );
            }
            return <div key={row.label}>{inner}</div>;
          })
        )}
      </div>
    </div>
  );
}
