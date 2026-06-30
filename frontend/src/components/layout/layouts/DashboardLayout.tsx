import * as React from 'react';
import { Sidebar } from '../Sidebar';
import { Header } from '../Header';
import { cn } from '../../../lib/utils';
import { Outlet } from 'react-router-dom';

export function DashboardLayout() {
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
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
