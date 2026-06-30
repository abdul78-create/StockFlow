import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSalesOrder, useUpdateSalesOrderStatus } from '@/lib/hooks/useSalesOrders';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { QueryStateWrapper } from '@/components/ui/query-state-wrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Truck, ArrowLeft } from 'lucide-react';
import { DispatchOrderDrawer } from './components/DispatchOrderDrawer';
import { SalesOrderTimeline } from './components/SalesOrderTimeline';
import { Separator } from '@/components/ui/separator';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  PENDING: 'outline',
  APPROVED: 'default',
  PACKED: 'default',
  DISPATCHED: 'default',
  DELIVERED: 'default',
  CANCELLED: 'destructive',
};

export function SalesOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: so, isLoading, error } = useSalesOrder(id!);
  const updateStatus = useUpdateSalesOrderStatus();
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);

  const handleApprove = (validSo: any) => {
    updateStatus.mutate({ id: validSo.id, status: 'APPROVED' });
  };

  const handleCancel = (validSo: any) => {
    updateStatus.mutate({ id: validSo.id, status: 'CANCELLED' });
  };

  const handleDeliver = (validSo: any) => {
    updateStatus.mutate({ id: validSo.id, status: 'DELIVERED' });
  };

  return (
    <QueryStateWrapper
      isLoading={isLoading}
      error={error}
      data={so}
      isEmpty={(p) => !p}
      emptyProps={{
        title: "Order Not Found",
        description: "The sales order you're looking for doesn't exist.",
      }}
    >
      {(validSo) => {
        const isDispatchable = validSo.status === 'APPROVED' || validSo.status === 'PACKED';

        return (
          <PageTemplate
            title={`Sales Order ${validSo.soNumber}`}
            subtitle={`Manage order for ${validSo.customer?.name}`}
            breadcrumbs={[
              { label: 'Sales Orders', href: '/sales-orders' },
              { label: validSo.soNumber, href: `/sales-orders/${validSo.id}` },
            ]}
            actions={
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => navigate('/sales-orders')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                {validSo.status === 'DRAFT' && (
                  <Button onClick={() => handleApprove(validSo)} className="bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Order
                  </Button>
                )}

                {isDispatchable && (
                  <Button onClick={() => setIsDispatchOpen(true)}>
                    <Truck className="h-4 w-4 mr-2" />
                    Dispatch Goods
                  </Button>
                )}

                {validSo.status === 'DISPATCHED' && (
                  <Button onClick={() => handleDeliver(validSo)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Delivered
                  </Button>
                )}

                {(validSo.status === 'DRAFT' || validSo.status === 'PENDING') && (
                  <Button variant="destructive" onClick={() => handleCancel(validSo)}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            }
          >
            <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Qty Ordered</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validSo.items.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.product?.name}
                              <div className="text-xs text-muted-foreground">{item.product?.sku}</div>
                            </TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">${Number(item.unitPrice).toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              ${(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-bold">Grand Total</TableCell>
                          <TableCell className="text-right font-bold">${Number(validSo.totalAmount).toFixed(2)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                <SalesOrderTimeline so={validSo} />
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Status</div>
                      <Badge variant={statusColors[validSo.status] || 'default'} className="mt-1">
                        {validSo.status}
                      </Badge>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-muted-foreground">Customer</div>
                      <div className="font-medium mt-1">{validSo.customer?.name}</div>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-muted-foreground">Created At</div>
                      <div className="font-medium mt-1">{format(new Date(validSo.createdAt), 'PPpp')}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <DispatchOrderDrawer
              so={validSo}
              open={isDispatchOpen}
              onOpenChange={setIsDispatchOpen}
            />
          </PageTemplate>
        );
      }}
    </QueryStateWrapper>
  );
}
