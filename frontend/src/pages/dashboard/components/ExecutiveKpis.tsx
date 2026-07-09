import * as React from 'react';
import { KpiCard } from '@/components/ui/kpi-card';
import { DashboardMetrics } from '@/lib/hooks/useDashboard';

function formatCurrency(value: number | undefined | null): string {
  const num = Number(value ?? 0);
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ExecutiveKpis({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
      <div className="lg:col-span-2">
        <KpiCard
          title="Revenue"
          description="Total received revenue across all confirmed transactions"
          value={formatCurrency(metrics.revenue)}
          icon="inventory"
          status="success"
          href="/reports"
        />
      </div>
      <div className="lg:col-span-2">
        <KpiCard
          title="Profit"
          description="Net profit after expenses"
          value={formatCurrency(metrics.profit)}
          icon="inventory"
          status={metrics.profit >= 0 ? 'success' : 'warning'}
          href="/reports"
        />
      </div>
      <div className="lg:col-span-2">
        <KpiCard
          title="Expenses"
          description="Total expenses from purchase orders and adjustments"
          value={formatCurrency(metrics.expenses)}
          icon="cart"
          status="default"
          href="/reports"
        />
      </div>
      <div className="lg:col-span-2">
        <KpiCard
          title="Inventory Value"
          description="Total calculated asset value of current stock"
          value={formatCurrency(metrics.inventoryValue)}
          icon="inventory"
          status="default"
          href="/inventory"
        />
      </div>
      <div className="lg:col-span-2">
        <KpiCard
          title="Sales Orders"
          description="Total sales orders placed"
          value={metrics.totalSalesOrders}
          icon="salesOrders"
          status="default"
          href="/sales-orders"
        />
      </div>
      <div className="lg:col-span-2">
        <KpiCard
          title="Customers"
          description="Total active customers"
          value={metrics.totalCustomers}
          icon="users"
          status="default"
          href="/customers"
        />
      </div>
    </div>
  );
}
