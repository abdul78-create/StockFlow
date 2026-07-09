import { useParams, useNavigate } from 'react-router-dom';
import { useSupplier, useSupplierStats } from '@/lib/hooks/useSuppliers';
import { usePurchaseOrders } from '@/lib/hooks/usePurchaseOrders';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { QueryStateWrapper } from '@/components/ui/query-state-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import * as React from 'react';
import { format } from 'date-fns';
import { ArrowLeft, Mail, Phone, MapPin, Building2, TrendingDown, ShoppingCart, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PO_STATUS } from '@/lib/enums';
import { Edit } from 'lucide-react';
import { Icons } from '@/lib/icons'; import { FileText, Clock } from 'lucide-react';
import { SupplierDrawer } from './SupplierDrawer';


export function SupplierDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: supplier, isLoading, error } = useSupplier(id!);
  const { data: stats } = useSupplierStats(id!);
  const { data: purchaseOrdersData } = usePurchaseOrders({ supplierId: id, limit: 10 });
  const [isEditDrawerOpen, setIsEditDrawerOpen] = React.useState(false);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'poNumber',
      header: 'Order #',
      cell: ({ row }) => <span className="font-medium text-blue-600">{row.original.poNumber}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => <span>{format(new Date(row.original.createdAt), 'MMM d, yyyy')}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={PO_STATUS[row.original.status]?.variant ?? 'outline'}>
          {PO_STATUS[row.original.status]?.label ?? row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }) => <span>${Number(row.original.totalAmount).toFixed(2)}</span>,
    }
  ];

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
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/suppliers')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button variant="outline" onClick={() => setIsEditDrawerOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Supplier
              </Button>
            </div>
          }
        >
          <div className="grid gap-6 md:grid-cols-4 mb-6">
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
            <Card className="bg-gradient-to-b from-card to-card/50 shadow-sm border-primary/10">
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
            <Card className="bg-gradient-to-b from-card to-card/50 shadow-sm border-orange-500/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Bills</CardTitle>
                <TrendingDown className="h-4 w-4 text-orange-500/70" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  $0.00
                </div>
                <p className="text-xs text-muted-foreground mt-1">Pending payments</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_2.5fr]">
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
              <Tabs defaultValue="orders" className="w-full">
                <TabsList className="bg-muted/50 backdrop-blur-sm border border-border/50 w-full justify-start rounded-lg h-12 p-1">
                  <TabsTrigger value="orders" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Purchase Orders</TabsTrigger>
                  <TabsTrigger value="bills" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Bills</TabsTrigger>
                  <TabsTrigger value="activity" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Activity Log</TabsTrigger>
                </TabsList>
                
                <TabsContent value="orders" className="mt-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Recent Purchase Orders</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => navigate('/purchase-orders/new')}>
                        New PO
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <DataTable
                        columns={columns}
                        data={purchaseOrdersData?.data || []}
                        searchKey="poNumber"
                        searchPlaceholder="Search orders..."
                        emptyTitle="No purchase orders found"
                        emptyDescription="This supplier has no associated purchase orders."
                        onRowClick={(row) => navigate(`/purchase-orders/${row.id}`)}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="bills" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Bills & Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg bg-muted/10">
                        <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg">No Bills</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">This supplier doesn't have any generated bills yet. Receive items from a purchase order to generate a bill.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Supplier Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg bg-muted/10">
                        <Clock className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg">No Recent Activity</h3>
                        <p className="text-sm text-muted-foreground mt-1">Actions performed by or for this supplier will appear here.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <SupplierDrawer open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen} supplier={validSupplier} />
        </PageTemplate>
      )}
    </QueryStateWrapper>
  );
}



