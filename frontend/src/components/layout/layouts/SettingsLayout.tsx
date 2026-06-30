import * as React from 'react';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { cn } from '../../../lib/utils';
import { Outlet, NavLink } from 'react-router-dom';

const settingsNav = [
  { title: 'Profile', href: '/settings/profile' },
  { title: 'Account', href: '/settings/account' },
  { title: 'Appearance', href: '/settings/appearance' },
  { title: 'Notifications', href: '/settings/notifications' },
  { title: 'Workspace', href: '/settings/workspace' },
];

export function SettingsLayout() {
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const [isMobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-muted/40">
      <Sidebar
        isOpen={isSidebarOpen}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300 ease-in-out',
          isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        )}
      >
        <Header
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
          toggleMobileSidebar={() => setMobileOpen(true)}
        />
        <main className="flex flex-1 flex-col p-6 lg:flex-row lg:space-x-12">
          <aside className="lg:w-1/5 mb-8 lg:mb-0">
            <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 overflow-x-auto pb-2 lg:pb-0">
              {settingsNav.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-start rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted/50 hover:text-foreground',
                      isActive ? 'bg-muted font-semibold text-foreground' : 'text-muted-foreground'
                    )
                  }
                >
                  {item.title}
                </NavLink>
              ))}
            </nav>
          </aside>
          <div className="flex-1 max-w-3xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
