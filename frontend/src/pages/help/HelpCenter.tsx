import * as React from 'react';
import { Book, LifeBuoy, FileText, Keyboard, HelpCircle, Package, Truck, ShoppingCart, Activity, Info, BarChart3, Users, Settings, AlertCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const sections = [
  {
    title: 'Getting Started',
    icon: LifeBuoy,
    items: [
      { label: 'Platform Overview', href: '#' },
      { label: 'Workspaces & Roles', href: '#' },
      { label: 'Quick Start Guide', href: '#' },
    ]
  },
  {
    title: 'Core Modules',
    icon: Package,
    items: [
      { label: 'Managing Products', href: '#' },
      { label: 'Inventory & Warehouses', href: '#' },
      { label: 'Purchase Orders', href: '#' },
      { label: 'Sales Orders', href: '#' },
      { label: 'Returns', href: '#' },
    ]
  },
  {
    title: 'Analytics & Reports',
    icon: Activity,
    items: [
      { label: 'Dashboard Metrics', href: '#' },
      { label: 'Generating Reports', href: '#' },
      { label: 'Exporting Data', href: '#' },
      { label: 'Finance', href: '#' },
    ]
  },
  {
    title: 'Reference',
    icon: Book,
    items: [
      { label: 'Settings', href: '#' },
      { label: 'Keyboard Shortcuts', href: '#' },
      { label: 'API Documentation', href: '#' },
      { label: 'Troubleshooting', href: '#' },
      { label: 'FAQs', href: '#' },
      { label: 'Release Notes', href: '#' },
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
    <div className="flex-1 p-4 md:p-8 pt-6 animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Info className="h-8 w-8 text-primary" />
          Help Center
        </h2>
        <p className="text-muted-foreground mt-2">
          Everything you need to know about StockFlow Enterprise.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search help articles..."
              className="w-full bg-background pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {filteredSections.map((section, idx) => (
            <div key={idx}>
              <h4 className="flex items-center gap-2 font-medium text-sm text-foreground mb-3 px-2">
                <section.icon className="h-4 w-4 text-muted-foreground" />
                {section.title}
              </h4>
              <nav className="flex flex-col gap-1">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setActiveTab(item.label)}
                    className={cn(
                      'text-left px-3 py-1.5 text-sm rounded-md transition-colors',
                      activeTab === item.label 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          ))}
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 max-w-4xl">
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h1 className="text-2xl font-bold tracking-tight border-b pb-4 mb-6">{activeTab}</h1>
                
                {activeTab === 'Platform Overview' && (
                  <div className="space-y-6 text-muted-foreground">
                    <p className="text-base text-foreground font-medium">
                      Welcome to StockFlow Enterprise, the premier unified platform for managing complex multi-warehouse inventory, procurement, and omni-channel sales operations.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="p-5 border rounded-lg bg-card">
                        <Package className="h-6 w-6 text-primary mb-3" />
                        <h3 className="text-foreground font-semibold mb-2">Centralized Inventory</h3>
                        <p className="text-sm">Maintain absolute accuracy across multiple locations with real-time syncing, batch tracking, and automated reorder points.</p>
                      </div>
                      <div className="p-5 border rounded-lg bg-card">
                        <ShoppingCart className="h-6 w-6 text-primary mb-3" />
                        <h3 className="text-foreground font-semibold mb-2">Order Management</h3>
                        <p className="text-sm">Seamlessly process sales and purchase orders from draft to fulfillment with robust multi-stage approval workflows.</p>
                      </div>
                      <div className="p-5 border rounded-lg bg-card">
                        <BarChart3 className="h-6 w-6 text-primary mb-3" />
                        <h3 className="text-foreground font-semibold mb-2">Actionable Intelligence</h3>
                        <p className="text-sm">Drive decision-making with dynamic dashboards, automated valuation reports, and margin analysis.</p>
                      </div>
                      <div className="p-5 border rounded-lg bg-card">
                        <Users className="h-6 w-6 text-primary mb-3" />
                        <h3 className="text-foreground font-semibold mb-2">Enterprise Security</h3>
                        <p className="text-sm">Deploy with confidence using role-based access control (RBAC), audit logging, and isolated multi-tenant workspaces.</p>
                      </div>
                    </div>
                    <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/20">
                      <h3 className="text-foreground font-semibold mb-2 flex items-center gap-2"><LifeBuoy className="h-5 w-5 text-primary" /> Need immediate assistance?</h3>
                      <p className="mb-4 text-sm">Our enterprise support team is available 24/7 for critical operational issues and onboarding assistance.</p>
                      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
                        Contact Enterprise Support
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'Workspaces & Roles' && (
                  <div className="space-y-6 text-muted-foreground">
                    <p className="text-base text-foreground font-medium">Workspaces represent fully isolated business entities or subsidiaries within your organization. Each workspace maintains strictly segregated customers, suppliers, inventory data, and user directories.</p>
                    
                    <div className="bg-card border rounded-lg overflow-hidden mt-6">
                      <div className="bg-muted p-4 border-b">
                        <h3 className="text-foreground font-semibold flex items-center gap-2"><Settings className="h-5 w-5 text-primary" /> Role-Based Access Control (RBAC)</h3>
                      </div>
                      <div className="p-0">
                        <div className="grid grid-cols-1 divide-y">
                          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-start hover:bg-muted/50 transition-colors">
                            <div className="font-semibold text-foreground">OWNER</div>
                            <div className="md:col-span-3 text-sm">Absolute control. Capable of managing billing, deleting the workspace, transferring ownership, and configuring global compliance settings.</div>
                          </div>
                          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-start hover:bg-muted/50 transition-colors">
                            <div className="font-semibold text-foreground">ADMIN</div>
                            <div className="md:col-span-3 text-sm">Full operational authority. Can invite users, modify roles, alter tax/currency settings, and execute all inventory/order transactions. Cannot manage billing.</div>
                          </div>
                          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-start hover:bg-muted/50 transition-colors">
                            <div className="font-semibold text-foreground">MANAGER</div>
                            <div className="md:col-span-3 text-sm">Department head level. Can approve draft orders, conduct stock adjustments, process returns, and view financial reports. Cannot modify team settings.</div>
                          </div>
                          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-start hover:bg-muted/50 transition-colors">
                            <div className="font-semibold text-foreground">STAFF</div>
                            <div className="md:col-span-3 text-sm">Standard operator. Can view inventory levels, create draft orders, and receive goods against approved POs. Cannot approve financial transactions or view executive margins.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Quick Start Guide' && (
                  <div className="space-y-6 text-muted-foreground">
                    <p className="text-base text-foreground font-medium">Get your StockFlow instance operational in minutes by following this standard implementation sequence.</p>
                    
                    <div className="space-y-4 mt-6">
                      <div className="flex gap-4 p-4 border rounded-lg bg-card items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold shrink-0">1</div>
                        <div>
                          <h4 className="text-foreground font-semibold">Configure Business Settings</h4>
                          <p className="text-sm mt-1">Navigate to <strong>Settings</strong> to define your base currency, timezone, and establish Tax Rules that will automatically apply to future transactions.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 p-4 border rounded-lg bg-card items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold shrink-0">2</div>
                        <div>
                          <h4 className="text-foreground font-semibold">Establish Infrastructure</h4>
                          <p className="text-sm mt-1">Go to the <strong>Warehouses</strong> module and map out your physical or logical storage locations. You need at least one Active warehouse to receive stock.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 p-4 border rounded-lg bg-card items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold shrink-0">3</div>
                        <div>
                          <h4 className="text-foreground font-semibold">Build the CRM Foundation</h4>
                          <p className="text-sm mt-1">Add your primary vendors in the <strong>Suppliers</strong> module and key clients in the <strong>Customers</strong> module to enable fast order creation.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 p-4 border rounded-lg bg-card items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold shrink-0">4</div>
                        <div>
                          <h4 className="text-foreground font-semibold">Initialize Product Catalog</h4>
                          <p className="text-sm mt-1">Create your master <strong>Products</strong>. Assign strict SKUs, cost prices, and retail prices. You can perform an initial stock adjustment to log existing inventory.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 p-4 border rounded-lg bg-card items-start">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold shrink-0">5</div>
                        <div>
                          <h4 className="text-foreground font-semibold">Execute First Transaction</h4>
                          <p className="text-sm mt-1">Create a <strong>Purchase Order</strong> to procure more stock, approve it, and then process a Goods Receipt to watch your inventory levels update automatically.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Managing Products' && (
                  <div className="space-y-4 text-muted-foreground">
                    <p className="text-base text-foreground font-medium">Products form the master data foundation of StockFlow. Accuracy here ensures perfect reporting downstream.</p>
                    
                    <div className="grid gap-6 mt-6">
                      <div>
                        <h3 className="text-foreground font-semibold mb-2 border-b pb-2">SKU Architecture</h3>
                        <p className="text-sm">Every product variant requires a strictly unique Stock Keeping Unit (SKU). We strongly recommend using a standardized alphanumeric format (e.g., `CAT-BRND-MDL-CLR`) rather than random numbers to improve warehouse pick accuracy.</p>
                      </div>
                      
                      <div>
                        <h3 className="text-foreground font-semibold mb-2 border-b pb-2">Valuation & Pricing</h3>
                        <p className="text-sm">Products track two critical financial metrics:</p>
                        <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                          <li><strong>Cost Price:</strong> The default valuation used for calculating COGS (Cost of Goods Sold) and inventory asset value.</li>
                          <li><strong>Selling Price:</strong> The default retail price populated into Sales Orders and Quotations.</li>
                        </ul>
                      </div>
                      
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-900 mt-2">
                        <h4 className="text-blue-800 dark:text-blue-300 font-semibold flex items-center gap-2"><Info className="h-4 w-4" /> Best Practice</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">When deprecating old products, do not delete them if they have transactional history. Instead, mark them as 'Inactive' to preserve historical sales data while hiding them from new orders.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Inventory & Warehouses' && (
                  <div className="space-y-4 text-muted-foreground">
                    <p className="text-base text-foreground font-medium">StockFlow utilizes a perpetual inventory system. Stock levels are automatically calculated based on real-time transactional movements rather than periodic counts.</p>
                    
                    <div className="mt-6 space-y-6">
                      <div>
                        <h3 className="text-foreground font-semibold mb-2">Warehouse Architecture</h3>
                        <p className="text-sm">You can create unlimited warehouses. A warehouse can represent a massive fulfillment center, a retail storefront backroom, or even a logical quarantine zone for defective returns.</p>
                      </div>
                      
                      <div>
                        <h3 className="text-foreground font-semibold mb-3">Stock Movements Explained</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left border-collapse">
                            <thead>
                              <tr className="bg-muted">
                                <th className="p-3 font-semibold text-foreground border">Transaction Type</th>
                                <th className="p-3 font-semibold text-foreground border">Impact on Stock</th>
                                <th className="p-3 font-semibold text-foreground border">Trigger Event</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="p-3 border font-medium">Inbound Receipt</td>
                                <td className="p-3 border text-emerald-600 font-medium">Increases</td>
                                <td className="p-3 border">Receiving goods against an Approved PO</td>
                              </tr>
                              <tr>
                                <td className="p-3 border font-medium">Outbound Dispatch</td>
                                <td className="p-3 border text-destructive font-medium">Decreases</td>
                                <td className="p-3 border">Shipping goods for a Confirmed SO</td>
                              </tr>
                              <tr>
                                <td className="p-3 border font-medium">Customer Return</td>
                                <td className="p-3 border text-emerald-600 font-medium">Increases</td>
                                <td className="p-3 border">Processing a Sales Return</td>
                              </tr>
                              <tr>
                                <td className="p-3 border font-medium">Vendor Return</td>
                                <td className="p-3 border text-destructive font-medium">Decreases</td>
                                <td className="p-3 border">Processing a Purchase Return</td>
                              </tr>
                              <tr>
                                <td className="p-3 border font-medium">Manual Adjustment</td>
                                <td className="p-3 border text-blue-600 font-medium">Variable</td>
                                <td className="p-3 border">Executing a cycle count or writing off damage</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Purchase Orders' && (
                  <div className="space-y-4 text-muted-foreground">
                    <p className="text-base text-foreground font-medium">The Procurement engine enforces strict financial controls over inbound inventory acquisition.</p>
                    
                    <div className="mt-6">
                      <h3 className="text-foreground font-semibold mb-4 border-b pb-2">The Standard Procurement Lifecycle</h3>
                      
                      <div className="space-y-4 pl-2 border-l-2 border-muted ml-3">
                        <div className="relative pl-6">
                          <div className="absolute w-3 h-3 bg-slate-300 rounded-full -left-[23px] top-1.5 border-2 border-background"></div>
                          <h4 className="text-foreground font-semibold">1. DRAFT</h4>
                          <p className="text-sm">Initial creation phase. Staff can freely edit quantities, unit costs, and expected delivery dates without impacting ledgers.</p>
                        </div>
                        <div className="relative pl-6">
                          <div className="absolute w-3 h-3 bg-blue-400 rounded-full -left-[23px] top-1.5 border-2 border-background"></div>
                          <h4 className="text-foreground font-semibold">2. PENDING APPROVAL (Optional)</h4>
                          <p className="text-sm">Locked for editing. Awaiting signature from a Manager or Admin. Ensures budget compliance.</p>
                        </div>
                        <div className="relative pl-6">
                          <div className="absolute w-3 h-3 bg-amber-400 rounded-full -left-[23px] top-1.5 border-2 border-background"></div>
                          <h4 className="text-foreground font-semibold">3. APPROVED</h4>
                          <p className="text-sm">Financially committed. The PO document can now be dispatched to the supplier via PDF export. Warehouse staff are alerted to expect inbound freight.</p>
                        </div>
                        <div className="relative pl-6">
                          <div className="absolute w-3 h-3 bg-indigo-400 rounded-full -left-[23px] top-1.5 border-2 border-background"></div>
                          <h4 className="text-foreground font-semibold">4. PARTIALLY RECEIVED</h4>
                          <p className="text-sm">Some lines have arrived and been booked into inventory. The remaining quantities are kept open on backorder.</p>
                        </div>
                        <div className="relative pl-6">
                          <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[23px] top-1.5 border-2 border-background"></div>
                          <h4 className="text-foreground font-semibold">5. COMPLETED</h4>
                          <p className="text-sm">All ordered quantities have been successfully received and allocated to warehouses. The ledger is closed.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Sales Orders' && (
                  <div className="space-y-4 text-muted-foreground">
                    <p className="text-base text-foreground font-medium">The Order Management system handles B2B and wholesale outbound logistics, from quotation to final delivery.</p>
                    
                    <div className="mt-6">
                      <h3 className="text-foreground font-semibold mb-4 border-b pb-2">The Standard Fulfillment Lifecycle</h3>
                      
                      <div className="space-y-4 pl-2 border-l-2 border-muted ml-3">
                        <div className="relative pl-6">
                          <div className="absolute w-3 h-3 bg-slate-300 rounded-full -left-[23px] top-1.5 border-2 border-background"></div>
                          <h4 className="text-foreground font-semibold">1. DRAFT</h4>
                          <p className="text-sm">Initial quotation phase. Can be exported as a Pro-forma Invoice for customer review. No stock is reserved.</p>
                        </div>
                        <div className="relative pl-6">
                          <div className="absolute w-3 h-3 bg-blue-400 rounded-full -left-[23px] top-1.5 border-2 border-background"></div>
                          <h4 className="text-foreground font-semibold">2. CONFIRMED</h4>
                          <p className="text-sm">Customer has authorized the purchase. The order is locked, and fulfillment teams are notified.</p>
                        </div>
                        <div className="relative pl-6">
                          <div className="absolute w-3 h-3 bg-amber-400 rounded-full -left-[23px] top-1.5 border-2 border-background"></div>
                          <h4 className="text-foreground font-semibold">3. PROCESSING</h4>
                          <p className="text-sm">Warehouse staff are actively picking and packing the goods. Pick lists are generated.</p>
                        </div>
                        <div className="relative pl-6">
                          <div className="absolute w-3 h-3 bg-indigo-400 rounded-full -left-[23px] top-1.5 border-2 border-background"></div>
                          <h4 className="text-foreground font-semibold">4. DISPATCHED</h4>
                          <p className="text-sm">Goods have been handed over to the carrier. Inventory is permanently deducted from the warehouse ledger. Waybills attached.</p>
                        </div>
                        <div className="relative pl-6">
                          <div className="absolute w-3 h-3 bg-emerald-500 rounded-full -left-[23px] top-1.5 border-2 border-background"></div>
                          <h4 className="text-foreground font-semibold">5. DELIVERED</h4>
                          <p className="text-sm">Proof of Delivery received. The transaction is fully finalized for accounting purposes.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Dashboard Metrics' && (
                  <div className="space-y-4 text-muted-foreground">
                    <p className="text-base text-foreground font-medium">The Enterprise Dashboard is your command center, rendering real-time telemetry of your supply chain health.</p>
                    
                    <div className="grid gap-6 mt-6">
                      <div className="p-4 border rounded-lg bg-card">
                        <h4 className="text-foreground font-semibold mb-2">Executive KPI Ribbon</h4>
                        <p className="text-sm">Located at the top, displaying Gross Revenue, Pending Receivables, Active Orders, and Low Stock Alerts. These metrics cache briefly but refresh automatically upon transactional changes.</p>
                      </div>
                      
                      <div className="p-4 border rounded-lg bg-card">
                        <h4 className="text-foreground font-semibold mb-2">Actionable Workflows</h4>
                        <p className="text-sm">The "Require Attention" panel surfaces Purchase Orders awaiting manager approval and Sales Orders stuck in Processing, allowing direct intervention without navigating to module lists.</p>
                      </div>
                      
                      <div className="p-4 border rounded-lg bg-card">
                        <h4 className="text-foreground font-semibold mb-2">Velocity Analytics</h4>
                        <p className="text-sm">Interactive charts visualizing 14-day inbound vs outbound velocity, helping you anticipate cash flow requirements and warehouse staffing needs.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Generating Reports' && (
                  <div className="space-y-4 text-muted-foreground">
                    <p className="text-base text-foreground font-medium">StockFlow features a high-performance analytics engine capable of rendering complex cross-module aggregates.</p>
                    
                    <p className="text-sm mt-4">Navigate to the <strong>Reports</strong> module to execute standard queries:</p>
                    
                    <div className="overflow-x-auto mt-4 border rounded-lg">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="bg-muted border-b">
                            <th className="p-3 font-semibold text-foreground">Report Type</th>
                            <th className="p-3 font-semibold text-foreground">Primary Use Case</th>
                            <th className="p-3 font-semibold text-foreground">Format</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          <tr>
                            <td className="p-3 font-medium">Inventory Valuation</td>
                            <td className="p-3">End-of-month accounting. Calculates (Stock Qty × Unit Cost) across all active warehouses.</td>
                            <td className="p-3"><span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">PDF / CSV</span></td>
                          </tr>
                          <tr>
                            <td className="p-3 font-medium">Sales Tax Liability</td>
                            <td className="p-3">Quarterly tax filing. Aggregates collected tax across all Delivered sales orders.</td>
                            <td className="p-3"><span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">CSV</span></td>
                          </tr>
                          <tr>
                            <td className="p-3 font-medium">Stock Velocity</td>
                            <td className="p-3">Procurement planning. Identifies fast-moving vs dead stock based on 90-day dispatch history.</td>
                            <td className="p-3"><span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">Interactive</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'Exporting Data' && (
                  <div className="space-y-4 text-muted-foreground">
                    <p className="text-base text-foreground font-medium">Full data portability is a core principle. You can extract raw data from any module for external processing in Excel, Tableau, or PowerBI.</p>
                    
                    <div className="p-6 border rounded-lg bg-muted/30 mt-6">
                      <h3 className="text-foreground font-semibold mb-3">How to Export:</h3>
                      <ol className="list-decimal pl-5 space-y-2 text-sm">
                        <li>Navigate to any master list (e.g., Products, Sales Orders).</li>
                        <li>Use the built-in filters (Search, Status dropdowns) to narrow down the dataset.</li>
                        <li>Click the <strong>Export CSV</strong> or <strong>Download</strong> button in the top-right toolbar.</li>
                        <li>The system will stream a dynamically generated, comma-separated values file reflecting your exact filters.</li>
                      </ol>
                      
                      <div className="mt-4 pt-4 border-t flex gap-3 text-sm text-amber-700 dark:text-amber-400">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p>Note: Enterprise exports are capped at 50,000 rows per request to maintain system stability. For larger datasets, utilize the REST API.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'API Documentation' && (
                  <div className="space-y-4 text-muted-foreground">
                    <p className="text-base text-foreground font-medium">StockFlow Enterprise provides a comprehensive, stateless REST API for headless integrations with ERPs, storefronts, and 3PL providers.</p>
                    
                    <div className="mt-6 space-y-4">
                      <h3 className="text-foreground font-semibold border-b pb-2">Authentication</h3>
                      <p className="text-sm">All API requests must include a Bearer token in the Authorization header. Generate programmatic keys via Settings &gt; Integrations.</p>
                      <div className="bg-slate-900 text-slate-300 p-4 rounded-lg font-mono text-xs overflow-x-auto">
                        Authorization: Bearer sk_live_51Mxxxxxxxxxxxxxxxxxxx
                      </div>

                      <h3 className="text-foreground font-semibold border-b pb-2 mt-6">Core Endpoints</h3>
                      <div className="space-y-2 font-mono text-sm">
                        <div className="flex gap-4 p-3 border rounded bg-card items-center">
                          <span className="text-blue-600 font-bold w-16">GET</span>
                          <span className="text-foreground">/api/v1/products</span>
                        </div>
                        <div className="flex gap-4 p-3 border rounded bg-card items-center">
                          <span className="text-emerald-600 font-bold w-16">POST</span>
                          <span className="text-foreground">/api/v1/sales-orders</span>
                        </div>
                        <div className="flex gap-4 p-3 border rounded bg-card items-center">
                          <span className="text-amber-600 font-bold w-16">PATCH</span>
                          <span className="text-foreground">/api/v1/inventory/adjust</span>
                        </div>
                      </div>
                      
                      <p className="text-sm mt-4 italic">Full OpenAPI (Swagger) specifications are available upon request from your Technical Account Manager.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'FAQs' && (
                  <div className="space-y-6 text-muted-foreground">
                    <p className="text-base text-foreground font-medium">Frequently asked questions from our enterprise administrators.</p>
                    
                    <div className="space-y-6 mt-6">
                      <div className="p-5 border rounded-lg bg-card">
                        <h4 className="text-foreground font-semibold flex gap-2 items-start">
                          <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                          How do I configure multiple currencies?
                        </h4>
                        <p className="mt-2 text-sm">Currently, a Workspace operates on a single unified base currency configured during onboarding. If you operate in multiple currencies, we recommend spinning up separate Workspaces for each geographic subsidiary.</p>
                      </div>
                      
                      <div className="p-5 border rounded-lg bg-card">
                        <h4 className="text-foreground font-semibold flex gap-2 items-start">
                          <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                          Can I delete an accidental Purchase Order?
                        </h4>
                        <p className="mt-2 text-sm">To ensure strict audit compliance, Orders in DRAFT status can be permanently deleted. However, once an order transitions to APPROVED or beyond, it is locked into the ledger and can only be marked as CANCELLED.</p>
                      </div>

                      <div className="p-5 border rounded-lg bg-card">
                        <h4 className="text-foreground font-semibold flex gap-2 items-start">
                          <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                          What happens if I receive more stock than I ordered?
                        </h4>
                        <p className="mt-2 text-sm">The Goods Receipt interface prevents receiving quantities greater than the ordered amount to prevent fraud. If a vendor overships, you must manually edit the PO to increase the Ordered Quantity, approve the amendment, and then receive the excess.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Keyboard Shortcuts' && (
                  <div className="space-y-6">
                    <p className="text-muted-foreground text-base">Accelerate your workflow. StockFlow Enterprise supports extensive global hotkeys for power users.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted p-3 border-b font-semibold text-foreground">Global Navigation</div>
                        <ul className="divide-y text-sm">
                          <li className="flex justify-between items-center p-3 hover:bg-muted/50">
                            <span className="text-muted-foreground">Global Search Focus</span>
                            <kbd className="px-2 py-1 bg-background shadow-sm rounded border text-xs font-mono font-semibold">/</kbd>
                          </li>
                          <li className="flex justify-between items-center p-3 hover:bg-muted/50">
                            <span className="text-muted-foreground">Go to Dashboard</span>
                            <div className="flex gap-1">
                              <kbd className="px-2 py-1 bg-background shadow-sm rounded border text-xs font-mono font-semibold">G</kbd>
                              <span className="text-muted-foreground">then</span>
                              <kbd className="px-2 py-1 bg-background shadow-sm rounded border text-xs font-mono font-semibold">D</kbd>
                            </div>
                          </li>
                          <li className="flex justify-between items-center p-3 hover:bg-muted/50">
                            <span className="text-muted-foreground">Go to Products</span>
                            <div className="flex gap-1">
                              <kbd className="px-2 py-1 bg-background shadow-sm rounded border text-xs font-mono font-semibold">G</kbd>
                              <span className="text-muted-foreground">then</span>
                              <kbd className="px-2 py-1 bg-background shadow-sm rounded border text-xs font-mono font-semibold">P</kbd>
                            </div>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted p-3 border-b font-semibold text-foreground">Fast Creation</div>
                        <ul className="divide-y text-sm">
                          <li className="flex justify-between items-center p-3 hover:bg-muted/50">
                            <span className="text-muted-foreground">New Sales Order</span>
                            <div className="flex gap-1">
                              <kbd className="px-2 py-1 bg-background shadow-sm rounded border text-xs font-mono font-semibold">C</kbd>
                              <span className="text-muted-foreground">then</span>
                              <kbd className="px-2 py-1 bg-background shadow-sm rounded border text-xs font-mono font-semibold">S</kbd>
                            </div>
                          </li>
                          <li className="flex justify-between items-center p-3 hover:bg-muted/50">
                            <span className="text-muted-foreground">New Purchase Order</span>
                            <div className="flex gap-1">
                              <kbd className="px-2 py-1 bg-background shadow-sm rounded border text-xs font-mono font-semibold">C</kbd>
                              <span className="text-muted-foreground">then</span>
                              <kbd className="px-2 py-1 bg-background shadow-sm rounded border text-xs font-mono font-semibold">O</kbd>
                            </div>
                          </li>
                          <li className="flex justify-between items-center p-3 hover:bg-muted/50">
                            <span className="text-muted-foreground">Save Form / Submit</span>
                            <div className="flex gap-1">
                              <kbd className="px-2 py-1 bg-background shadow-sm rounded border text-xs font-mono font-semibold">Ctrl</kbd>
                              <span className="text-muted-foreground">+</span>
                              <kbd className="px-2 py-1 bg-background shadow-sm rounded border text-xs font-mono font-semibold">Enter</kbd>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Release Notes' && (
                  <div className="space-y-8 mt-4">
                    <div className="relative pl-6 pb-8 border-l-2 border-primary">
                      <div className="absolute w-4 h-4 bg-primary rounded-full -left-[9px] top-1 border-4 border-background"></div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-foreground m-0">v2.0 - Enterprise Core Upgrade</h3>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">LATEST</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 font-medium">Released: Today</p>
                      
                      <div className="bg-card border rounded-lg p-5">
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Package className="h-4 w-4" /> Major Enhancements</h4>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                          <li><strong>Enterprise Forms:</strong> Completely rewritten validation engine utilizing Zod and React Hook Form. Forms now prevent accidental navigation and display inline schema validations instantly.</li>
                          <li><strong>Data Grid Migration:</strong> Legacy HTML tables replaced with high-performance virtualized DataTables supporting complex filtering, state preservation, and immediate pagination.</li>
                          <li><strong>Automated Drawers:</strong> Added seamless context-aware slide-out drawers for rapid customer/supplier creation directly from Order interfaces.</li>
                          <li><strong>Comprehensive Help Center:</strong> This exact documentation portal, vastly expanded for enterprise onboarding.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Returns' && (
                  <div className="space-y-4 text-muted-foreground">
                    <p className="text-base text-foreground font-medium">Returns management handles reverse logistics for both customers and suppliers.</p>
                    <div className="mt-6 space-y-4">
                      <h3 className="text-foreground font-semibold">Sales Returns (RMA)</h3>
                      <p className="text-sm">When a customer returns goods, initiate a Sales Return against the original order. The goods will be received back into the designated warehouse and inventory levels will increase.</p>
                      
                      <h3 className="text-foreground font-semibold mt-4">Purchase Returns (RTV)</h3>
                      <p className="text-sm">When returning defective stock to a supplier, initiate a Purchase Return. Stock is deducted from your warehouse upon dispatch back to the vendor.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'Finance' && (
                  <div className="space-y-4 text-muted-foreground">
                    <p className="text-base text-foreground font-medium">Finance module tracks accounts receivable, accounts payable, and profitability.</p>
                    <div className="mt-6">
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        <li><strong>Invoices:</strong> Automatically generated upon Sales Order dispatch. Tracks payment statuses (Pending, Partial, Paid).</li>
                        <li><strong>Bills:</strong> Logged when goods are received from a Purchase Order.</li>
                        <li><strong>Margins:</strong> Analyzes the difference between moving average cost and actual sale price.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'Settings' && (
                  <div className="space-y-4 text-muted-foreground">
                    <p className="text-base text-foreground font-medium">Configure global parameters for your Workspace.</p>
                    <div className="mt-6 space-y-4 text-sm">
                      <p><strong>Company Profile:</strong> Set legal entity name, address, and contact information for documents.</p>
                      <p><strong>Taxes & Currencies:</strong> Define default VAT/GST rates and base operating currency.</p>
                      <p><strong>Users & Roles:</strong> Invite team members and assign RBAC permissions.</p>
                      <p><strong>API Keys:</strong> Generate tokens for integrations and headless operations.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'Troubleshooting' && (
                  <div className="space-y-4 text-muted-foreground">
                    <p className="text-base text-foreground font-medium">Common issues and resolutions.</p>
                    <div className="mt-6 space-y-4 text-sm">
                      <div className="p-4 border rounded-lg bg-card">
                        <h4 className="text-foreground font-semibold mb-1">Cannot Approve Order</h4>
                        <p>Verify that your assigned Role has approval permissions (Manager or Admin). Ensure all required fields are completed.</p>
                      </div>
                      <div className="p-4 border rounded-lg bg-card">
                        <h4 className="text-foreground font-semibold mb-1">Negative Stock Prevented</h4>
                        <p>StockFlow prevents dispatching more inventory than is physically available in the selected warehouse. Perform a manual stock adjustment if your physical count differs from the system.</p>
                      </div>
                      <div className="p-4 border rounded-lg bg-card">
                        <h4 className="text-foreground font-semibold mb-1">Missing Dashboard Data</h4>
                        <p>Dashboard metrics rely on cached aggregations. If data appears stale, use the manual refresh button on the widgets.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
