import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/lib/icons';
import { DashboardMetrics } from '@/lib/hooks/useDashboard';

export function TopProductsPanel({ metrics }: { metrics: DashboardMetrics }) {
  const products = metrics.topProducts || [];

  return (
    <Card className="col-span-full xl:col-span-1 shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Icons.products className="h-4 w-4 text-muted-foreground" />
          Top Products
        </CardTitle>
        <CardDescription>Highest value inventory items</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-start">
        {products.length === 0 ? (
          <EmptyState
            icon={Icons.products}
            title="No products found"
            description="Add products to see them ranked by value."
            className="border-none shadow-none bg-transparent py-6"
          />
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{product.name}</span>
                  <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-foreground">
                    ${Number(product.stockValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-muted-foreground">{product.currentStock} in stock</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
