import * as React from 'react';
import { Icons } from '../../lib/icons';
import { Button } from '../ui/button';
import { GlobalSearch } from './GlobalSearch';
import { NotificationCenter } from './NotificationCenter';
import { UserMenu } from './UserMenu';

interface HeaderProps {
  toggleSidebar?: () => void;
  toggleMobileSidebar?: () => void;
  hideSidebarToggle?: boolean;
}

export function Header({
  toggleSidebar,
  toggleMobileSidebar,
  hideSidebarToggle,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:px-6">
      <div className="flex items-center gap-4 lg:gap-6 w-full max-w-2xl">
        {!hideSidebarToggle && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex shrink-0 text-muted-foreground hover:text-foreground"
              onClick={toggleSidebar}
            >
              <Icons.menu className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="flex lg:hidden shrink-0 text-muted-foreground hover:text-foreground"
              onClick={toggleMobileSidebar}
            >
              <Icons.menu className="h-5 w-5" />
            </Button>
          </>
        )}
        <div className="w-full">
          <GlobalSearch />
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <NotificationCenter />
        <div className="hidden sm:block h-6 w-[1px] bg-border" />
        <UserMenu />
      </div>
    </header>
  );
}
