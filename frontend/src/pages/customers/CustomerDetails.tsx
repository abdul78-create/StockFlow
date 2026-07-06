import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer, useCustomerStats } from '@/lib/hooks/useCustomers';
import { useSalesOrders } from '@/lib/hooks/useSalesOrders';
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
import { ArrowLeft, Mail, Phone, MapPin, Building2, TrendingUp, ShoppingCart, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { SO_STATUS } from '@/lib/enums';


export function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: customer, isLoading, error } = useCustomer(id!);
  const { data: stats } = useCustomerStats(id!);
  const { data: salesOrdersData } = useSalesOrders({ customerId: id, limit: 10 });

  return (
    <QueryStateWrapper
      isLoading={isLoading}
      error={error}
      data={customer}
      isEmpty={(c) => !c}
      emptyProps={{
        title: "Customer Not Found",
        description: "The customer you are looking for doesn't exist.",
      }}
    >
      {(validCustomer) => (
        <PageTemplate
          title={validCustomer.name}
          subtitle="Customer Profile and History"
          breadcrumbs={[
            { label: 'Customers', href: '/customers' },
            { label: validCustomer.name, href: `/customers/${validCustomer.id}` },
          ]}
          actions={
            <Button variant="outline" onClick={() => navigate('/customers')}>
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
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats?.totalRevenue ? Number(stats.totalRevenue).toFixed(2) : '0.00'}
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
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{validCustomer.email || 'No email provided'}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{validCustomer.phone || 'No phone provided'}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>GST: {validCustomer.gst || 'N/A'}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{validCustomer.address || 'No address provided'}</span>
                  </div>
                  <Separator />
                  <div className="text-sm text-muted-foreground mt-4">
                    Customer since {format(new Date(validCustomer.createdAt), 'MMMM yyyy')}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Sales Orders</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => navigate('/sales-orders/new')}>
                    New Order
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
                      {salesOrdersData?.data && salesOrdersData.data.length > 0 ? (
                        salesOrdersData.data.map((order) => (
                          <TableRow 
                            key={order.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate(`/sales-orders/${order.id}`)}
                          >
                            <TableCell className="font-medium text-emerald-600">{order.soNumber}</TableCell>
                            <TableCell>{format(new Date(order.createdAt), 'MMM d, yyyy')}</TableCell>
                            <TableCell>
                              <Badge variant={SO_STATUS[order.status]?.variant ?? 'outline'}>
                                {SO_STATUS[order.status]?.label ?? order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">${Number(order.totalAmount).toFixed(2)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            No sales orders found for this customer.
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
