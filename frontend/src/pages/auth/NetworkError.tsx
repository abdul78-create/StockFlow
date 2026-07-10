import * as React from 'react';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw } from 'lucide-react';

export function NetworkError() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="w-full max-w-[400px] bg-slate-900/40 border border-white/5 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-xl space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20 text-destructive animate-pulse">
          <WifiOff className="h-6 w-6" />
        </div>
        
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-white">Connection Interrupted</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            We cannot connect to the server right now. This is likely a temporary network issue or the server is undergoing maintenance.
          </p>
        </div>

        <Button className="w-full h-10 text-xs font-semibold bg-white text-slate-950 hover:bg-slate-200" onClick={handleRetry}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retry Connection
        </Button>
      </div>
    </div>
  );
}
export default NetworkError;
