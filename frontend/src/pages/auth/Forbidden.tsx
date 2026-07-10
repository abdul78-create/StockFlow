import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="w-full max-w-[400px] bg-slate-900/40 border border-white/5 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-xl space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20 text-destructive">
          <ShieldAlert className="h-6 w-6" />
        </div>
        
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-white">Access Denied</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            You do not have the required permissions to view this page. If you believe this is an error, please contact your administrator.
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="w-full h-10 text-xs font-semibold border-white/10 text-white hover:bg-white/5" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Go Back
          </Button>
          <Button className="w-full h-10 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200" onClick={() => navigate('/dashboard')}>
            <Home className="mr-1.5 h-3.5 w-3.5" /> Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
export default Forbidden;
