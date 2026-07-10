import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, UserX } from 'lucide-react';

export function Unauthorized() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    navigate('/login', { state: { from: location.state?.from || '/' } });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="w-full max-w-[400px] bg-slate-900/40 border border-white/5 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-xl space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-400">
          <UserX className="h-6 w-6" />
        </div>
        
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-white">Session Expired</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your session has expired or you are not logged in. Please log in again to access this page.
          </p>
        </div>

        <Button className="w-full h-10 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200" onClick={handleLogin}>
          <LogIn className="mr-1.5 h-3.5 w-3.5" /> Return to Login
        </Button>
      </div>
    </div>
  );
}
export default Unauthorized;
