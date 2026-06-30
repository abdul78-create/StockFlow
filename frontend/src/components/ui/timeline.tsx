import * as React from 'react';
import { cn } from '@/lib/utils';
import { Icons } from '@/lib/icons';

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  icon?: keyof typeof Icons;
  status?: 'default' | 'success' | 'warning' | 'error';
}

export interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn('relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent', className)}>
      {events.map((event, index) => {
        const Icon = event.icon ? Icons[event.icon] : Icons.info;
        
        const statusColors = {
          default: 'bg-muted text-muted-foreground border-border',
          success: 'bg-success/10 text-success border-success/20',
          warning: 'bg-warning/10 text-warning border-warning/20',
          error: 'bg-destructive/10 text-destructive border-destructive/20',
        };

        const colorClass = statusColors[event.status || 'default'];

        return (
          <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Icon marker */}
            <div className={cn("flex items-center justify-center w-10 h-10 rounded-full border-2 bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10", colorClass)}>
              <Icon className="w-4 h-4" />
            </div>
            
            {/* Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border bg-card shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                <h4 className="font-semibold text-sm">{event.title}</h4>
                <time className="text-xs text-muted-foreground">{event.date}</time>
              </div>
              {event.description && (
                <p className="text-sm text-muted-foreground">{event.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
