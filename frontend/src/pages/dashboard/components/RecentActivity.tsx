import * as React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { DashboardMetrics } from '@/lib/hooks/useDashboard';
import { Icons } from '@/lib/icons';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight } from 'lucide-react';

const ACTION_MAP: Record<string, string> = {
  PRODUCT_CREATED: 'Created product',
  PRODUCT_UPDATED: 'Updated product',
  PRODUCT_DELETED: 'Archived product',
  PURCHASE_ORDER_CREATED: 'Created purchase order',
  PURCHASE_ORDER_UPDATED: 'Updated purchase order',
  PURCHASE_ORDER_APPROVED: 'Approved purchase order',
  PURCHASE_ORDER_COMPLETED: 'Completed purchase order',
  PURCHASE_ORDER_CANCELLED: 'Cancelled purchase order',
  SALES_ORDER_CREATED: 'Created sales order',
  SALES_ORDER_UPDATED: 'Updated sales order',
  SALES_ORDER_APPROVED: 'Approved sales order',
  SALES_ORDER_SHIPPED: 'Shipped sales order',
  SALES_ORDER_DELIVERED: 'Delivered sales order',
  INVENTORY_ADJUSTMENT: 'Adjusted inventory',
  INVENTORY_TRANSFER: 'Transferred inventory',
  CUSTOMER_CREATED: 'Added customer',
  CUSTOMER_UPDATED: 'Updated customer',
  SUPPLIER_CREATED: 'Added supplier',
  SUPPLIER_UPDATED: 'Updated supplier',
  WAREHOUSE_CREATED: 'Created warehouse',
  QUOTATION_CREATED: 'Created quotation',
  QUOTATION_CONVERTED: 'Converted quotation',
  USER_INVITED: 'Invited team member',
  USER_ROLE_CHANGED: 'Changed user role',
};

type StatusType = 'success' | 'error' | 'warning' | 'default';

function getStatus(action: string): StatusType {
  if (action.includes('CREATED') || action.includes('COMPLETED') || action.includes('DELIVERED') || action.includes('APPROVED')) return 'success';
  if (action.includes('DELETED') || action.includes('CANCELLED')) return 'error';
  if (action.includes('UPDATED') || action.includes('ADJUSTMENT')) return 'warning';
  return 'default';
}

function getHref(entityType: string | null, entityId: string | null): string | undefined {
  if (!entityId) return undefined;
  switch (entityType) {
    case 'PRODUCT': return `/products/${entityId}`;
    case 'CUSTOMER': return `/customers/${entityId}`;
    case 'SUPPLIER': return `/suppliers/${entityId}`;
    case 'PURCHASE_ORDER': return `/purchase-orders/${entityId}`;
    case 'SALES_ORDER': return `/sales-orders/${entityId}`;
    default: return undefined;
  }
}

function parseName(details: string | null): string {
  if (!details) return '';
  try {
    const p = JSON.parse(details);
    return p.name || p.sku || p.orderNumber || p.title || '';
  } catch {
    return '';
  }
}

const STATUS_STYLES: Record<StatusType, string> = {
  success: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800',
  error: 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800',
  warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800',
  default: 'bg-muted border-border',
};

const DOT_STYLES: Record<StatusType, string> = {
  success: 'bg-emerald-500',
  error: 'bg-rose-500',
  warning: 'bg-amber-500',
  default: 'bg-muted-foreground/40',
};

export function RecentActivity({ metrics }: { metrics: DashboardMetrics }) {
  const activities = metrics.recentActivity ?? [];

  return (
    <div className="col-span-full lg:col-span-1 rounded-xl border border-border/60 bg-card">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Activity Feed</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Recent system events</p>
        </div>
      </div>

      <div className="px-4 pb-4">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
            <Icons.dashboard className="h-8 w-8 opacity-20" />
            <p className="text-sm font-medium">No activity yet</p>
            <p className="text-xs opacity-60">Events will appear as you use the system</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border/60" />

            <div className="space-y-4">
              {activities.slice(0, 7).map(log => {
                const status = getStatus(log.action);
                const name = parseName(log.details);
                const label = ACTION_MAP[log.action] ?? log.action.toLowerCase().replace(/_/g, ' ');
                const href = getHref(log.entityType, log.entityId);
                const time = formatDistanceToNow(new Date(log.createdAt), { addSuffix: true });

                const inner = (
                  <div className="flex items-start gap-3 pl-1">
                    {/* Dot on timeline */}
                    <div className={cn(
                      'relative z-10 mt-1 flex h-[14px] w-[14px] flex-shrink-0 items-center justify-center rounded-full border-2 border-background',
                      STATUS_STYLES[status].split(' ')[0]
                    )}>
                      <div className={cn('h-2 w-2 rounded-full', DOT_STYLES[status])} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground leading-snug">
                        {label}
                        {name && <span className="font-semibold"> — {name}</span>}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{time}</p>
                    </div>

                    {href && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                );

                if (href) {
                  return (
                    <Link key={log.id} to={href} className="group block focus-visible:outline-none">
                      {inner}
                    </Link>
                  );
                }
                return <div key={log.id}>{inner}</div>;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
