import * as React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { DashboardMetrics } from '@/lib/hooks/useDashboard';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, UserPlus } from 'lucide-react';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400',
  'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
  'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
  'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
];

export function RecentCustomersPanel({ metrics }: { metrics: DashboardMetrics }) {
  const customers = metrics.recentCustomers ?? [];

  return (
    <div className="col-span-full lg:col-span-1 rounded-xl border border-border/60 bg-card">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent Customers</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Newest registered clients</p>
        </div>
        <Link
          to="/customers"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="px-4 pb-4">
        {customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
            <UserPlus className="h-8 w-8 opacity-20" />
            <p className="text-sm font-medium">No customers yet</p>
            <Link to="/customers/new" className="text-xs text-primary hover:underline flex items-center gap-1">
              Add your first customer <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {customers.map((customer, idx) => (
              <Link
                key={customer.id}
                to={`/customers/${customer.id}`}
                className="group flex items-center gap-3 rounded-lg p-2 -mx-2 hover:bg-muted/40 transition-colors"
              >
                {/* Avatar */}
                <div className={cn(
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold',
                  AVATAR_COLORS[idx % AVATAR_COLORS.length]
                )}>
                  {getInitials(customer.name)}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {customer.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {customer.email ?? 'No email'}
                  </p>
                </div>

                {/* Time */}
                <span className="text-[11px] text-muted-foreground flex-shrink-0">
                  {formatDistanceToNow(new Date(customer.createdAt), { addSuffix: true })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
