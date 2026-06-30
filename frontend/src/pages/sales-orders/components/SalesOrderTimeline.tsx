import { SalesOrder } from '@/lib/hooks/useSalesOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, FileText, Package, Truck, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface SalesOrderTimelineProps {
  so: SalesOrder;
}

export function SalesOrderTimeline({ so }: SalesOrderTimelineProps) {
  const isApproved = ['APPROVED', 'PACKED', 'DISPATCHED', 'DELIVERED'].includes(so.status);
  const isPacked = ['PACKED', 'DISPATCHED', 'DELIVERED'].includes(so.status);
  const isDispatched = ['DISPATCHED', 'DELIVERED'].includes(so.status);
  const isDelivered = so.status === 'DELIVERED';
  const isCancelled = so.status === 'CANCELLED';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fulfillment Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative border-l border-muted ml-3 space-y-6">
          
          {/* Draft Created */}
          <div className="relative pl-6">
            <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary ring-4 ring-background">
              <FileText className="h-3 w-3" />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Order Drafted</span>
              <span className="text-xs text-muted-foreground">{format(new Date(so.createdAt), 'PPpp')}</span>
            </div>
          </div>

          {/* Cancelled */}
          {isCancelled && (
            <div className="relative pl-6">
              <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-destructive/20 text-destructive ring-4 ring-background">
                <XCircle className="h-3 w-3" />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">Order Cancelled</span>
                <span className="text-xs text-muted-foreground">Order was cancelled and stock was released.</span>
              </div>
            </div>
          )}

          {/* Approved */}
          {!isCancelled && (
            <div className="relative pl-6">
              <span className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${isApproved ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {isApproved ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              </span>
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${!isApproved && 'text-muted-foreground'}`}>Order Approved</span>
                <span className="text-xs text-muted-foreground">
                  {isApproved ? 'Order was approved and stock was allocated' : 'Pending manager approval'}
                </span>
              </div>
            </div>
          )}

          {/* Dispatched */}
          {!isCancelled && (
            <div className="relative pl-6">
              <span className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${isDispatched ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {isDispatched ? <Truck className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              </span>
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${!isDispatched && 'text-muted-foreground'}`}>Dispatched</span>
                <span className="text-xs text-muted-foreground">
                  {isDispatched ? 'Order left the warehouse' : 'Awaiting dispatch'}
                </span>
              </div>
            </div>
          )}

          {/* Delivered */}
          {!isCancelled && (
            <div className="relative pl-6">
              <span className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${isDelivered ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {isDelivered ? <Package className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              </span>
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${!isDelivered && 'text-muted-foreground'}`}>Delivered</span>
                <span className="text-xs text-muted-foreground">
                  {isDelivered ? 'Order was delivered to customer' : 'Awaiting delivery'}
                </span>
              </div>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
}
