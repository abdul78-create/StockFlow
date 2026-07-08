import * as React from 'react';
import { Book, LifeBuoy, FileText, Keyboard, HelpCircle, Package, Truck, ShoppingCart, Activity, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

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
    ]
  },
  {
    title: 'Analytics & Reports',
    icon: Activity,
    items: [
      { label: 'Dashboard Metrics', href: '#' },
      { label: 'Generating Reports', href: '#' },
      { label: 'Exporting Data', href: '#' },
    ]
  },
  {
    title: 'Reference',
    icon: Book,
    items: [
      { label: 'Keyboard Shortcuts', href: '#' },
      { label: 'API Documentation', href: '#' },
      { label: 'FAQs', href: '#' },
      { label: 'Release Notes', href: '#' },
    ]
  }
];

export function HelpCenter() {
  const [activeTab, setActiveTab] = React.useState('Platform Overview');

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
          {sections.map((section, idx) => (
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
                
                {activeTab === 'Keyboard Shortcuts' && (
                  <div className="space-y-6">
                    <p className="text-base text-muted-foreground">
                      Use these keyboard shortcuts to navigate StockFlow faster. You can view this list anywhere by pressing <kbd className="px-1.5 py-0.5 bg-muted rounded border font-mono">?</kbd>.
                    </p>
                    <div className="space-y-4 max-w-md">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Show shortcuts</span>
                        <kbd className="font-mono bg-muted px-2 py-1 rounded border">?</kbd>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Create record</span>
                        <kbd className="font-mono bg-muted px-2 py-1 rounded border">c</kbd>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Search</span>
                        <kbd className="font-mono bg-muted px-2 py-1 rounded border">s</kbd>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Close modals</span>
                        <kbd className="font-mono bg-muted px-2 py-1 rounded border">esc</kbd>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'Release Notes' && (
                  <div className="space-y-8">
                    <div className="border-l-2 border-primary pl-4">
                      <h3 className="text-lg font-bold text-foreground">RC1.1 - Enterprise Stabilization</h3>
                      <p className="text-sm text-muted-foreground mb-4">Released Today</p>
                      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li><strong>Import/Export Engine:</strong> True CSV/XLSX support with validation and rollback.</li>
                        <li><strong>Enterprise Dashboard:</strong> Real-time financial metrics, charts, and actionable workflow states.</li>
                        <li><strong>Advanced Data Tables:</strong> Added column resizing, density toggles, and multi-sort.</li>
                        <li><strong>Robust Forms:</strong> Unsaved changes warnings and real-time inline validation.</li>
                        <li><strong>Help Center:</strong> Added Keyboard shortcuts and in-app release notes.</li>
                      </ul>
                    </div>
                    
                    <div className="border-l-2 border-muted pl-4">
                      <h3 className="text-lg font-bold text-foreground opacity-80">RC1 - Initial Release Candidate</h3>
                      <p className="text-sm text-muted-foreground mb-4">Released Yesterday</p>
                      <ul className="list-disc pl-5 space-y-2 text-muted-foreground opacity-80">
                        <li>Complete end-to-end business flows for Sales, Purchases, and Inventory.</li>
                        <li>Global error handling middleware implemented.</li>
                      </ul>
                    </div>
                  </div>
                )}
                
                {!['Platform Overview', 'Keyboard Shortcuts', 'Release Notes'].includes(activeTab) && (
                  <div className="space-y-4 text-muted-foreground">
                    <p className="text-base">
                      StockFlow Enterprise is a unified platform for managing multi-warehouse inventory, procurement, and sales operations. 
                    </p>
                    <p>
                      This documentation will help you understand the core concepts and workflows required to operate the system effectively. Use the sidebar to navigate through specific modules.
                    </p>
                    <div className="mt-8 p-6 bg-muted/50 rounded-xl border border-border/50">
                      <h3 className="text-foreground font-semibold mb-2">Need immediate assistance?</h3>
                      <p className="mb-4">Our enterprise support team is available 24/7 for critical operational issues.</p>
                      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                        Contact Support
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'Keyboard Shortcuts' && (
                  <div className="space-y-6">
                    <p className="text-muted-foreground">Master StockFlow Enterprise with these global keyboard shortcuts.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border bg-card">
                        <h4 className="font-medium mb-3">Navigation</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between items-center">
                            <span className="text-muted-foreground">Open Command Palette</span>
                            <kbd className="px-2 py-1 bg-muted rounded border text-xs font-mono">Ctrl + K</kbd>
                          </li>
                          <li className="flex justify-between items-center">
                            <span className="text-muted-foreground">Go to Dashboard</span>
                            <kbd className="px-2 py-1 bg-muted rounded border text-xs font-mono">G , D</kbd>
                          </li>
                          <li className="flex justify-between items-center">
                            <span className="text-muted-foreground">Go to Products</span>
                            <kbd className="px-2 py-1 bg-muted rounded border text-xs font-mono">G , P</kbd>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 rounded-lg border bg-card">
                        <h4 className="font-medium mb-3">Actions</h4>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between items-center">
                            <span className="text-muted-foreground">Create Product</span>
                            <kbd className="px-2 py-1 bg-muted rounded border text-xs font-mono">C , P</kbd>
                          </li>
                          <li className="flex justify-between items-center">
                            <span className="text-muted-foreground">Create Purchase Order</span>
                            <kbd className="px-2 py-1 bg-muted rounded border text-xs font-mono">C , O</kbd>
                          </li>
                          <li className="flex justify-between items-center">
                            <span className="text-muted-foreground">Global Search</span>
                            <kbd className="px-2 py-1 bg-muted rounded border text-xs font-mono">/</kbd>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab !== 'Platform Overview' && activeTab !== 'Keyboard Shortcuts' && (
                  <div className="space-y-4 text-muted-foreground">
                    <p>Documentation for <strong>{activeTab}</strong> is currently being written by our technical writing team.</p>
                    <div className="h-32 bg-muted/30 rounded-lg border border-dashed flex items-center justify-center">
                      <span className="text-sm">Content coming soon in v1.1.0</span>
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
