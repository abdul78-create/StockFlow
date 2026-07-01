import * as React from 'react';
import { useDashboardMetrics } from '@/lib/hooks/useDashboard';
import { Icons } from '@/lib/icons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/kpi-card';
import { QueryStateWrapper } from '@/components/ui/query-state-wrapper';
import { Timeline } from '@/components/ui/timeline';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function DashboardPage() {
  const { data: metrics, isLoading, error } = useDashboardMetrics();

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your inventory and operations.</p>
        </div>
      </div>

      <QueryStateWrapper
        isLoading={isLoading}
        error={error}
        data={metrics}
        isEmpty={(d) => !d}
        emptyProps={{
          title: "No dashboard data",
          description: "There is no metrics data available at this time.",
        }}
      >
        {(validMetrics) => {
          const chartData = validMetrics.dailyTransactions || [];

          const timelineEvents = validMetrics.recentActivity.map((log: any) => ({
            id: log.id,
            title: `${log.action} on ${log.entityType}`,
            description: log.details || 'System action recorded',
            date: new Date(log.createdAt).toLocaleDateString(),
            icon: 'inventory' as const,
          }));

          return (
            <>
              {/* KPI Cards Row */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                  title="Total Products"
                  value={validMetrics.totalProducts}
                  icon="products"
                  status="default"
                />
                <KpiCard
                  title="Inventory Value"
                  value={`$${validMetrics.inventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                  icon="inventory"
                  status="success"
                />
                <KpiCard
                  title="Low Stock Alerts"
                  value={validMetrics.lowStockCount}
                  icon="warning"
                  status={validMetrics.lowStockCount > 0 ? 'warning' : 'success'}
                  trend={validMetrics.lowStockCount > 0 ? { value: validMetrics.lowStockCount, label: 'items need attention', direction: 'down' } : undefined}
                />
                <KpiCard
                  title="Total Warehouses"
                  value={validMetrics.totalWarehouses}
                  icon="inventory"
                  status="default"
                />
              </div>

              {/* Main Dashboard Grid */}
              <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
                
                {/* Left Column (Charts) */}
                <div className="xl:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Transaction Activity (14 Days)</CardTitle>
                      <CardDescription>Daily movement of stock items</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
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
                            />
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                              itemStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                            <Area type="monotone" dataKey="transactions" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorTx)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column (Recent Activity) */}
                <div className="xl:col-span-1">
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icons.inventory className="w-5 h-5 text-muted-foreground" />
                        System Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 px-6">
                      {timelineEvents.length > 0 ? (
                        <Timeline events={timelineEvents} />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                          <Icons.dashboard className="h-10 w-10 opacity-20 mb-4" />
                          <p>No recent activity found.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          );
        }}
      </QueryStateWrapper>
    </div>
  );
}
