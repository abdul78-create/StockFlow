import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timeline, TimelineEvent } from '@/components/ui/timeline';
import { DashboardMetrics } from '@/lib/hooks/useDashboard';
import { Icons } from '@/lib/icons';
import { formatDistanceToNow } from 'date-fns';
import { EmptyState } from '@/components/ui/empty-state';

function friendlyAction(action: string, entityType: string | null): string {
  const entity = entityType ?? 'record';
  const readable: Record<string, string> = {
    PRODUCT_CREATED: `Created product`,
    PRODUCT_UPDATED: `Updated product`,
    PRODUCT_DELETED: `Archived product`,
    PURCHASE_ORDER_CREATED: `Created purchase order`,
    PURCHASE_ORDER_UPDATED: `Updated purchase order`,
    PURCHASE_ORDER_APPROVED: `Approved purchase order`,
    PURCHASE_ORDER_COMPLETED: `Completed purchase order`,
    PURCHASE_ORDER_CANCELLED: `Cancelled purchase order`,
    SALES_ORDER_CREATED: `Created sales order`,
    SALES_ORDER_UPDATED: `Updated sales order`,
    SALES_ORDER_APPROVED: `Approved sales order`,
    SALES_ORDER_SHIPPED: `Shipped sales order`,
    SALES_ORDER_DELIVERED: `Delivered sales order`,
    INVENTORY_ADJUSTMENT: `Adjusted inventory`,
    INVENTORY_TRANSFER: `Transferred inventory`,
    CUSTOMER_CREATED: `Added customer`,
    CUSTOMER_UPDATED: `Updated customer`,
    SUPPLIER_CREATED: `Added supplier`,
    SUPPLIER_UPDATED: `Updated supplier`,
    WAREHOUSE_CREATED: `Created warehouse`,
    QUOTATION_CREATED: `Created quotation`,
    QUOTATION_CONVERTED: `Converted quotation to sales order`,
    USER_INVITED: `Invited team member`,
    USER_ROLE_CHANGED: `Changed user role`,
  };
  return readable[action] ?? `${entity} — ${action.toLowerCase().replace(/_/g, ' ')}`;
}

function getActionStatus(action: string): 'default' | 'success' | 'warning' | 'error' {
  if (action.includes('CREATED') || action.includes('COMPLETED') || action.includes('DELIVERED')) return 'success';
  if (action.includes('DELETED') || action.includes('CANCELLED')) return 'error';
  if (action.includes('UPDATED') || action.includes('ADJUSTMENT')) return 'warning';
  return 'default';
}

function getActionIcon(action: string): keyof typeof Icons {
  if (action.includes('PRODUCT') || action.includes('INVENTORY')) return 'inventory';
  if (action.includes('PURCHASE') || action.includes('SUPPLIER')) return 'truck';
  if (action.includes('SALES') || action.includes('QUOTATION')) return 'cart';
  if (action.includes('CUSTOMER') || action.includes('USER')) return 'users';
  if (action.includes('WAREHOUSE')) return 'building';
  return 'dashboard';
}

function getEntityHref(entityType: string | null, entityId: string | null): string | undefined {
  if (!entityId) return undefined;
  switch (entityType) {
    case 'PRODUCT': return `/products/${entityId}`;
    case 'CUSTOMER': return `/customers/${entityId}`;
    case 'SUPPLIER': return `/suppliers/${entityId}`;
    case 'PURCHASE_ORDER': return `/purchase-orders/${entityId}`;
    case 'SALES_ORDER': return `/sales-orders/${entityId}`;
    case 'WAREHOUSE': return `/settings/warehouses`;
    default: return undefined;
  }
}

function parseEntityName(details: string | null): string {
  if (!details) return '';
  try {
    const parsed = JSON.parse(details);
    return parsed.name || parsed.sku || parsed.title || parsed.orderNumber || parsed.role || '';
  } catch {
    return '';
  }
}

export function RecentActivity({ metrics }: { metrics: DashboardMetrics }) {
  const events: TimelineEvent[] = metrics.recentActivity.map(log => {
    const extractedName = parseEntityName(log.details);
    const titleBase = friendlyAction(log.action, log.entityType);
    
    return {
      id: log.id,
      title: extractedName ? `${titleBase} — ${extractedName}` : titleBase,
      description: `Performed by user ${log.userId.split('-')[0]}`,
      date: formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }),
      status: getActionStatus(log.action),
      icon: getActionIcon(log.action),
      href: getEntityHref(log.entityType, log.entityId),
      linkText: 'View',
    };
  });

  return (
    <Card className="col-span-full lg:col-span-1 shadow-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.dashboard className="h-4 w-4 text-muted-foreground" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pt-2 flex-1 flex flex-col justify-start">
        {events.length > 0 ? (
          <Timeline events={events.slice(0, 5)} />
        ) : (
          <EmptyState
            icon={Icons.dashboard}
            title="No recent activity"
            description="Activity will appear here once transactions are recorded."
            className="border-none shadow-none bg-transparent py-10"
          />
        )}
      </CardContent>
    </Card>
  );
}
