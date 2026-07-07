import * as React from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Icons } from '@/lib/icons';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function NotificationCenter() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" id="notification-bell">
          <Icons.notifications className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-red-500 text-white border-0 rounded-full"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 md:w-96 p-0 shadow-2xl rounded-xl border border-border/50">
        <div className="flex items-center justify-between border-b px-5 py-4 bg-muted/30">
          <p className="text-sm font-semibold tracking-tight text-foreground">Notifications</p>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 py-10 text-center gap-2">
              <Icons.notifications className="h-8 w-8 text-muted-foreground opacity-30" />
              <p className="text-sm font-medium text-foreground">You're all caught up!</p>
              <p className="text-xs text-muted-foreground">No new notifications right now.</p>
            </div>
          ) : (
            notifications.map(n => (
              <button
                key={n.id}
                onClick={() => !n.isRead && markRead(n.id)}
                className={cn(
                  'w-full text-left px-5 py-4 border-b last:border-b-0 transition-colors flex items-start gap-3',
                  n.isRead ? 'opacity-70 hover:bg-muted/30' : 'bg-primary/5 hover:bg-primary/10'
                )}
              >
                {!n.isRead && (
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary animate-pulse" />
                )}
                <div className={cn('flex-1', n.isRead && 'pl-5')}>
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm font-medium text-foreground/90">{n.title}</p>
                    <span className="text-[10px] font-medium text-muted-foreground/60 whitespace-nowrap pt-0.5">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                  {!n.isRead && (
                    <div className="flex items-center gap-2 mt-3">
                      <Button variant="primary" size="sm" className="h-7 text-[11px] px-3 shadow-none bg-primary/90 hover:bg-primary" onClick={(e) => { e.stopPropagation(); navigate('/dashboard')}}>View details</Button>
                      <Button variant="ghost" size="sm" className="h-7 text-[11px] px-3 text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); markRead(n.id)}}>Dismiss</Button>
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
