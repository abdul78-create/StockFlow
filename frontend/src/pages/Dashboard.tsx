import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Package,
  ShoppingCart,
  Users,
  Truck,
  TrendingUp,
  AlertTriangle,
  Activity,
  ArrowRight,
  Factory,
  DollarSign,
  Boxes,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { ErrorState } from "../components/ui/ErrorState";
import api from "../lib/api";

interface DashboardMetrics {
  totalProducts: number;
  totalWarehouses: number;
  totalSuppliers: number;
  totalCustomers: number;
  totalSalesOrders: number;
  totalPurchaseOrders: number;
  pendingSalesOrders: number;
  pendingPurchaseOrders: number;
  revenue: number;
  expenses: number;
  profit: number;
  inventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  monthlyTransactionsCount: number;
  dailyTransactions: { date: string; transactions: number; revenue: number; expenses: number }[];
  recentActivity: { id: string; action: string; entityType: string; createdAt: string }[];
  topProducts: { id: string; name: string; sku: string; currentStock: number; stockValue: number }[];
  recentCustomers: { id: string; name: string; email: string | null; createdAt: string }[];
}

function formatCurrency(value: number) {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(1)}Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(1)}L`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(1)}K`;
  return `₹${value.toFixed(0)}`;
}

function formatCurrencyFull(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function formatAction(action: string) {
  return action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-sm p-3 text-xs font-sans">
      <p className="font-semibold text-gray-900 mb-1.5">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 mt-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-gray-500 capitalize">{entry.name}:</span>
          <span className="font-semibold text-gray-900">
            {entry.name === "transactions" ? entry.value : formatCurrencyFull(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

const stagger = { show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else { setLoading(true); setError(""); }
      const res = await api.get("/dashboard");
      setMetrics(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchMetrics(); }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto font-sans animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-100 rounded w-64 mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-32 bg-gray-50 rounded-lg border border-gray-100" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-gray-50 rounded-lg border border-gray-100 lg:col-span-2" />
          <div className="h-80 bg-gray-50 rounded-lg border border-gray-100" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh] font-sans">
        <ErrorState title="Dashboard unavailable" message={error} onRetry={() => fetchMetrics()} />
      </div>
    );
  }

  const m = metrics!;
  const hasChartData = m.dailyTransactions && m.dailyTransactions.length > 0;
  const hasRevenue = m.dailyTransactions?.some((d) => d.revenue > 0 || d.expenses > 0);

  const kpis = [
    { label: "Total Revenue", value: formatCurrency(m.revenue), icon: DollarSign, href: "/finance", positive: m.revenue > 0, sub: m.revenue > 0 ? "From completed orders" : "No revenue yet" },
    { label: "Inventory Value", value: formatCurrency(m.inventoryValue), icon: Boxes, href: "/inventory", positive: m.inventoryValue > 0, sub: `${m.totalProducts} products` },
    { label: "Gross Profit", value: formatCurrency(m.profit), icon: TrendingUp, href: "/finance", positive: m.profit >= 0, sub: `Expenses: ${formatCurrency(m.expenses)}` },
    { label: "Pending Orders", value: m.pendingSalesOrders + m.pendingPurchaseOrders, icon: ShoppingCart, href: "/sales-orders", positive: (m.pendingSalesOrders + m.pendingPurchaseOrders) === 0, sub: `${m.pendingSalesOrders} sales · ${m.pendingPurchaseOrders} purchase`, warn: (m.pendingSalesOrders + m.pendingPurchaseOrders) > 0 },
    { label: "Total Products", value: m.totalProducts.toLocaleString(), icon: Package, href: "/products", sub: "In your catalog" },
    { label: "Total Customers", value: m.totalCustomers.toLocaleString(), icon: Users, href: "/customers", sub: "Active accounts" },
    { label: "Suppliers", value: m.totalSuppliers.toLocaleString(), icon: Truck, href: "/suppliers", sub: "Active vendors" },
    { label: "Warehouses", value: m.totalWarehouses.toLocaleString(), icon: Factory, href: "/warehouses", sub: "Storage locations" },
  ];

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto space-y-10 font-sans selection:bg-gray-900 selection:text-white">
      {/* ─── HEADER ─── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Overview</h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">Real-time metrics and operations across your workspace.</p>
        </div>
        <button
          onClick={() => fetchMetrics(true)}
          disabled={refreshing}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </motion.div>

      {/* ─── ALERTS ─── */}
      <AnimatePresence>
        {(m.lowStockCount > 0 || m.outOfStockCount > 0) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-3">
            {m.outOfStockCount > 0 && (
              <Link to="/inventory" className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200/60 rounded-lg text-sm text-red-700 hover:bg-red-100 transition-colors group">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-semibold">{m.outOfStockCount} items out of stock</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
            {m.lowStockCount > 0 && (
              <Link to="/inventory" className="flex items-center gap-2 px-4 py-2.5 bg-yellow-50 border border-yellow-200/60 rounded-lg text-sm text-yellow-700 hover:bg-yellow-100 transition-colors group">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-semibold">{m.lowStockCount} items low on stock</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── KPI GRID ─── */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <motion.div key={kpi.label} variants={fadeUp}>
            <Link to={kpi.href} className="block group">
              <div className="bg-white border border-gray-200/60 rounded-xl p-5 hover:border-gray-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase">{kpi.label}</p>
                  <kpi.icon className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                </div>
                <div className="mt-auto">
                  <p className={`text-3xl font-bold tracking-tight mb-1 ${kpi.warn ? "text-yellow-700" : kpi.positive === false ? "text-red-700" : "text-gray-900"}`}>
                    {kpi.value}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">{kpi.sub}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── CHARTS ─── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-gray-200/60 shadow-sm rounded-xl">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Revenue vs Expenses</CardTitle>
                <CardDescription className="text-xs font-medium">14-day financial trend from confirmed orders.</CardDescription>
              </div>
              {hasRevenue && (
                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-900" />
                    <span className="text-gray-600">Revenue</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    <span className="text-gray-600">Expenses</span>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {!hasChartData || !hasRevenue ? (
              <div className="h-[240px] flex flex-col items-center justify-center gap-3 text-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">No financial data yet</p>
                  <p className="text-xs text-gray-500 mt-1">Complete sales or purchase orders to generate data.</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={m.dailyTransactions} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#111827" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#111827" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D1D5DB" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#D1D5DB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} width={52} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#111827" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, fill: "#111827" }} />
                  <Area type="monotone" dataKey="expenses" stroke="#D1D5DB" strokeWidth={2} fill="url(#expGrad)" dot={false} activeDot={{ r: 4, fill: "#D1D5DB" }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200/60 shadow-sm rounded-xl">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-base font-semibold">Activity Density</CardTitle>
            <CardDescription className="text-xs font-medium">Audit events across the last 14 days.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {!hasChartData || m.dailyTransactions.every((d) => d.transactions === 0) ? (
              <div className="h-[240px] flex flex-col items-center justify-center gap-3 text-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                <Activity className="w-5 h-5 text-gray-400" />
                <p className="text-sm font-semibold text-gray-700">No activity yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={m.dailyTransactions} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
                  <Bar dataKey="transactions" fill="#E5E7EB" activeBar={{ fill: '#111827' }} radius={[2, 2, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── LOWER SECTIONS ─── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-gray-200/60 shadow-sm rounded-xl flex flex-col">
          <CardHeader className="p-6 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {m.recentActivity.length === 0 ? (
              <div className="p-12 text-center text-sm text-gray-500 font-medium">No activity recorded yet.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {m.recentActivity.map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-3 px-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formatAction(log.action)}</p>
                        <p className="text-xs text-gray-500 capitalize">{log.entityType}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{timeAgo(log.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-200/60 shadow-sm rounded-xl">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-base font-semibold">Top Products</CardTitle>
            <CardDescription className="text-xs font-medium">By inventory value.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {m.topProducts.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500 font-medium">No products with stock.</div>
            ) : (
              <div className="space-y-5">
                {m.topProducts.map((p, idx) => {
                  const maxVal = m.topProducts[0]?.stockValue || 1;
                  const pct = Math.max((p.stockValue / maxVal) * 100, 2);
                  return (
                    <div key={p.id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xs font-bold text-gray-400 w-3">{idx + 1}</span>
                          <span className="text-sm font-semibold text-gray-900 truncate">{p.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(p.stockValue)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1">
                        <div className="bg-gray-900 h-1 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs font-medium text-gray-500">{p.currentStock} units · {p.sku}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
