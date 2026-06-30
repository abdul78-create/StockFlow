import { PurchaseOrder } from '@/lib/hooks/usePurchaseOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, FileText, Package, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface PurchaseOrderTimelineProps {
  po: PurchaseOrder;
}

export function PurchaseOrderTimeline({ po }: PurchaseOrderTimelineProps) {
  const isApproved = po.status === 'APPROVED' || po.status === 'COMPLETED';
  const isCompleted = po.status === 'COMPLETED';
  const isCancelled = po.status === 'CANCELLED';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
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
              <span className="text-xs text-muted-foreground">{format(new Date(po.createdAt), 'PPpp')}</span>
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
                <span className="text-xs text-muted-foreground">Order was cancelled and will not be fulfilled.</span>
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
                  {isApproved ? 'Order was approved for fulfillment' : 'Pending manager approval'}
                </span>
              </div>
            </div>
          )}

          {/* Received */}
          {!isCancelled && (
            <div className="relative pl-6">
              <span className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${isCompleted ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {isCompleted ? <Package className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              </span>
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${!isCompleted && 'text-muted-foreground'}`}>Goods Received</span>
                <span className="text-xs text-muted-foreground">
                  {isCompleted ? 'All items have been received into inventory' : 'Awaiting inbound delivery'}
                </span>
              </div>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
}
