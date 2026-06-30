import * as React from 'react';
import { Header } from '../Header';
import { Outlet } from 'react-router-dom';

export function FullWidthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header hideSidebarToggle />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
