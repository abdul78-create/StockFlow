import * as React from 'react';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { cn } from '../../../lib/utils';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { OfflineBanner } from '../../OfflineBanner';
import { KeyboardShortcutsHelp } from '../../KeyboardShortcutsHelp';
import { BarcodeScannerListener } from '../../BarcodeScannerListener';
import { Icons } from '../../../lib/icons';
import { PageErrorBoundary } from '../../PageErrorBoundary';
import { HelpWidget } from '../HelpWidget';
import { CommandPalette } from '../CommandPalette';

export function DashboardLayout() {
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const [isMobileOpen, setMobileOpen] = React.useState(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const location = useLocation();

  const mobileNavItems = [
    { title: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { title: 'Products', href: '/products', icon: 'products' },
    { title: 'Sales', href: '/sales-orders', icon: 'salesOrders' },
    { title: 'Settings', href: '/settings', icon: 'settings' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-muted/20 selection:bg-primary/10">
      <OfflineBanner />
      <KeyboardShortcutsHelp />
      <BarcodeScannerListener />
      <HelpWidget />
      <CommandPalette open={isCommandPaletteOpen} setOpen={setCommandPaletteOpen} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          isOpen={isSidebarOpen}
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            'flex flex-1 flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] min-w-0',
            isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
          )}
        >
          <Header
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
            toggleMobileSidebar={() => setMobileOpen(true)}
          />
          <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
            <div className="mx-auto max-w-[1600px] w-full">
              <PageErrorBoundary>
                <Outlet />
              </PageErrorBoundary>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t bg-background/80 backdrop-blur-xl px-2 lg:hidden flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.02)] pb-[env(safe-area-inset-bottom)]">
        {mobileNavItems.map((item) => {
          const Icon = Icons[item.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.title}
              to={item.href}
              className={cn(
                'group flex flex-col items-center justify-center flex-1 h-full gap-1 text-[10px] font-medium transition-all duration-200 active:scale-95',
                isActive 
                  ? 'text-primary font-semibold' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                "flex items-center justify-center p-1.5 rounded-full transition-all duration-200",
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground group-hover:bg-muted"
              )}>
                {Icon && <Icon className="h-[18px] w-[18px]" />}
              </div>
              <span className="tracking-wide">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
