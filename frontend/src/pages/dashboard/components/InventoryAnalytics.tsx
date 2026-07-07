import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KpiCard } from '@/components/ui/kpi-card';
import { DashboardMetrics } from '@/lib/hooks/useDashboard';
import { EmptyState } from '@/components/ui/empty-state';
import { Icons } from '@/lib/icons';
import { Download } from 'lucide-react';

export function InventoryAnalytics({ metrics }: { metrics: DashboardMetrics }) {
  const handleExport = () => {
    console.log('Exporting Inventory CSV...');
  };

  return (
    <Card className="col-span-full xl:col-span-1 shadow-sm relative group/chart">
      <CardHeader className="flex flex-row items-start justify-between pb-4 space-y-0">
        <div>
          <CardTitle>Inventory Health</CardTitle>
          <CardDescription>Stock status across all locations</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground opacity-0 group-hover/chart:opacity-100 transition-opacity"
          onClick={handleExport}
          title="Export CSV Data"
        >
          <Download className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent>
        {metrics.totalProducts === 0 ? (
          <EmptyState
            icon={Icons.products}
            title="No inventory data"
            description="Add products to see inventory health metrics."
            className="border-none shadow-none bg-transparent py-8"
          />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 shadow-sm transition-colors hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Icons.warning className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Low Stock</p>
                  <p className="text-xs text-muted-foreground">Items below threshold</p>
                </div>
              </div>
              <span className="text-xl font-bold">{metrics.lowStockCount}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 shadow-sm transition-colors hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <Icons.warning className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Out of Stock</p>
                  <p className="text-xs text-muted-foreground">Needs immediate restock</p>
                </div>
              </div>
              <span className="text-xl font-bold">0</span> {/* Stubbed as zero for now, since API doesn't split it */}
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 shadow-sm transition-colors hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Icons.building className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Active Warehouses</p>
                  <p className="text-xs text-muted-foreground">Storage locations</p>
                </div>
              </div>
              <span className="text-xl font-bold">{metrics.totalWarehouses}</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 shadow-sm transition-colors hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Icons.products className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Unique Products</p>
                  <p className="text-xs text-muted-foreground">Catalog size</p>
                </div>
              </div>
              <span className="text-xl font-bold">{metrics.totalProducts}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
