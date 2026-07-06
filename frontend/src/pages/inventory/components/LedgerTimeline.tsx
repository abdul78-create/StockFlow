import * as React from 'react';
import { useInventoryHistory } from '@/lib/hooks/useInventory';
import { Timeline, TimelineEvent } from '@/components/ui/timeline';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { TXN_TYPE } from '@/lib/enums';


interface LedgerTimelineProps {
  warehouseId?: string;
}

export function LedgerTimeline({ warehouseId }: LedgerTimelineProps) {
  const { data, isLoading, isError, refetch } = useInventoryHistory({ warehouseId, limit: 10 });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState message="Failed to load ledger history." onRetry={() => refetch()} />;
  }

  if (!data || data.data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No recent activity.</p>;
  }

  const events: TimelineEvent[] = data.data.map(txn => {
    let status: TimelineEvent['status'] = 'default';
    let icon: TimelineEvent['icon'] = 'info';

    // Map transaction types to visual indicators
    if (txn.quantity > 0) {
      status = 'success';
      icon = 'add';
    } else if (txn.quantity < 0) {
      if (['DAMAGE', 'EXPIRED'].includes(txn.type)) {
        status = 'error';
        icon = 'warning';
      } else {
        status = 'default';
        icon = 'trendDown'; // outbound
      }
    }

    if (txn.type === 'TRANSFER') {
      icon = 'refresh';
    }

    const title = (
      <div className="flex justify-between items-center w-full">
        <span>{txn.inventory?.product?.name || 'Unknown'}</span>
        <span className={status === 'success' ? 'text-success' : status === 'error' ? 'text-destructive' : 'text-foreground font-medium'}>
          {txn.quantity > 0 ? `+${txn.quantity}` : txn.quantity}
        </span>
      </div>
    );

    return {
      id: txn.id,
      title: `${TXN_TYPE[txn.type] ?? txn.type} (${txn.quantity > 0 ? '+' : ''}${txn.quantity})`,
      description: `${txn.inventory?.product?.name || 'Unknown'} at ${txn.inventory?.warehouse?.name || 'Unknown'}`,
      date: new Date(txn.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      icon,
      status,
    };
  });

  return (
    <div className="pr-4 h-[400px] overflow-y-auto custom-scrollbar">
      <Timeline events={events} />
    </div>
  );
}
