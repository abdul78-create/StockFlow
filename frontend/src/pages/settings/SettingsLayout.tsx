import * as React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Icons } from '@/lib/icons';

interface SettingsNav {
  title: string;
  href: string;
  icon: keyof typeof Icons;
}

const settingsNav: SettingsNav[] = [
  {
    title: 'Workspace',
    href: '/settings/workspace',
    icon: 'organization',
  },
  {
    title: 'Team & Invites',
    href: '/settings/team',
    icon: 'users',
  },
  {
    title: 'Security',
    href: '/settings/security',
    icon: 'shield',
  },
  {
    title: 'Billing & Plans',
    href: '/settings/billing',
    icon: 'reports',
  },
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: 'user',
  },
];

export function SettingsLayout() {
  const location = useLocation();
  
  // If we are at exactly /settings, we might want to redirect to /settings/workspace
  // The route configuration handles that via <Navigate>

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 max-w-6xl mx-auto w-full">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your workspace and account settings.
          </p>
        </div>
        
        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
          {settingsNav.map((item) => {
            const Icon = Icons[item.icon];
            const isActive = location.pathname.startsWith(item.href);
            
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Content Area */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
