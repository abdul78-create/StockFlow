import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePurchaseOrder, useUpdatePurchaseOrderStatus } from '@/lib/hooks/usePurchaseOrders';
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
import { CheckCircle, XCircle, Box, ArrowLeft } from 'lucide-react';
import { ReceiveGoodsDrawer } from './components/ReceiveGoodsDrawer';
import { PurchaseOrderTimeline } from './components/PurchaseOrderTimeline';
import { Separator } from '@/components/ui/separator';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  PENDING: 'outline',
  APPROVED: 'default',
  COMPLETED: 'default',
  CANCELLED: 'destructive',
};

export function PurchaseOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: po, isLoading, error } = usePurchaseOrder(id!);
  const updateStatus = useUpdatePurchaseOrderStatus();
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);

  const handleApprove = (validPo: any) => {
    updateStatus.mutate({ id: validPo.id, status: 'APPROVED' });
  };

  const handleCancel = (validPo: any) => {
    updateStatus.mutate({ id: validPo.id, status: 'CANCELLED' });
  };

  return (
    <QueryStateWrapper
      isLoading={isLoading}
      error={error}
      data={po}
      isEmpty={(p) => !p}
      emptyProps={{
        title: "Order Not Found",
        description: "The purchase order you're looking for doesn't exist.",
      }}
    >
      {(validPo) => {
        const isReceivable = validPo.status === 'APPROVED' && validPo.items.some(
          (item: any) => item.quantity > (item.receivedQuantity || 0)
        );

        return (
          <PageTemplate
            title={`Purchase Order ${validPo.poNumber}`}
            subtitle={`Manage order from ${validPo.supplier?.companyName}`}
            breadcrumbs={[
              { label: 'Purchase Orders', href: '/purchase-orders' },
              { label: validPo.poNumber, href: `/purchase-orders/${validPo.id}` },
            ]}
            actions={
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => navigate('/purchase-orders')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                {validPo.status === 'DRAFT' && (
                  <Button onClick={() => handleApprove(validPo)} className="bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Order
                  </Button>
                )}

                {isReceivable && (
                  <Button onClick={() => setIsReceiveOpen(true)}>
                    <Box className="h-4 w-4 mr-2" />
                    Receive Goods
                  </Button>
                )}

                {(validPo.status === 'DRAFT' || validPo.status === 'PENDING') && (
                  <Button variant="destructive" onClick={() => handleCancel(validPo)}>
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
                          <TableHead className="text-right">Qty Received</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validPo.items.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              {item.product?.name}
                              <div className="text-xs text-muted-foreground">{item.product?.sku}</div>
                              {item.variant && (
                                <div className="text-xs text-muted-foreground mt-1 text-emerald-600">
                                  Variant: {item.variant.name} ({item.variant.sku})
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">{item.receivedQuantity || 0}</TableCell>
                            <TableCell className="text-right">${Number(item.unitPrice).toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              ${(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={4} className="text-right font-bold">Grand Total</TableCell>
                          <TableCell className="text-right font-bold">${Number(validPo.totalAmount).toFixed(2)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                <PurchaseOrderTimeline po={validPo} />
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Status</div>
                      <Badge variant={statusColors[validPo.status] || 'default'} className="mt-1">
                        {validPo.status}
                      </Badge>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-muted-foreground">Supplier</div>
                      <div className="font-medium mt-1">{validPo.supplier?.companyName}</div>
                    </div>
                    <Separator />
                    <div>
                      <div className="text-sm text-muted-foreground">Created At</div>
                      <div className="font-medium mt-1">{format(new Date(validPo.createdAt), 'PPpp')}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <ReceiveGoodsDrawer
              po={validPo}
              open={isReceiveOpen}
              onOpenChange={setIsReceiveOpen}
            />
          </PageTemplate>
        );
      }}
    </QueryStateWrapper>
  );
}
