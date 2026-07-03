import * as React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { api } from '@/lib/api';
import { useWorkspaceStore } from '@/store/workspace';

export function InvitationAcceptance() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  // Note: We ideally need an unauthenticated endpoint to fetch invite details by token
  // to show the org name to the user before they log in. Since we don't have that in Phase A,
  // we will just show a generic message if they are not logged in.

  const handleAccept = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await api.post('/workspaces/invitations/accept', { token });
      
      // Refresh user to get new memberships
      await checkAuth();
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired invitation token.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-md rounded-xl border bg-card text-card-foreground shadow p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mb-6">
            <Icons.success className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            Invitation Accepted
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            You are now a member of the workspace.
          </p>
          <Button className="w-full" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-md rounded-xl border bg-card text-card-foreground shadow p-8 text-center">
          <div className="mb-8 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-md">
              <span className="text-xl font-bold text-primary-foreground">SF</span>
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            You've been invited!
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Please sign in or create an account to accept your invitation.
          </p>
          <div className="space-y-4">
            <Button className="w-full" onClick={() => navigate('/login', { state: { from: { pathname: `/invite/${token}` } } })}>
              Sign In
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/signup')}>
              Create an Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md rounded-xl border bg-card text-card-foreground shadow p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-md">
            <span className="text-xl font-bold text-primary-foreground">SF</span>
          </div>
        </div>
        
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Accept Invitation
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Logged in as <strong>{user?.email}</strong>
        </p>

        {error && (
          <div className="mb-6 rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2 text-left">
            <Icons.error className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button className="w-full" onClick={handleAccept} disabled={isLoading}>
            {isLoading && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
            Accept Invitation
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
