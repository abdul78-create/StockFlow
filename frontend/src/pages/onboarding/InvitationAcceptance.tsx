import * as React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Loader2, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export function InvitationAcceptance() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleAccept = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await api.post('/workspaces/invitations/accept', { token });
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="w-full max-w-[400px] bg-slate-900/40 border border-white/5 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-xl space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-white">
              Invitation Accepted
            </h1>
            <p className="text-xs text-slate-400">
              You are now a member of the workspace.
            </p>
          </div>
          <Button className="w-full h-10 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="w-full max-w-[400px] bg-slate-900/40 border border-white/5 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-950 font-bold text-base shadow-sm mx-auto">
            SF
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-white">
              You've been invited!
            </h1>
            <p className="text-xs text-slate-400">
              Please sign in or create an account to accept your invitation.
            </p>
          </div>
          <div className="space-y-3">
            <Button className="w-full h-10 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200" onClick={() => navigate('/login', { state: { from: { pathname: `/invite/${token}` } } })}>
              Sign In
            </Button>
            <Button variant="outline" className="w-full h-10 text-xs font-semibold border-white/10 bg-transparent text-white hover:bg-white/5" onClick={() => navigate('/signup')}>
              Create an Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="w-full max-w-[400px] bg-slate-900/40 border border-white/5 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-950 font-bold text-base shadow-sm mx-auto">
          SF
        </div>
        
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-white">
            Accept Invitation
          </h1>
          <p className="text-xs text-slate-400">
            Logged in as <strong className="text-slate-200">{user?.email}</strong>
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3.5 text-xs text-destructive flex items-start gap-2.5 text-left">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="opacity-90">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button className="w-full h-10 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200" onClick={handleAccept} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting...
              </>
            ) : (
              'Accept Invitation'
            )}
          </Button>
          <Button variant="ghost" className="w-full h-10 text-xs text-slate-400 hover:text-white" onClick={() => navigate('/dashboard')}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
export default InvitationAcceptance;
