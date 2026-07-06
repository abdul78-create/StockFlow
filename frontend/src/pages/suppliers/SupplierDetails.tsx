import { useParams, useNavigate } from 'react-router-dom';
import { useSupplier, useSupplierStats } from '@/lib/hooks/useSuppliers';
import { usePurchaseOrders } from '@/lib/hooks/usePurchaseOrders';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { QueryStateWrapper } from '@/components/ui/query-state-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ArrowLeft, Mail, Phone, MapPin, Building2, TrendingDown, ShoppingCart, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PO_STATUS } from '@/lib/enums';


export function SupplierDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: supplier, isLoading, error } = useSupplier(id!);
  const { data: stats } = useSupplierStats(id!);
  const { data: purchaseOrdersData } = usePurchaseOrders({ supplierId: id, limit: 10 });

  return (
    <QueryStateWrapper
      isLoading={isLoading}
      error={error}
      data={supplier}
      isEmpty={(s) => !s}
      emptyProps={{
        title: "Supplier Not Found",
        description: "The supplier you are looking for doesn't exist.",
      }}
    >
      {(validSupplier) => (
        <PageTemplate
          title={validSupplier.companyName}
          subtitle="Supplier Profile and History"
          breadcrumbs={[
            { label: 'Suppliers', href: '/suppliers' },
            { label: validSupplier.companyName, href: `/suppliers/${validSupplier.id}` },
          ]}
          actions={
            <Button variant="outline" onClick={() => navigate('/suppliers')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          }
        >
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats?.totalSpend ? Number(stats.totalSpend).toFixed(2) : '0.00'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Last Order</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.lastOrderDate ? format(new Date(stats.lastOrderDate), 'MMM d, yyyy') : 'Never'}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{validSupplier.companyName}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{validSupplier.email || 'No email provided'}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{validSupplier.phone || 'No phone provided'}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{validSupplier.address || 'No address provided'}</span>
                  </div>
                  <Separator />
                  <div className="text-sm text-muted-foreground mt-4">
                    Supplier since {format(new Date(validSupplier.createdAt), 'MMMM yyyy')}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Purchase Orders</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => navigate('/purchase-orders/new')}>
                    New PO
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseOrdersData?.data && purchaseOrdersData.data.length > 0 ? (
                        purchaseOrdersData.data.map((order: any) => (
                          <TableRow 
                            key={order.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate(`/purchase-orders/${order.id}`)}
                          >
                            <TableCell className="font-medium text-blue-600">{order.poNumber}</TableCell>
                            <TableCell>{format(new Date(order.createdAt), 'MMM d, yyyy')}</TableCell>
                            <TableCell>
                                <Badge variant={PO_STATUS[order.status]?.variant ?? 'outline'}>
                                  {PO_STATUS[order.status]?.label ?? order.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">${Number(order.totalAmount).toFixed(2)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            No purchase orders found for this supplier.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </PageTemplate>
      )}
    </QueryStateWrapper>
  );
}
