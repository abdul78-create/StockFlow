import * as React from 'react';
import { useDashboardMetrics, DashboardMetrics } from '@/lib/hooks/useDashboard';
import { useAuthStore } from '@/store/auth';
import { useWorkspaceStore } from '@/store/workspace';
import { ErrorState } from '@/components/ui/error-state';
import { OnboardingChecklist } from '@/components/OnboardingChecklist';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  ArrowUpRight, 
  FileText, 
  Users, 
  DollarSign, 
  Warehouse, 
  PlusCircle, 
  UserPlus, 
  FilePlus, 
  CheckSquare, 
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export function DashboardPage() {
  const { data: metrics, isLoading, error, refetch } = useDashboardMetrics();

  if (isLoading) return <DashboardSkeleton />;

  if (error || !metrics) {
    return (
      <div className="flex-1 p-4 md:p-8 bg-slate-950 min-h-screen">
        <ErrorState
          title="Couldn't load dashboard"
          message="We couldn't fetch your dashboard data. Please check your connection and try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return <DashboardContent metrics={metrics} refetch={refetch} />;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function DashboardContent({ metrics, refetch }: { metrics: DashboardMetrics; refetch: () => void }) {
  const { user } = useAuthStore();
  const { activeWorkspaceId, organizations } = useWorkspaceStore();
  const activeWorkspace = organizations.find(o => o.id === activeWorkspaceId);
  const navigate = useNavigate();
  
  const [analyticsTab, setAnalyticsTab] = React.useState<'revenue' | 'orders' | 'profit'>('revenue');

  // Chart data formatting
  const chartData = React.useMemo(() => {
    return metrics.dailyTransactions.map(d => ({
      name: format(new Date(d.date), 'MMM dd'),
      Revenue: d.revenue,
      Orders: d.transactions,
      Profit: d.revenue - d.expenses,
    }));
  }, [metrics.dailyTransactions]);

  // Donut data for Inventory Health
  const donutData = [
    { name: 'Healthy Stock', value: metrics.totalProducts - metrics.lowStockCount - metrics.outOfStockCount, color: '#10b981' },
    { name: 'Low Stock', value: metrics.lowStockCount, color: '#f59e0b' },
    { name: 'Out of Stock', value: metrics.outOfStockCount, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up bg-slate-950 text-slate-100 p-6 min-h-screen">
      
      {/* ROW 1: Welcome + Status Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 border border-white/5 p-5 rounded-2xl backdrop-blur-xl">
        <div className="space-y-1">
          <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Good Morning, {user?.firstName || 'CEO'} 👋
          </h1>
          <p className="text-xs text-slate-400">
            {activeWorkspace?.name || 'Workspace'} · <span className="font-bold text-slate-350">{activeWorkspace?.role || 'Owner'}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Date</p>
            <p className="text-xs font-semibold text-slate-300">{format(new Date(), 'EEEE, MMMM dd, yyyy')}</p>
          </div>
          <div className="h-8 w-px bg-white/10 hidden sm:block" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Operational Status</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400">Active synced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Checklist */}
      <OnboardingChecklist />

      {/* ROW 2: Executive KPIs (4 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <Card className="bg-slate-900/40 border-white/5 hover:border-white/10 transition-all duration-200 cursor-pointer" onClick={() => navigate('/reports')}>
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Revenue</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{formatCurrency(metrics.revenue)}</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> +4.2%
              </span>
            </div>
            <p className="text-[10px] text-slate-400">vs last period ($24,000.00)</p>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card className="bg-slate-900/40 border-white/5 hover:border-white/10 transition-all duration-200 cursor-pointer" onClick={() => navigate('/reports')}>
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expenses</span>
            <FileText className="h-4 w-4 text-rose-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{formatCurrency(metrics.expenses)}</span>
              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                <TrendingDown className="h-3 w-3" /> -1.8%
              </span>
            </div>
            <p className="text-[10px] text-slate-400">vs last period ($14,500.00)</p>
          </CardContent>
        </Card>

        {/* Inventory Value */}
        <Card className="bg-slate-900/40 border-white/5 hover:border-white/10 transition-all duration-200 cursor-pointer" onClick={() => navigate('/inventory')}>
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Inventory Value</span>
            <Warehouse className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{formatCurrency(metrics.inventoryValue)}</span>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                Stable
              </span>
            </div>
            <p className="text-[10px] text-slate-400">{metrics.totalProducts} active products in catalog</p>
          </CardContent>
        </Card>

        {/* Customers */}
        <Card className="bg-slate-900/40 border-white/5 hover:border-white/10 transition-all duration-200 cursor-pointer" onClick={() => navigate('/customers')}>
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Customers</span>
            <Users className="h-4 w-4 text-sky-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{metrics.totalCustomers}</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                +12 new
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Total customer registrations</p>
          </CardContent>
        </Card>
      </div>

      {/* ROW 3: Analytics Grid (2/3 + 1/3) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sales & Revenue Area Chart */}
        <Card className="xl:col-span-2 bg-slate-900/40 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Workspace Performance
            </CardTitle>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-white/5">
              {(['revenue', 'orders', 'profit'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setAnalyticsTab(tab)}
                  className={cn(
                    'text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-md transition-all duration-150',
                    analyticsTab === tab ? 'bg-white text-slate-950' : 'text-slate-450 hover:text-white'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pt-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                <ChartTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '10px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey={analyticsTab === 'revenue' ? 'Revenue' : analyticsTab === 'orders' ? 'Orders' : 'Profit'} 
                  stroke="#ffffff" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inventory Health Donut */}
        <Card className="bg-slate-900/40 border-white/5 flex flex-col justify-between">
          <CardHeader className="pb-1">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Inventory Health
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center pt-2 space-y-4">
            <div className="h-[130px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <p className="text-xl font-black text-white">{metrics.lowStockCount}</p>
                <p className="text-[8px] text-slate-500 uppercase tracking-widest font-extrabold">Low Stock</p>
              </div>
            </div>
            {/* Legend */}
            <div className="w-full grid grid-cols-3 gap-2 text-center text-[10px]">
              <div>
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 mr-1.5" />
                <span className="text-slate-400">Healthy</span>
              </div>
              <div>
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500 mr-1.5" />
                <span className="text-slate-400">Low</span>
              </div>
              <div>
                <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-1.5" />
                <span className="text-slate-400">Out</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 4: Three-column Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <Card className="bg-slate-900/40 border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.topProducts.slice(0, 4).map((p) => (
              <div key={p.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-950/40 border border-white/5">
                <div>
                  <p className="text-xs font-bold text-white truncate max-w-[160px]">{p.name}</p>
                  <p className="text-[10px] text-slate-500">{p.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white">{formatCurrency(p.stockValue)}</p>
                  <p className="text-[10px] text-slate-450">{p.currentStock} units</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card className="bg-slate-900/40 border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Top Customers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.recentCustomers.slice(0, 4).map((c) => (
              <div key={c.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-950/40 border border-white/5">
                <div>
                  <p className="text-xs font-bold text-white">{c.name}</p>
                  <p className="text-[10px] text-slate-500">{c.email || 'No email'}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                  Customer
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="bg-slate-900/40 border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-950/40 border border-white/5 flex flex-col space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white font-bold">SO-2026-001</span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
              <p className="text-[10px] text-slate-400">Customer: Max Mustermann · Value: $1,240.00</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950/40 border border-white/5 flex flex-col space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white font-bold">PO-2026-003</span>
                <span className="text-indigo-400 font-semibold">Approved</span>
              </div>
              <p className="text-[10px] text-slate-400">Supplier: Globex Corp · Value: $4,500.00</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 5: Three-column Activity, Approvals, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline */}
        <Card className="bg-slate-900/40 border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pr-1 max-h-[220px] overflow-y-auto sidebar-scroll">
            {metrics.recentActivity.slice(0, 4).map((a) => (
              <div key={a.id} className="relative pl-4 border-l border-white/10 space-y-0.5">
                <span className="absolute left-[-4px] top-1.5 h-2 w-2 rounded-full bg-indigo-500" />
                <p className="text-xs font-semibold text-slate-200">{a.action}</p>
                <p className="text-[10px] text-slate-500">{a.details || ''}</p>
                <p className="text-[9px] text-slate-500">{format(new Date(a.createdAt), 'MMM dd, HH:mm')}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="bg-slate-900/40 border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.pendingPurchaseOrders > 0 ? (
              <div className="p-3 rounded-lg bg-slate-950/40 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Purchase Orders</p>
                  <p className="text-[10px] text-slate-500">{metrics.pendingPurchaseOrders} POs awaiting confirmation</p>
                </div>
                <Button variant="outline" className="h-8 text-[10px] font-semibold border-white/10 hover:bg-white/5" onClick={() => navigate('/purchase-orders')}>
                  Review
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <ShieldCheck className="h-8 w-8 text-emerald-400/80 mb-2" />
                <p className="text-xs font-bold text-white">No pending reviews</p>
                <p className="text-[10px] text-slate-500">All procurement operations approved</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions (vertical card, 6 CTAs) */}
        <Card className="bg-slate-900/40 border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Quick Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-[52px] border-white/5 bg-slate-950/40 text-[10px] uppercase font-bold text-slate-300 flex flex-col items-center justify-center gap-1 hover:bg-white/5 hover:text-white" onClick={() => navigate('/products')}>
              <PlusCircle className="h-4 w-4" /> Add Product
            </Button>
            <Button variant="outline" className="h-[52px] border-white/5 bg-slate-950/40 text-[10px] uppercase font-bold text-slate-300 flex flex-col items-center justify-center gap-1 hover:bg-white/5 hover:text-white" onClick={() => navigate('/purchase-orders')}>
              <FilePlus className="h-4 w-4" /> Create PO
            </Button>
            <Button variant="outline" className="h-[52px] border-white/5 bg-slate-950/40 text-[10px] uppercase font-bold text-slate-300 flex flex-col items-center justify-center gap-1 hover:bg-white/5 hover:text-white" onClick={() => navigate('/sales-orders')}>
              <FilePlus className="h-4 w-4" /> Create SO
            </Button>
            <Button variant="outline" className="h-[52px] border-white/5 bg-slate-950/40 text-[10px] uppercase font-bold text-slate-300 flex flex-col items-center justify-center gap-1 hover:bg-white/5 hover:text-white" onClick={() => navigate('/customers')}>
              <UserPlus className="h-4 w-4" /> Add Customer
            </Button>
            <Button variant="outline" className="h-[52px] border-white/5 bg-slate-950/40 text-[10px] uppercase font-bold text-slate-300 flex flex-col items-center justify-center gap-1 hover:bg-white/5 hover:text-white" onClick={() => navigate('/inventory/cycle-count')}>
              <CheckSquare className="h-4 w-4" /> Cycle Count
            </Button>
            <Button variant="outline" className="h-[52px] border-white/5 bg-slate-950/40 text-[10px] uppercase font-bold text-slate-300 flex flex-col items-center justify-center gap-1 hover:bg-white/5 hover:text-white" onClick={() => navigate('/reports')}>
              <TrendingUp className="h-4 w-4" /> View Profit
            </Button>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
