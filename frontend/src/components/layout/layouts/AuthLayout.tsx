import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { Boxes, Shield, Zap } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors">
      {/* Left Pane: Brand, Value Proposition (Hidden on Mobile/Tablet) */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-slate-900 dark:bg-slate-900 p-12 flex-col justify-between overflow-hidden text-white border-r border-slate-800">
        {/* Subtle Decorative Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-white text-slate-950 font-bold text-base select-none">
            SF
          </div>
          <span className="font-bold tracking-tight text-xl">StockFlow</span>
        </div>

        {/* Content Box */}
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            Control your stock. <br />
            Optimize your cash flow.
          </h2>
          <p className="text-slate-400 text-sm max-w-sm font-normal">
            Automate procurement operations, manage sales conversions, and run real-time multi-warehouse audits with clean software.
          </p>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex gap-3 items-start">
              <div className="p-1 rounded bg-slate-800 text-emerald-500 mt-0.5">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-350">Enterprise Integrity</p>
                <p className="text-slate-400 text-xs mt-0.5">Workspace isolation & auditable database logs.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="p-1 rounded bg-slate-800 text-amber-500 mt-0.5">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-350">Zero Latency</p>
                <p className="text-slate-400 text-xs mt-0.5">Real-time SSE notifications for stock thresholds.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-500">
          &copy; {new Date().getFullYear()} StockFlow. All rights reserved.
        </div>
      </div>

      {/* Right Pane: Main Authentication Box */}
      <div className="col-span-1 lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Branded Logo for Mobile (Hidden on Desktop) */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="flex size-8 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-bold text-sm select-none">
              SF
            </div>
            <span className="font-bold tracking-tight text-lg text-slate-900 dark:text-white">StockFlow</span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
