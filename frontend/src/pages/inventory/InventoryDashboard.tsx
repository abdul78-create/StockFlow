import * as React from 'react';
import { useInventoryBalances, useStockHealth, useWarehouses } from '@/lib/hooks/useInventory';
import { Icons } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/kpi-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { InventoryBalance } from '@/lib/types/inventory';
import { QueryStateWrapper } from '@/components/ui/query-state-wrapper';
import { LedgerTimeline } from './components/LedgerTimeline';
import { ReorderSuggestions } from './components/ReorderSuggestions';
import { StockMovementDrawers, DrawerActionType } from './components/StockMovementDrawers';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function InventoryDashboard() {
  const [selectedWarehouseId, setSelectedWarehouseId] = React.useState<string>('all');
  const [activeDrawer, setActiveDrawer] = React.useState<DrawerActionType>(null);

  const { data: warehouses } = useWarehouses();
  
  const queryWarehouseId = selectedWarehouseId === 'all' ? undefined : selectedWarehouseId;
  const { data: balances, isLoading: isBalancesLoading, error: balancesError } = useInventoryBalances({ warehouseId: queryWarehouseId, limit: 50 });
  const { data: health, isLoading: isHealthLoading, error: healthError } = useStockHealth(queryWarehouseId);

  const columns: ColumnDef<InventoryBalance>[] = [
    {
      id: 'productName',
      accessorFn: (row) => row.product?.name || 'Unknown',
      header: 'Product',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.product?.name || 'Unknown'}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.original.product?.sku || 'Unknown'}</p>
        </div>
      ),
    },
    {
      id: 'warehouseName',
      accessorFn: (row) => row.warehouse?.name || 'Unknown',
      header: 'Warehouse',
      cell: ({ row }) => <span className="text-sm">{row.original.warehouse?.name || 'Unknown'}</span>,
    },
    {
      accessorKey: 'availableQuantity',
      header: 'Available',
      cell: ({ row }) => {
        const available = row.original.availableQuantity;
        const min = row.original.product?.minimumStock || 0;
        const isCritical = available === 0;
        const isLow = available > 0 && available <= min;
        
        return (
          <div className="flex items-center gap-2">
            <span className={isCritical ? 'text-destructive font-bold' : isLow ? 'text-warning font-medium' : ''}>
              {available}
            </span>
            {isCritical && <span className="px-1.5 py-0.5 rounded text-[10px] bg-destructive/10 text-destructive font-medium">Out of Stock</span>}
            {isLow && !isCritical && <span className="px-1.5 py-0.5 rounded text-[10px] bg-warning/10 text-warning font-medium">Low</span>}
          </div>
        );
      },
    },
    {
      accessorKey: 'reservedQuantity',
      header: 'Reserved',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.reservedQuantity}</span>,
    },
    {
      accessorKey: 'value',
      header: 'Total Value',
      cell: ({ row }) => (
        <span>${((row.original.quantity || 0) * (row.original.product?.costPrice || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      id: 'tracking',
      header: 'Tracking',
      cell: ({ row }) => {
        const hasBatches = row.original.batches && row.original.batches.length > 0;
        const hasSerials = row.original.serialNumbers && row.original.serialNumbers.length > 0;
        
        if (!hasBatches && !hasSerials) return <span className="text-muted-foreground text-xs">None</span>;
        
        return (
          <div className="flex gap-1 flex-wrap max-w-[120px]">
            {hasBatches && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-500 font-medium" title={`${row.original.batches?.length} batches`}>
                Batches
              </span>
            )}
            {hasSerials && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-500 font-medium" title={`${row.original.serialNumbers?.length} serials`}>
                Serials
              </span>
            )}
          </div>
        );
      },
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header and Warehouse Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory Control</h2>
          <p className="text-muted-foreground">Manage and track your warehouse operations.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId}>
            <SelectTrigger className="w-[200px] bg-background">
              <SelectValue placeholder="All Warehouses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warehouses</SelectItem>
              {warehouses?.map(w => (
                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Quick Actions Dropdown */}
          <div className="hidden sm:flex gap-2 ml-4">
            <Button variant="outline" size="sm" onClick={() => setActiveDrawer('RECEIVE')}>
              <Icons.download className="mr-2 h-4 w-4" /> Receive
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActiveDrawer('TRANSFER')}>
              <Icons.refresh className="mr-2 h-4 w-4" /> Transfer
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActiveDrawer('ADJUST')}>
              <Icons.edit className="mr-2 h-4 w-4" /> Adjust
            </Button>
          </div>
        </div>
      </div>

      <QueryStateWrapper
        isLoading={isHealthLoading || isBalancesLoading}
        error={healthError || balancesError}
        data={{ health, balances }}
        isEmpty={(d) => !d.health}
        emptyProps={{
          title: "No inventory data",
          description: "There is no inventory data available at this time.",
        }}
      >
        {({ health: validHealth, balances: validBalances }) => {
          const chartData = Array.from({ length: 14 }).map((_, i) => ({
            date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            value: (validHealth?.totalValue || 1000000) * (1 - (13 - i) * 0.01 + Math.random() * 0.05),
          }));

          return (
            <>
              {/* KPI Cards Row */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                  title="Inventory Value"
                  value={`$${(validHealth?.totalValue || 0).toLocaleString()}`}
                  icon="inventory"
                  trend={{ value: 2.4, label: 'vs last month', direction: 'up' }}
                  status="default"
                />
                <KpiCard
                  title="Stock Health"
                  value={`${validHealth?.score || 0}%`}
                  icon="success"
                  trend={{ value: 1.2, label: 'vs last month', direction: 'up' }}
                  status={(validHealth?.score || 0) > 90 ? 'success' : 'warning'}
                />
                <KpiCard
                  title="Low Stock Alerts"
                  value={validHealth?.lowStockCount || 0}
                  icon="warning"
                  trend={{ value: 5, label: 'items need attention', direction: 'neutral' }}
                  status={(validHealth?.lowStockCount || 0) > 0 ? 'warning' : 'success'}
                />
                <KpiCard
                  title="Out of Stock"
                  value={validHealth?.outOfStockCount || 0}
                  icon="error"
                  status={(validHealth?.outOfStockCount || 0) > 0 ? 'error' : 'success'}
                />
              </div>

              {/* Main Dashboard Grid */}
              <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
                
                {/* Left Column (Charts & Suggestions) */}
                <div className="xl:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Inventory Value Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis 
                              dataKey="date" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                              dy={10}
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                              tickFormatter={(val) => `$${(val / 1000)}k`}
                            />
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                              itemStyle={{ color: 'hsl(var(--foreground))' }}
                              formatter={(value: any) => [`$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Value']}
                            />
                            <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <ReorderSuggestions warehouseId={queryWarehouseId} />
                </div>

                {/* Right Column (Ledger Activity Feed) */}
                <div className="xl:col-span-1">
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icons.inventory className="w-5 h-5 text-muted-foreground" />
                        Live Ledger
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 px-6">
                      <LedgerTimeline warehouseId={queryWarehouseId} />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Detailed Stock Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Stock Balances</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={validBalances?.data || []}
                    isLoading={false}
                    searchKey="productName"
                    searchPlaceholder="Search inventory..."
                    enableExport={true}
                    exportFilename="inventory-balances.csv"
                  />
                </CardContent>
              </Card>
            </>
          );
        }}
      </QueryStateWrapper>

      {/* Drawers for operational movements */}
      <StockMovementDrawers 
        action={activeDrawer} 
        onClose={() => setActiveDrawer(null)} 
        defaultWarehouseId={queryWarehouseId}
      />
    </div>
  );
}
