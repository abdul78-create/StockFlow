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
import { ApproveOrderDrawer } from './components/ApproveOrderDrawer';
import { SalesOrderTimeline } from './components/SalesOrderTimeline';
import { Separator } from '@/components/ui/separator';
import { SO_STATUS } from '@/lib/enums';


export function SalesOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: so, isLoading, error } = useSalesOrder(id!);
  const updateStatus = useUpdateSalesOrderStatus();
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);

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
                  <Button onClick={() => setIsApproveOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
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

                {validSo.status === 'SHIPPED' && (
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
                              {item.variant && (
                                <div className="text-xs text-muted-foreground mt-1 text-emerald-600">
                                  Variant: {item.variant.name} ({item.variant.sku})
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">${Number(item.unitPrice).toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              ${(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} className="text-right text-muted-foreground">Subtotal</TableCell>
                          <TableCell className="text-right">
                            ${(Number(validSo.totalAmount) - Number(validSo.shippingCost || 0) - Number(validSo.taxAmount || 0) + Number(validSo.discountAmount || 0)).toFixed(2)}
                          </TableCell>
                        </TableRow>
                        {Number(validSo.shippingCost) > 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-right text-muted-foreground">Shipping</TableCell>
                            <TableCell className="text-right">${Number(validSo.shippingCost).toFixed(2)}</TableCell>
                          </TableRow>
                        )}
                        {Number(validSo.taxAmount) > 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-right text-muted-foreground">Tax</TableCell>
                            <TableCell className="text-right">${Number(validSo.taxAmount).toFixed(2)}</TableCell>
                          </TableRow>
                        )}
                        {Number(validSo.discountAmount) > 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-right text-muted-foreground">Discount</TableCell>
                            <TableCell className="text-right text-destructive">-${Number(validSo.discountAmount).toFixed(2)}</TableCell>
                          </TableRow>
                        )}
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
                      <Badge variant={SO_STATUS[validSo.status]?.variant ?? 'outline'} className="mt-1">
                        {SO_STATUS[validSo.status]?.label ?? validSo.status}
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
                    {validSo.notes && (
                      <>
                        <Separator />
                        <div>
                          <div className="text-sm text-muted-foreground">Notes</div>
                          <div className="font-medium mt-1">{validSo.notes}</div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {isApproveOpen && (
              <ApproveOrderDrawer
                so={validSo}
                open={isApproveOpen}
                onOpenChange={setIsApproveOpen}
              />
            )}
            
            {isDispatchOpen && (
              <DispatchOrderDrawer
                so={validSo}
                open={isDispatchOpen}
                onOpenChange={setIsDispatchOpen}
              />
            )}
          </PageTemplate>
        );
      }}
    </QueryStateWrapper>
  );
}
