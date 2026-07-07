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
          value={formatCurrency(metrics.revenue)}
          icon="inventory"
          status="success"
        />
      </div>
      <div className="lg:col-span-2">
        <KpiCard
          title="Profit"
          value={formatCurrency(metrics.profit)}
          icon="inventory"
          status={metrics.profit >= 0 ? 'success' : 'warning'}
        />
      </div>
      <div className="lg:col-span-2">
        <KpiCard
          title="Expenses"
          value={formatCurrency(metrics.expenses)}
          icon="cart"
          status="default"
        />
      </div>
      <div className="lg:col-span-2">
        <KpiCard
          title="Inventory Value"
          value={formatCurrency(metrics.inventoryValue)}
          icon="inventory"
          status="default"
        />
      </div>
      <div className="lg:col-span-2">
        <KpiCard
          title="Sales Orders"
          value={metrics.totalSalesOrders}
          icon="salesOrders"
          status="default"
        />
      </div>
      <div className="lg:col-span-2">
        <KpiCard
          title="Customers"
          value={metrics.totalCustomers}
          icon="users"
          status="default"
        />
      </div>
    </div>
  );
}
