import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    { label: 'Create Product', icon: Icons.products, href: '/products/new' },
    { label: 'Purchase Order', icon: Icons.purchaseOrders, href: '/purchase-orders/new' },
    { label: 'Sales Order', icon: Icons.salesOrders, href: '/sales-orders/new' },
    { label: 'Add Customer', icon: Icons.users, href: '/customers/new' },
    { label: 'Add Supplier', icon: Icons.truck, href: '/suppliers/new' },
  ];

  return (
    <Card className="col-span-full shadow-sm bg-muted/30 border-dashed border-border">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm font-medium text-muted-foreground mr-2">Quick Actions:</span>
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                className="rounded-full shadow-sm bg-background hover:bg-muted"
                onClick={() => navigate(action.href)}
              >
                <Icon className="h-4 w-4 mr-2 text-primary" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
