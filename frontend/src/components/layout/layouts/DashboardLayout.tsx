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

export function DashboardLayout() {
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const [isMobileOpen, setMobileOpen] = React.useState(false);
  const location = useLocation();

  const mobileNavItems = [
    { title: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { title: 'Products', href: '/products', icon: 'products' },
    { title: 'Sales', href: '/sales-orders', icon: 'salesOrders' },
    { title: 'Settings', href: '/settings', icon: 'settings' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <OfflineBanner />
      <KeyboardShortcutsHelp />
      <BarcodeScannerListener />
      
      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          isMobileOpen={isMobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            'flex flex-1 flex-col transition-all duration-300 ease-in-out pb-16 lg:pb-0',
            isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
          )}
        >
          <Header
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
            toggleMobileSidebar={() => setMobileOpen(true)}
          />
          <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
            <PageErrorBoundary>
              <Outlet />
            </PageErrorBoundary>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t bg-background px-6 lg:hidden flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const Icon = Icons[item.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.title}
              to={item.href}
              className={cn(
                'flex flex-col items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors',
                isActive && 'text-primary'
              )}
            >
              {Icon && <Icon className="h-5 w-5" />}
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
