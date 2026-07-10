import * as React from 'react';
import { 
  Book, 
  LifeBuoy, 
  FileText, 
  Keyboard, 
  HelpCircle, 
  Package, 
  Activity, 
  Info, 
  Users, 
  Settings, 
  Search,
  Play,
  ChevronRight,
  ShieldCheck,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const sections = [
  {
    title: 'Getting Started',
    icon: LifeBuoy,
    items: [
      { label: 'Platform Overview', category: 'getting-started' },
      { label: 'Workspaces & Roles', category: 'getting-started' },
      { label: 'Quick Start Guide', category: 'getting-started' },
    ]
  },
  {
    title: 'Core Modules',
    icon: Package,
    items: [
      { label: 'Managing Products', category: 'core-modules' },
      { label: 'Inventory & Warehouses', category: 'core-modules' },
      { label: 'Purchase Orders', category: 'core-modules' },
      { label: 'Sales Orders', category: 'core-modules' },
      { label: 'Returns', category: 'core-modules' },
    ]
  },
  {
    title: 'Analytics & Reports',
    icon: Activity,
    items: [
      { label: 'Dashboard Metrics', category: 'analytics-reports' },
      { label: 'Generating Reports', category: 'analytics-reports' },
      { label: 'Exporting Data', category: 'analytics-reports' },
      { label: 'Finance', category: 'analytics-reports' },
    ]
  },
  {
    title: 'Reference & Settings',
    icon: Book,
    items: [
      { label: 'Settings', category: 'reference' },
      { label: 'Keyboard Shortcuts', category: 'reference' },
      { label: 'Troubleshooting', category: 'reference' },
      { label: 'Release Notes', category: 'reference' },
    ]
  }
];

export function HelpCenter() {
  const [activeTab, setActiveTab] = React.useState('Platform Overview');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredSections = React.useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const query = searchQuery.toLowerCase();
    
    return sections.map(section => ({
      ...section,
      items: section.items.filter(item => 
        item.label.toLowerCase().includes(query)
      )
    })).filter(section => section.items.length > 0);
  }, [searchQuery]);

  return (
    <div className="space-y-6 animate-fade-in-up bg-slate-950 text-slate-100 p-6 min-h-screen">
      
      {/* Welcome & Info */}
      <div className="flex flex-col gap-1 border-b border-white/5 pb-5">
        <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-indigo-400" />
          Help & Documentation Center
        </h1>
        <p className="text-xs text-slate-400">
          Knowledge base, tutorials, system definitions, and keyboard shortcuts guide.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Categories Sidebar */}
        <aside className="w-full lg:w-60 shrink-0 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
            <input
              type="search"
              placeholder="Search documentation..."
              className="flex h-9 w-full rounded-lg border border-white/10 bg-slate-900/40 pl-9 pr-3 text-xs text-white placeholder:text-slate-550 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-4 max-h-[460px] overflow-y-auto sidebar-scroll">
            {filteredSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <h4 className="flex items-center gap-2 px-2 pb-1 text-[9px] font-bold uppercase tracking-widest text-slate-500 select-none">
                  <section.icon className="h-3 w-3" />
                  {section.title}
                </h4>
                <nav className="flex flex-col gap-0.5" role="navigation">
                  {section.items.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => setActiveTab(item.label)}
                      className={cn(
                        'w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150',
                        activeTab === item.label 
                          ? 'bg-white/10 text-white font-bold' 
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 max-w-4xl min-w-0 space-y-6">
          <Card className="bg-slate-900/40 border-white/5 shadow-2xl backdrop-blur-xl p-6 sm:p-8">
            {/* Contextual Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-4 select-none">
              <span>Help Center</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-slate-350">{activeTab}</span>
            </div>

            <h2 className="text-lg font-black text-white border-b border-white/5 pb-3 mb-5">
              {activeTab}
            </h2>

            <div className="text-slate-300 text-xs leading-relaxed space-y-6">
              
              {/* Platform Overview */}
              {activeTab === 'Platform Overview' && (
                <div className="space-y-6">
                  <p className="text-sm font-semibold text-slate-200">
                    Welcome to StockFlow Enterprise, the premier unified platform for managing complex multi-warehouse inventory, procurement, and omni-channel sales operations.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-xl border border-white/5 bg-slate-950/40 space-y-2">
                      <Package className="h-5 w-5 text-indigo-400" />
                      <h3 className="text-white font-bold text-xs uppercase tracking-wider">Centralized Inventory</h3>
                      <p className="text-[11px] text-slate-400">Maintain absolute accuracy across multiple locations with real-time syncing, batch tracking, and automated reorder points.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-white/5 bg-slate-950/40 space-y-2">
                      <Settings className="h-5 w-5 text-indigo-400" />
                      <h3 className="text-white font-bold text-xs uppercase tracking-wider">Order Management</h3>
                      <p className="text-[11px] text-slate-400">Seamlessly process sales and purchase orders from draft to fulfillment with robust multi-stage approval workflows.</p>
                    </div>
                  </div>
                  {/* Immediate Assistance Banner */}
                  <div className="p-4 rounded-xl border border-white/5 bg-indigo-500/5 space-y-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <LifeBuoy className="h-4 w-4 text-indigo-400" /> Need Immediate Assistance?
                    </h4>
                    <p className="text-[11px] text-slate-450">Our enterprise support team is available 24/7 for critical operational issues and onboarding assistance.</p>
                    <Button variant="outline" className="h-8 text-[10px] font-bold uppercase tracking-wider border-white/10 hover:bg-white/5">
                      Contact Support
                    </Button>
                  </div>
                </div>
              )}

              {/* Workspaces & Roles */}
              {activeTab === 'Workspaces & Roles' && (
                <div className="space-y-6">
                  <p>
                    Workspaces represent fully isolated business entities or subsidiaries within your organization. Each workspace maintains strictly segregated customers, suppliers, inventory data, and user directories.
                  </p>
                  <div className="rounded-xl border border-white/5 bg-slate-950/40 p-4 space-y-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" /> Role-Based Access Control (RBAC)
                    </h3>
                    <div className="space-y-2 divide-y divide-white/5">
                      <div className="pt-2 flex justify-between gap-4">
                        <span className="text-xs font-bold text-white">OWNER</span>
                        <p className="text-[11px] text-slate-400 max-w-sm">Absolute control. Capable of managing billing, deleting the workspace, and transferring ownership.</p>
                      </div>
                      <div className="pt-2 flex justify-between gap-4">
                        <span className="text-xs font-bold text-white">ADMIN</span>
                        <p className="text-[11px] text-slate-400 max-w-sm">Full operational authority. Can invite users, modify roles, and execute all inventory/order transactions.</p>
                      </div>
                      <div className="pt-2 flex justify-between gap-4">
                        <span className="text-xs font-bold text-white">MANAGER</span>
                        <p className="text-[11px] text-slate-400 max-w-sm">Can approve draft orders, conduct stock adjustments, process returns, and view financial reports.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Start Guide */}
              {activeTab === 'Quick Start Guide' && (
                <div className="space-y-4">
                  <p>Get your StockFlow instance operational in minutes by following this standard implementation sequence.</p>
                  <div className="space-y-3 mt-4">
                    {[
                      { step: 1, title: 'Configure Business Settings', desc: 'Define your base currency, timezone, and establish Tax Rules.' },
                      { step: 2, title: 'Establish Infrastructure', desc: 'Map out your physical or logical storage locations in Warehouses.' },
                      { step: 3, title: 'Build the CRM Foundation', desc: 'Add primary vendors in Suppliers and key clients in Customers.' },
                      { step: 4, title: 'Initialize Product Catalog', desc: 'Create products with strict SKUs, cost prices, and retail margins.' }
                    ].map(s => (
                      <div key={s.step} className="flex gap-4 p-3 rounded-lg border border-white/5 bg-slate-950/40 items-start">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white shrink-0">{s.step}</span>
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">{s.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Managing Products */}
              {activeTab === 'Managing Products' && (
                <div className="space-y-4">
                  <p>Products form the master data foundation of StockFlow. Accuracy here ensures perfect reporting downstream.</p>
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">SKU Architecture</h4>
                    <p className="text-[11px] text-slate-400">Every product variant requires a strictly unique Stock Keeping Unit (SKU). We strongly recommend using a standardized alphanumeric format (e.g., CAT-BRND-MDL-CLR).</p>
                    
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mt-4">Valuation & Pricing</h4>
                    <p className="text-[11px] text-slate-400">Products track two critical financial metrics: Cost Price (valuation used for calculating COGS) and Selling Price (default retail price populated into orders).</p>
                  </div>
                </div>
              )}

              {/* Keyboard Shortcuts */}
              {activeTab === 'Keyboard Shortcuts' && (
                <div className="space-y-4">
                  <p>Increase your operational speed using keyboard-driven actions across the application layout.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="rounded-xl border border-white/5 bg-slate-950/40 p-4 space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigation</h4>
                      <div className="space-y-1.5 text-[11px] text-slate-400">
                        <div className="flex justify-between"><span>Focus Search</span><kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-mono">/</kbd></div>
                        <div className="flex justify-between"><span>Go to Dashboard</span><kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-mono">G + D</kbd></div>
                        <div className="flex justify-between"><span>Go to Products</span><kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-mono">G + P</kbd></div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-slate-950/40 p-4 space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Creates</h4>
                      <div className="space-y-1.5 text-[11px] text-slate-400">
                        <div className="flex justify-between"><span>New Sales Order</span><kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-mono">C + S</kbd></div>
                        <div className="flex justify-between"><span>New Purchase Order</span><kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-mono">C + O</kbd></div>
                        <div className="flex justify-between"><span>Submit Form</span><kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-mono">Ctrl + Enter</kbd></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Fallback for other tabs */}
              {!['Platform Overview', 'Workspaces & Roles', 'Quick Start Guide', 'Managing Products', 'Keyboard Shortcuts'].includes(activeTab) && (
                <div className="space-y-3">
                  <p>This documentation section covers deep-dive parameters regarding {activeTab}.</p>
                  <p className="text-[11px] text-slate-400">Please review related training material, API guides, and compliance protocols if seeking specialized configurations.</p>
                </div>
              )}

            </div>
          </Card>

          {/* Video Tutorials Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Video Onboarding Tutorials</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Workspace Configuration', duration: '2:15' },
                { title: 'Inventory Inbound Operations', duration: '4:45' },
                { title: 'Omnichannel Sales Channels', duration: '3:30' }
              ].map((v, i) => (
                <Card key={i} className="bg-slate-900/40 border-white/5 hover:border-white/10 transition-all duration-200 cursor-pointer overflow-hidden group">
                  <div className="h-28 bg-slate-950 relative flex items-center justify-center border-b border-white/5">
                    <Play className="h-6 w-6 text-slate-400 group-hover:text-white transition-colors" />
                    <span className="absolute bottom-2 right-2 text-[9px] font-bold bg-slate-900/80 text-white px-1.5 py-0.5 rounded">
                      {v.duration}
                    </span>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{v.title}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold mt-0.5">Lesson {i + 1}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Frequently Asked Questions</h3>
            <div className="space-y-2">
              {[
                { q: 'How does StockFlow prevent stock oversells?', a: 'StockFlow uses absolute perpetual stock reserves. Inventory levels are locked immediately during order drafts so that other operators cannot sell the same physical unit.' },
                { q: 'Can I connect multiple bank/payment gateways?', a: 'Yes. Billing settings support multiple accounts for invoice payments and supplier payments, managed through our global compliance panel.' }
              ].map((faq, i) => (
                <div key={i} className="p-4 rounded-xl border border-white/5 bg-slate-900/40 space-y-1.5">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <QuestionIcon className="h-3.5 w-3.5 text-indigo-400" /> {faq.q}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-normal pl-5">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
export default HelpCenter;
