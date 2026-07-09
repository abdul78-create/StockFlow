import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/lib/icons';
import { DashboardMetrics } from '@/lib/hooks/useDashboard';
import { formatDistanceToNow } from 'date-fns';

export function RecentCustomersPanel({ metrics }: { metrics: DashboardMetrics }) {
  const customers = metrics.recentCustomers || [];

  return (
    <Card className="col-span-full xl:col-span-1 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Icons.users className="h-4 w-4 text-muted-foreground" />
          Recent Customers
        </CardTitle>
        <CardDescription>Newest registered clients</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-start">
        {customers.length === 0 ? (
          <EmptyState
            icon={Icons.users}
            title="No customers yet"
            description="New customers will appear here."
            className="border-none shadow-none bg-transparent py-6"
          />
        ) : (
          <div className="space-y-4">
            {customers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                    {customer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{customer.name}</span>
                    <span className="text-xs text-muted-foreground">{customer.email || 'No email provided'}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground">
                    Joined {formatDistanceToNow(new Date(customer.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
