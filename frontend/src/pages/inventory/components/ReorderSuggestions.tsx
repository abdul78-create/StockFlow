import * as React from 'react';
import { useInventoryBalances } from '@/lib/hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/lib/icons';

interface ReorderSuggestionsProps {
  warehouseId?: string;
}

export function ReorderSuggestions({ warehouseId }: ReorderSuggestionsProps) {
  // In a real scenario, there might be a dedicated endpoint for suggestions.
  // We'll use the balances endpoint and filter client-side for this demo.
  const { data, isLoading, isError } = useInventoryBalances({ warehouseId, limit: 100 });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reorder Suggestions</CardTitle>
          <CardDescription>Items that need replenishment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) return null;

  // Filter products where current stock <= minimum stock
  const suggestions = data.data.filter(b => b.availableQuantity <= b.product.minimumStock);

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.success className="w-5 h-5 text-success" />
            Stock Levels Healthy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No immediate reorders required.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.warning className="w-5 h-5 text-warning" />
          Reorder Suggestions
        </CardTitle>
        <CardDescription>These items are at or below their minimum threshold.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground text-left border-b border-border">
              <tr>
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium">Current</th>
                <th className="pb-2 font-medium">Min</th>
                <th className="pb-2 font-medium">Suggested</th>
                <th className="pb-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {suggestions.map(item => {
                const suggestedQty = item.product.maximumStock - item.availableQuantity;
                return (
                  <tr key={item.id} className="group">
                    <td className="py-3 font-medium">{item.product.name}</td>
                    <td className="py-3 text-destructive font-bold">{item.availableQuantity}</td>
                    <td className="py-3 text-muted-foreground">{item.product.minimumStock}</td>
                    <td className="py-3 text-success font-medium">+{suggestedQty}</td>
                    <td className="py-3 text-right">
                      <Button variant="outline" size="sm" className="h-8">
                        Create PO
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
