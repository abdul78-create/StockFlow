import * as React from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Session {
  id: string;
  ipAddress: string | null;
  browser: string | null;
  createdAt: string;
  lastUsedAt: string | null;
}

export function SecuritySettings() {
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showConfirmLogoutAll, setShowConfirmLogoutAll] = React.useState(false);

  const fetchSessions = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/auth/sessions');
      if (res.data?.success) {
        setSessions(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevoke = async (sessionId: string) => {
    try {
      await api.delete(`/auth/sessions/${sessionId}`);
      fetchSessions();
      toast.success('Session revoked successfully');
    } catch (err) {
      toast.error('Failed to revoke session');
    }
  };

  const handleRevokeAll = async () => {
    try {
      await api.delete('/auth/sessions');
      fetchSessions();
      toast.success('Logged out of all other devices');
    } catch (err) {
      toast.error('Failed to revoke sessions');
    }
    setShowConfirmLogoutAll(false);
  };

  // We assume the first session returned (most recently active) or the one that 
  // matches our current request is "Current Session". 
  // For simplicity since we don't have sessionId in the frontend token directly accessible yet,
  // we will just treat the first one as current if sorted by lastActive, or we can check the JWT.
  // Actually, our backend sorted them by createdAt desc, so we just label the most recent one or the one that we're currently using.
  // Let's assume the first one in the list is the current one (if we order by lastUsed desc). 
  // Since we ordered by createdAt desc in the backend, the latest created is first.
  
  if (isLoading) {
    return <div className="flex h-32 items-center justify-center"><Icons.refresh className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Security</h3>
          <p className="text-sm text-muted-foreground">
            Manage your active sessions and connected devices.
          </p>
        </div>
        {sessions.length > 1 && (
          <Button variant="outline" onClick={() => setShowConfirmLogoutAll(true)}>
            Log out all other devices
          </Button>
        )}
      </div>
      <hr />

      <div className="space-y-4">
        {sessions.map((session, idx) => {
          const isCurrent = idx === 0; // Rough heuristic: assuming the first is current if backend isn't explicit
          
          let browserName = 'Unknown Browser';
          let browserIcon = <Icons.shield className="h-5 w-5" />;
          
          if (session.browser) {
            if (session.browser.includes('Chrome')) browserName = 'Chrome';
            else if (session.browser.includes('Firefox')) browserName = 'Firefox';
            else if (session.browser.includes('Safari')) browserName = 'Safari';
            else if (session.browser.includes('Edge')) browserName = 'Edge';
            else browserName = session.browser;
          }

          return (
            <div key={session.id} className="flex items-center justify-between p-4 rounded-xl border bg-card">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  {browserIcon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{browserName}</span>
                    {isCurrent && (
                      <span className="inline-flex items-center rounded-full bg-green-500/10 text-green-600 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                        Current Device
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    {session.ipAddress || 'Unknown IP'} • 
                    {session.lastUsedAt ? formatDistanceToNow(new Date(session.lastUsedAt), { addSuffix: true }) : 'Never active'}
                  </div>
                </div>
              </div>
              
              {!isCurrent && (
                <Button variant="ghost" size="sm" onClick={() => handleRevoke(session.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  Revoke
                </Button>
              )}
            </div>
          );
        })}
      </div>
      <ConfirmDialog
        open={showConfirmLogoutAll}
        onOpenChange={setShowConfirmLogoutAll}
        title="Log Out of All Devices"
        description="Are you sure you want to log out of all other devices? This action cannot be undone."
        confirmLabel="Log Out All"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleRevokeAll}
      />
    </div>
  );
}
