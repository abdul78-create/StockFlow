import * as React from 'react';
import { useAuthStore } from '@/store/auth';
import { useWorkspaceStore } from '@/store/workspace';

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function WelcomeHeader() {
  const { user } = useAuthStore();
  const { activeWorkspaceId, organizations } = useWorkspaceStore();
  const activeOrg = organizations.find(o => o.id === activeWorkspaceId) ?? organizations[0];

  if (!user) return null;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2 flex-wrap">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {getTimeOfDay()}, {user.firstName} 👋
        </h1>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
          All systems normal
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {today} ·{' '}
        <span className="font-medium text-foreground/70">{activeOrg?.name ?? 'Your workspace'}</span>
        {activeOrg?.role && (
          <span className="text-muted-foreground"> · {activeOrg.role}</span>
        )}
      </p>
    </div>
  );
}
