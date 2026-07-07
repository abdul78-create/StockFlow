import * as React from 'react';
import { useAuthStore } from '@/store/auth';
import { useWorkspaceStore } from '@/store/workspace';

export function WelcomeHeader() {
  const { user } = useAuthStore();
  const { activeWorkspaceId, organizations } = useWorkspaceStore();
  
  if (!user) return null;

  const activeOrg = organizations.find((o) => o.id === activeWorkspaceId) || organizations[0];

  return (
    <div className="flex flex-col gap-1 mb-2">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Good Morning, {user.firstName} 👋
      </h1>
      <p className="text-muted-foreground text-sm">
        Welcome back to StockFlow Enterprise.
      </p>
      
      <div className="flex items-center gap-4 mt-3 text-sm font-medium">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Workspace:</span>
          <span className="text-foreground capitalize">{activeOrg?.name || 'Default'}</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-border" />
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground">Role:</span>
          <span className="text-foreground">{activeOrg?.role || 'User'}</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-border" />
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-600 dark:text-emerald-400">Everything is operating normally today.</span>
        </div>
      </div>
      
      <div className="mt-1">
        <span className="text-xs text-muted-foreground/70">Last synced: Just now</span>
      </div>
    </div>
  );
}
