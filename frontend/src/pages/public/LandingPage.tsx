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
  FileText,
  Globe,
  Lock,
  ChevronRight,
  Sparkles,
  Command,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LandingPage() {
  const [activeTab, setActiveTab] = React.useState<'inventory' | 'orders' | 'finance'>('inventory');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-primary/20 selection:text-white font-sans overflow-x-hidden">
      {/* Dynamic light rays (background decoration) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden opacity-30 select-none">
        <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -top-[100px] left-1/3 w-[600px] h-[300px] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-950 font-bold text-sm tracking-tight shadow-sm">
              SF
            </div>
            <span className="font-semibold tracking-tight text-base text-white">StockFlow</span>
            <span className="hidden sm:inline-flex items-center rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400">
              Enterprise
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#dashboard" className="hover:text-white transition-colors">Platform</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">Resources</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5">
              Sign In
            </Link>
            <Link to="/signup">
              <Button size="sm" className="h-8 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-300 shadow-sm animate-fade-in">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Introducing StockFlow v2.0 Command Center</span>
            <ChevronRight className="h-3 w-3 text-slate-500" />
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.05] text-white">
            Inventory operations <br />
            built for the <span className="bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent">modern enterprise</span>.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Unify multi-warehouse tracking, procurement, order fulfillment, and financial intelligence in a single, blazing-fast workspace. Designed to remove complexity.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-11 px-6 bg-white text-slate-950 hover:bg-slate-200 text-sm font-semibold">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-11 px-6 border-white/10 bg-white/5 text-white hover:bg-white/10 text-sm font-semibold">
                Sign In to Organization
              </Button>
            </Link>
          </div>

          {/* Interactive Showcase Panel */}
          <div id="dashboard" className="mt-16 rounded-2xl border border-white/10 bg-slate-900/60 p-2 shadow-2xl max-w-5xl mx-auto backdrop-blur-md animate-fade-in-up">
            <div className="rounded-xl bg-slate-950 p-6 flex flex-col lg:flex-row items-center justify-between gap-8 border border-white/5 text-left">
              <div className="space-y-4 max-w-md">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    Live Platform Preview
                  </span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white">Centralize operations. Sync instantaneously.</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Toggle views below to preview how StockFlow handles complex inventory balances, order pipelines, and financial margin analysis without local lag.
                </p>

                {/* Tab buttons */}
                <div className="flex items-center gap-1.5 pt-2">
                  {(['inventory', 'orders', 'finance'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150 capitalize ${
                        activeTab === tab
                          ? 'bg-white border-white text-slate-950'
                          : 'border-white/5 bg-white/5 text-slate-400 hover:text-white hover:border-white/10'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mock dashboard state card */}
              <div className="w-full lg:w-auto shrink-0 bg-slate-900/40 border border-white/5 rounded-xl p-5 space-y-4 min-w-[280px]">
                {activeTab === 'inventory' && (
                  <>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Inventory Health</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <p className="text-[11px] text-slate-500 font-semibold uppercase">Global Value</p>
                        <p className="text-lg font-extrabold text-white">$142,850</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[11px] text-slate-500 font-semibold uppercase">Low Stock</p>
                        <p className="text-lg font-extrabold text-amber-400">12 items</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[11px] text-slate-500 font-semibold uppercase">Active Zones</p>
                        <p className="text-lg font-extrabold text-white">4 locations</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[11px] text-slate-500 font-semibold uppercase">Turnover Rate</p>
                        <p className="text-lg font-extrabold text-emerald-400">8.4x</p>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'orders' && (
                  <>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Fulfillment Pipeline</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                        <span className="text-slate-400">PO-2026-004 (Supplier)</span>
                        <span className="font-semibold text-emerald-400">Received</span>
                      </div>
                      <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
                        <span className="text-slate-400">SO-2026-081 (Customer)</span>
                        <span className="font-semibold text-blue-400">Shipped</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">SO-2026-082 (Customer)</span>
                        <span className="font-semibold text-amber-400">Pending</span>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'finance' && (
                  <>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Financial Margins</p>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Operational Margin:</span>
                        <span className="font-bold text-white">24.6%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: '74.6%' }} />
                      </div>
                      <p className="text-[10px] text-slate-500">Auto-calculated using moving average valuation method.</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 border-t border-white/5 bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Engineered for speed. Built for stability.</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Stop duct-taping tools. StockFlow brings every step of your inventory lifecycle under a single unified dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1 */}
            <div className="p-6 rounded-xl border border-white/5 bg-slate-950 space-y-4 transition-all hover:border-white/10">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white">
                <ShoppingCart className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Procurement Operations</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automate purchase ordering, trace active supplier listings, log item receipts, map shipping costs, and track incoming transit counts.
              </p>
            </div>

            {/* Box 2 */}
            <div className="p-6 rounded-xl border border-white/5 bg-slate-950 space-y-4 transition-all hover:border-white/10">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white">
                <FileText className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Sales & CRM Flows</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate estimates and sales orders, manage customer balances, configure custom taxes rules, and generate structured invoices.
              </p>
            </div>

            {/* Box 3 */}
            <div className="p-6 rounded-xl border border-white/5 bg-slate-950 space-y-4 transition-all hover:border-white/10">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white">
                <Boxes className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Inbound Logistics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Coordinate multiple warehouse zones, perform batch transfers, handle expiry alerts, trace ledger adjustments, and conduct cycle counts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Transparent pricing. No limits.</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Choose the package that matches your operational volume. Upgrade or downgrade instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Standard */}
            <div className="p-6 rounded-xl border border-white/5 bg-slate-950 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Standard Plan</h3>
                  <p className="mt-2 text-3xl font-extrabold text-white">$49<span className="text-xs text-slate-500 font-medium">/mo</span></p>
                </div>
                <p className="text-xs text-slate-400">Ideal for growing brands requiring unified inventory tracking across up to 3 warehouses.</p>
                <div className="h-px bg-white/5" />
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Up to 3 warehouse locations</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Unified Order management</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> 10 team seats included</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> CSV exports and report tools</li>
                </ul>
              </div>
              <Link to="/signup" className="block">
                <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-xs font-semibold h-9">
                  Select Standard Plan
                </Button>
              </Link>
            </div>

            {/* Enterprise */}
            <div className="p-6 rounded-xl border border-primary/40 bg-slate-950 flex flex-col justify-between gap-6 relative">
              <div className="absolute -top-3 right-6 rounded-full bg-primary/20 border border-primary/30 px-2 py-0.5 text-[9px] font-bold text-primary uppercase">
                RECOMMENDED
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Enterprise Plan</h3>
                  <p className="mt-2 text-3xl font-extrabold text-white">$149<span className="text-xs text-slate-500 font-medium">/mo</span></p>
                </div>
                <p className="text-xs text-slate-400">Engineered for complex logistics operations requiring high-throughput batch and location controls.</p>
                <div className="h-px bg-white/5" />
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Unlimited warehouses and zones</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Full API access & custom integrations</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Unlimited team members</li>
                  <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Priority 24/7 technical support</li>
                </ul>
              </div>
              <Link to="/signup" className="block">
                <Button className="w-full bg-white text-slate-950 hover:bg-slate-200 text-xs font-semibold h-9">
                  Select Enterprise Plan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-20 border-t border-white/5 bg-slate-950 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Upgrade your operations today.</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Start your 14-day free trial now. Setup takes under 5 minutes, no credit card required.
        </p>
        <Link to="/signup" className="inline-block">
          <Button size="lg" className="h-10 px-6 bg-white text-slate-950 hover:bg-slate-200 text-xs font-bold shadow-md">
            Create Your Free Account
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-white font-bold text-xs select-none">
              SF
            </div>
            <span className="font-semibold text-white">StockFlow</span>
            <span>· Enterprise Operations System</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
