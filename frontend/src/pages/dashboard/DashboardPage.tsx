import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardMetrics, DashboardMetrics } from '@/lib/hooks/useDashboard';
import { Icons } from '@/lib/icons';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { KpiCard } from '@/components/ui/kpi-card';
import { DashboardSkeleton } from '@/components/ui/page-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { OnboardingChecklist } from '@/components/OnboardingChecklist';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Converts raw audit action enums to human-readable present-tense phrases */
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

function formatCurrency(value: number | undefined | null): string {
  const num = Number(value ?? 0);
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: metrics, isLoading, error, refetch } = useDashboardMetrics();

  if (isLoading) return <DashboardSkeleton />;

  if (error || !metrics) {
    return (
      <div className="flex-1 p-4 md:p-8">
        <ErrorState
          title="Couldn't load dashboard"
          message="We couldn't fetch your dashboard data. Please check your connection and try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return <DashboardContent metrics={metrics} navigate={navigate} />;
}

// ─── Dashboard Content ───────────────────────────────────────────────────────

function DashboardContent({
  metrics,
  navigate,
}: {
  metrics: DashboardMetrics;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const chartData = metrics.dailyTransactions ?? [];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground text-sm">
            Overview of your inventory and operations.
          </p>
        </div>
      </div>

      {/* Onboarding checklist */}
      <OnboardingChecklist />

      {/* ── Financial KPIs ─────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Revenue"
          value={formatCurrency(metrics.revenue)}
          icon="inventory"
          status="success"
        />
        <KpiCard
          title="Expenses"
          value={formatCurrency(metrics.expenses)}
          icon="cart"
          status="default"
        />
        <KpiCard
          title="Profit"
          value={formatCurrency(metrics.profit)}
          icon="inventory"
          status={metrics.profit >= 0 ? 'success' : 'warning'}
        />
        <KpiCard
          title="Inventory Value"
          value={formatCurrency(metrics.inventoryValue)}
          icon="inventory"
          status="default"
        />
      </div>

      {/* ── Entity KPIs ─────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Products"
          value={metrics.totalProducts}
          icon="products"
          status="default"
        />
        <KpiCard
          title="Total Customers"
          value={metrics.totalCustomers}
          icon="users"
          status="default"
        />
        <KpiCard
          title="Pending Sales Orders"
          value={metrics.pendingSalesOrders}
          icon="salesOrders"
          status={metrics.pendingSalesOrders > 0 ? 'warning' : 'success'}
        />
        <KpiCard
          title="Pending Purchase Orders"
          value={metrics.pendingPurchaseOrders}
          icon="purchaseOrders"
          status={metrics.pendingPurchaseOrders > 0 ? 'warning' : 'success'}
        />
      </div>

      {/* ── Status KPIs ─────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Low Stock Alerts"
          value={metrics.lowStockCount}
          icon="warning"
          status={metrics.lowStockCount > 0 ? 'warning' : 'success'}
          trend={
            metrics.lowStockCount > 0
              ? { value: metrics.lowStockCount, label: 'items need attention', direction: 'down' }
              : undefined
          }
        />
        <KpiCard
          title="Total Suppliers"
          value={metrics.totalSuppliers}
          icon="truck"
          status="default"
        />
        <KpiCard
          title="Warehouses"
          value={metrics.totalWarehouses}
          icon="building"
          status="default"
        />
        <KpiCard
          title="Monthly Transactions"
          value={metrics.monthlyTransactionsCount}
          icon="inventory"
          status="default"
        />
      </div>

      {/* ── Charts + Activity ────────────────────────────────────── */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
        {/* Activity Chart */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Transaction Activity</CardTitle>
            <CardDescription>Daily stock movements over the last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              {chartData.length > 0 && chartData.some((d) => d.transactions > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTx" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                      </linearGradient>
                      <filter id="shadow" height="200%">
                        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="hsl(var(--primary))" floodOpacity="0.2" />
                      </filter>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
                      dy={10}
                      interval="preserveStartEnd"
                      minTickGap={30}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
                      allowDecimals={false}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: 13,
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        padding: '12px 16px'
                      }}
                      itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                      labelStyle={{ fontWeight: 500, color: 'hsl(var(--muted-foreground))', marginBottom: '8px' }}
                      cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="transactions"
                      name="Transactions"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorTx)"
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: 'hsl(var(--background))', fill: 'hsl(var(--primary))' }}
                      style={{ filter: 'url(#shadow)' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Icons.inventory className="h-10 w-10 opacity-20" />
                  <p className="text-sm">No transactions recorded in the last 14 days.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.inventory className="h-4 w-4 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            {metrics.recentActivity.length > 0 ? (
              <ul className="space-y-4">
                {metrics.recentActivity.map((log) => (
                  <li key={log.id} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-7 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icons.inventory className="size-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {friendlyAction(log.action, log.entityType)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <Icons.dashboard className="h-10 w-10 opacity-20 mb-3" />
                <p className="text-sm">No recent activity yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Top Products + Recent Customers ─────────────────────── */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Top Products by Stock Value */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products by Stock Value</CardTitle>
            <CardDescription>Active products with highest inventory value</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.topProducts.length > 0 ? (
              <ul className="divide-y divide-border">
                {metrics.topProducts.map((product, index) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/40 -mx-2 px-2 rounded transition-colors"
                    onClick={() => navigate(`/products/${product.id}`)}
                    role="button"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono text-muted-foreground w-5 flex-shrink-0">
                        #{index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-sm font-semibold">{formatCurrency(product.stockValue)}</p>
                      <p className="text-xs text-muted-foreground">{product.currentStock} units</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                <Icons.products className="h-8 w-8 opacity-20" />
                <p className="text-sm">No active products yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Customers */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Customers</CardTitle>
            <CardDescription>Latest customer accounts added</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.recentCustomers.length > 0 ? (
              <ul className="divide-y divide-border">
                {metrics.recentCustomers.map((customer) => (
                  <li
                    key={customer.id}
                    className="flex items-center gap-3 py-3 cursor-pointer hover:bg-muted/40 -mx-2 px-2 rounded transition-colors"
                    onClick={() => navigate(`/customers/${customer.id}`)}
                    role="button"
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs font-semibold bg-muted">
                        {customer.name
                          .split(' ')
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{customer.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {customer.email ?? 'No email'}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {formatDistanceToNow(new Date(customer.createdAt), { addSuffix: true })}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                <Icons.users className="h-8 w-8 opacity-20" />
                <p className="text-sm">No customers added yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
