import * as React from 'react';
import { Link } from 'react-router-dom';
import { 
  Boxes, 
  ArrowRight, 
  Check, 
  Shield, 
  Zap, 
  BarChart3, 
  Users, 
  Activity, 
  ShoppingCart, 
  FileText 
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-bold text-base select-none">
              SF
            </div>
            <span className="font-bold tracking-tight text-xl">StockFlow</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-slate-50 transition-colors">Features</a>
            <a href="#workflows" className="hover:text-slate-900 dark:hover:text-slate-50 transition-colors">Workflows</a>
            <a href="#pricing" className="hover:text-slate-900 dark:hover:text-slate-50 transition-colors">Pricing</a>
            <a href="#solutions" className="hover:text-slate-900 dark:hover:text-slate-50 transition-colors">Solutions</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-50 px-4 text-sm font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 shadow-sm">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            StockFlow Commercial Release v1.0
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] text-slate-900 dark:text-white">
            Modern inventory operations <br className="hidden sm:inline" />
            built for fast-growing businesses.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-normal">
            Track multi-warehouse stock balances, automate purchasing, fulfill orders, generate quotes, and manage real-time inventory flow through one clean, unified SaaS dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/signup" 
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-50 px-6 font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow"
            >
              Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 px-6 font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors shadow-sm"
            >
              Sign In to Organization
            </Link>
          </div>

          {/* Interactive Interface Preview */}
          <div className="mt-16 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl max-w-5xl mx-auto">
            <div className="rounded-lg bg-slate-100 dark:bg-slate-950 p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-200/50 dark:border-slate-800/50 text-left">
              <div className="space-y-4 max-w-md">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900">
                    <Boxes className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm tracking-widest uppercase text-slate-400">Inventory Status</span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Centralize multi-warehouse metrics instantly.</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Track stock counts, values, expiring items, batch transfers, and cycle counts globally with total accuracy.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0">
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Value</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">$142,850</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Low Stock</p>
                  <p className="text-2xl font-bold text-amber-500">12 Items</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Pending POs</p>
                  <p className="text-2xl font-bold text-blue-500">3 Orders</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-1">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Active Warehouses</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">2 Zones</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight">Everything you need to control operations.</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Integrated modules built together, avoiding the complexity of duct-taping multiple tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-4">
              <div className="p-3 rounded-lg bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 w-fit">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Purchasing Workflow</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Generate POs, map products to suppliers, log partial shipments, calculate landed costs, and track incoming stock.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-4">
              <div className="p-3 rounded-lg bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 w-fit">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Sales & Quotations</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage sales orders, create estimates, send invoices, process customer returns, and track transaction balances.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-4">
              <div className="p-3 rounded-lg bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 w-fit">
                <Activity className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Inventory Auditing</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Run cycle counts to reconcile physical inventory, track expiring batches, monitor serial numbers, and view detailed ledgers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight">Flexible plans for any growth stage.</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Start free with basic access or scale instantly with complete enterprise capability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Starter</h3>
                <p className="text-slate-400 text-xs">Essential tracking for small startups.</p>
                <div className="text-3xl font-bold">$0 <span className="text-sm font-normal text-slate-450">/ mo</span></div>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> 1 Warehouse</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Up to 50 Products</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Basic PO & SO</li>
                </ul>
              </div>
              <Link 
                to="/signup" 
                className="mt-8 w-full inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 px-4 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Growth Plan (Popular) */}
            <div className="p-8 rounded-xl border-2 border-slate-900 dark:border-slate-50 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-md relative">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                Most Popular
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Growth</h3>
                <p className="text-slate-400 text-xs">Advanced automation for scale-ups.</p>
                <div className="text-3xl font-bold">$49 <span className="text-sm font-normal text-slate-450">/ mo</span></div>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> 3 Warehouses</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Unlimited Products</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Full CRM & Suppliers</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Real-time SSE Alerts</li>
                </ul>
              </div>
              <Link 
                to="/signup" 
                className="mt-8 w-full inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors px-4 text-sm font-medium"
              >
                Start Growth Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Enterprise</h3>
                <p className="text-slate-400 text-xs">Comprehensive features for operations.</p>
                <div className="text-3xl font-bold">$99 <span className="text-sm font-normal text-slate-450">/ mo</span></div>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Unlimited Warehouses</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Cycle Counts & Returns</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Custom Tax Rules</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Dedicated Support</li>
                </ul>
              </div>
              <Link 
                to="/signup" 
                className="mt-8 w-full inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 px-4 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-bold text-sm select-none">
              SF
            </div>
            <span className="font-bold tracking-tight text-slate-900 dark:text-white">StockFlow</span>
          </div>
          <p className="text-xs">&copy; {new Date().getFullYear()} StockFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
