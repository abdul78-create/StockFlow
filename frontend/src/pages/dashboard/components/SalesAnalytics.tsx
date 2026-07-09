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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { Download } from 'lucide-react';
import { DashboardMetrics } from '@/lib/hooks/useDashboard';

export function SalesAnalytics({ metrics }: { metrics: DashboardMetrics }) {
  const chartData = metrics.dailyTransactions ?? [];
  const [activeTab, setActiveTab] = React.useState('revenue');
  const [timeRange, setTimeRange] = React.useState('14D'); // Currently API only supports 14 days easily

  const handleExport = () => {
    // Basic UI stub for export as requested.
    console.log('Exporting Sales CSV...');
  };

  return (
    <Card className="col-span-full xl:col-span-2 shadow-sm relative group/chart h-full flex flex-col">
      <CardHeader className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2">
        <div>
          <CardTitle>Sales & Revenue Analytics</CardTitle>
          <CardDescription>Daily performance across your organization</CardDescription>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover/chart:opacity-100 transition-opacity"
            onClick={handleExport}
            title="Export CSV Data"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <div className="flex bg-muted/50 p-1 rounded-lg">
            {['7D', '14D', '30D', '90D', '1Y'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  timeRange === range ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <div className="px-6 pb-2">
        <div className="flex items-center gap-6 border-b border-border/50 text-sm">
          {['Revenue', 'Orders', 'Profit', 'Expenses'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`pb-3 font-medium transition-colors border-b-2 ${
                activeTab === tab.toLowerCase() ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <CardContent className="pt-4 flex-1 flex flex-col justify-end">
        {timeRange !== '14D' && timeRange !== '7D' ? (
          <div className="h-[280px] w-full flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border/50">
            <Icons.warning className="h-8 w-8 mb-2 opacity-50" />
            <p className="font-medium text-sm">Data range not available</p>
            <p className="text-xs">The current API only provides up to 14 days of transaction history.</p>
          </div>
        ) : chartData.length > 0 && chartData.some((d) => d.transactions > 0) ? (
          <div className="h-[280px] w-full">
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
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
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <p className="text-sm text-muted-foreground capitalize">{activeTab}:</p>
                            <p className="text-sm font-bold text-foreground">
                              {activeTab === 'orders' 
                                ? payload[0].value 
                                : `$${Number(payload[0].value).toLocaleString()}`}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={
                    activeTab === 'revenue' ? 'revenue' : 
                    activeTab === 'expenses' ? 'expenses' : 
                    activeTab === 'profit' ? (row: any) => row.revenue - row.expenses : 
                    'transactions'
                  }
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorTx)"
                  filter="url(#shadow)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[280px] w-full flex flex-col items-center justify-center gap-2 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border/50">
            <Icons.inventory className="h-10 w-10 opacity-20" />
            <p className="text-sm font-medium">No transactions recorded</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
