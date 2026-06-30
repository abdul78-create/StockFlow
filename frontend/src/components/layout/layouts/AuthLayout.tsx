import * as React from 'react';
import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-md">
            <span className="text-xl font-bold text-primary-foreground">SF</span>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
