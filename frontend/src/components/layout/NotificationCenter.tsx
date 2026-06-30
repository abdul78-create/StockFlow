import * as React from 'react';
import { Icons } from '../../lib/icons';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

export function NotificationCenter() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Icons.notifications className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-medium leading-none">Notifications</p>
          <p className="text-xs text-muted-foreground cursor-pointer hover:underline">Mark all as read</p>
        </div>
        <div className="p-4 py-6 text-center text-sm text-muted-foreground">
          You have no new notifications.
        </div>
      </PopoverContent>
    </Popover>
  );
}
