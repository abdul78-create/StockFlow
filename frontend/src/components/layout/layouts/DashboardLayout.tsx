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

const SIDEBAR_OPEN_WIDTH = 220;
const SIDEBAR_CLOSED_WIDTH = 60;

export function DashboardLayout() {
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const [isMobileOpen, setMobileOpen] = React.useState(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const location = useLocation();

  // Close mobile sidebar on navigation
  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const mobileNavItems = [
    { title: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { title: 'Products', href: '/products', icon: 'products' },
    { title: 'Sales', href: '/sales-orders', icon: 'salesOrders' },
    { title: 'Inventory', href: '/inventory', icon: 'inventory' },
    { title: 'Settings', href: '/settings', icon: 'settings' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-surface selection:bg-primary/10">
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

        {/* Main content area — offset by sidebar width */}
        <div
          className={cn(
            'flex flex-1 flex-col min-w-0',
            'transition-[padding-left] duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
            'lg:pl-[var(--sidebar-w)]'
          )}
          style={{
            ['--sidebar-w' as string]: isSidebarOpen
              ? `${SIDEBAR_OPEN_WIDTH}px`
              : `${SIDEBAR_CLOSED_WIDTH}px`,
          }}
        >
          <Header
            toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
            toggleMobileSidebar={() => setMobileOpen(true)}
          />

          <main
            className="flex-1 overflow-y-auto overflow-x-hidden"
            id="main-scroll-container"
          >
            <div className="mx-auto max-w-[1600px] w-full p-4 md:p-6 pb-24 lg:pb-6">
              <PageErrorBoundary>
                <div key={location.pathname} className="page-enter">
                  <Outlet />
                </div>
              </PageErrorBoundary>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-border/60 bg-background/90 backdrop-blur-xl px-2 lg:hidden flex items-center justify-around pb-[env(safe-area-inset-bottom)]"
      >
        {mobileNavItems.map((item) => {
          const Icon = Icons[item.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.title}
              to={item.href}
              className={cn(
                'group flex flex-col items-center justify-center flex-1 h-full gap-1',
                'text-[10px] font-medium transition-all duration-150 active:scale-95',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'flex items-center justify-center h-7 w-7 rounded-xl transition-all duration-150',
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground group-hover:bg-muted'
              )}>
                {Icon && <Icon className="h-[18px] w-[18px]" />}
              </div>
              <span className="tracking-wide">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
