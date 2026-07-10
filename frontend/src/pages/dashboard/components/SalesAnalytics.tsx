import * as React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { cn } from '@/lib/utils';
import { DashboardMetrics } from '@/lib/hooks/useDashboard';
import { Icons } from '@/lib/icons';

type TabKey = 'revenue' | 'orders' | 'profit' | 'expenses';

const TABS: { key: TabKey; label: string; color: string }[] = [
  { key: 'revenue', label: 'Revenue', color: 'hsl(142 71% 45%)' },
  { key: 'orders', label: 'Orders', color: 'hsl(217 91% 60%)' },
  { key: 'profit', label: 'Profit', color: 'hsl(262 83% 58%)' },
  { key: 'expenses', label: 'Expenses', color: 'hsl(0 84% 60%)' },
];

function formatAxis(value: number, tab: TabKey): string {
  if (tab === 'orders') return String(value);
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

function formatTooltip(value: number | string, tab: TabKey): string {
  const n = Number(value);
  if (tab === 'orders') return `${n} orders`;
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getDataKey(tab: TabKey, row: { transactions: number; revenue: number; expenses: number }) {
  if (tab === 'revenue') return row.revenue;
  if (tab === 'orders') return row.transactions;
  if (tab === 'expenses') return row.expenses;
  return Math.max(0, row.revenue - row.expenses); // profit
}

export function SalesAnalytics({ metrics }: { metrics: DashboardMetrics }) {
  const [activeTab, setActiveTab] = React.useState<TabKey>('revenue');
  const rawData = metrics.dailyTransactions ?? [];

  // Build data with computed values
  const chartData = rawData.map(d => ({
    ...d,
    profit: Math.max(0, d.revenue - d.expenses),
  }));

  const currentTab = TABS.find(t => t.key === activeTab) ?? TABS[0];
  const hasData = chartData.length > 0 && chartData.some(d => d.transactions > 0 || d.revenue > 0);

  return (
    <div className="col-span-full xl:col-span-2 rounded-xl border border-border/60 bg-card">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-0">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Sales & Revenue Analytics</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Daily performance — last 14 days</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-0 border-b border-border/60 px-5 mt-4">
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'relative pb-3 pr-5 text-xs font-medium transition-colors duration-150',
              activeTab === tab.key
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span
                className="absolute bottom-0 left-0 right-5 h-0.5 rounded-full"
                style={{ backgroundColor: tab.color }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="p-5 pt-4">
        {hasData ? (
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 4, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={`grad-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={currentTab.color} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={currentTab.color} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                  opacity={0.6}
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 500 }}
                  dy={8}
                  interval="preserveStartEnd"
                  minTickGap={40}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 500 }}
                  tickFormatter={v => formatAxis(v, activeTab)}
                  allowDecimals={false}
                  width={56}
                />
                <Tooltip
                  cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-lg border border-border bg-card px-3 py-2.5 shadow-lg text-xs">
                        <p className="font-semibold text-foreground mb-1.5">{label}</p>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: currentTab.color }}
                          />
                          <span className="text-muted-foreground capitalize">{activeTab}:</span>
                          <span className="font-bold text-foreground">
                            {formatTooltip(payload[0].value as number, activeTab)}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={(row: any) => getDataKey(activeTab, row)}
                  stroke={currentTab.color}
                  strokeWidth={2}
                  fill={`url(#grad-${activeTab})`}
                  activeDot={{ r: 5, strokeWidth: 0, fill: currentTab.color }}
                  animationDuration={400}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[240px] flex flex-col items-center justify-center gap-2 text-muted-foreground rounded-xl border border-dashed border-border/50">
            <Icons.inventory className="h-8 w-8 opacity-20" />
            <p className="text-sm font-medium">No transaction data yet</p>
            <p className="text-xs opacity-60">Start creating orders to see analytics</p>
          </div>
        )}
      </div>
    </div>
  );
}
