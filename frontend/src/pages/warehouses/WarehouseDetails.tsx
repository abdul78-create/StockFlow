import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWarehouse, useStockHealth, useInventoryBalances } from '@/lib/hooks/useInventory';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { QueryStateWrapper } from '@/components/ui/query-state-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, MapPin, Building2, TrendingDown, Package, AlertTriangle, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, RefreshCw, Box, Clock } from 'lucide-react';
import { WarehouseDrawer } from './WarehouseDrawer';
export function WarehouseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: warehouse, isLoading, error } = useWarehouse(id!);
  const { data: healthStats } = useStockHealth(id!);
  const { data: inventoryBalances } = useInventoryBalances({ warehouseId: id, limit: 10 });
  const [isEditDrawerOpen, setIsEditDrawerOpen] = React.useState(false);

  const columns: ColumnDef<any>[] = [
    {
      accessorFn: (row) => row.product?.name,
      id: 'productName',
      header: 'Product',
      cell: ({ row }) => <span className="font-medium">{row.original.product?.name}</span>,
    },
    {
      accessorFn: (row) => row.product?.sku,
      id: 'sku',
      header: 'SKU',
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => <span>{row.original.quantity}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const item = row.original;
        if (item.quantity === 0) {
          return <Badge variant="destructive">Out of Stock</Badge>;
        }
        if (item.quantity <= (item.product?.minimumStock || 0)) {
          return <Badge variant="outline" className="text-orange-600 border-orange-600">Low Stock</Badge>;
        }
        return <Badge variant="secondary">In Stock</Badge>;
      }
    }
  ];

  return (
    <QueryStateWrapper
      isLoading={isLoading}
      error={error}
      data={warehouse}
      isEmpty={(w) => !w}
      emptyProps={{
        title: "Warehouse Not Found",
        description: "The warehouse you are looking for doesn't exist.",
      }}
    >
      {(validWarehouse) => (
        <PageTemplate
          title={validWarehouse.name}
          subtitle="Warehouse Location and Inventory Overview"
          breadcrumbs={[
            { label: 'Warehouses', href: '/warehouses' },
            { label: validWarehouse.name, href: `/warehouses/${validWarehouse.id}` },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate('/warehouses')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button variant="outline" onClick={() => setIsEditDrawerOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Warehouse
              </Button>
            </div>
          }
        >
          <div className="grid gap-6 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthStats?.totalProducts || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-b from-card to-card/50 shadow-sm border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <TrendingDown className="h-4 w-4 text-primary/70" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${healthStats?.totalValue ? Number(healthStats.totalValue).toFixed(2) : '0.00'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-destructive">Out of Stock</CardTitle>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {healthStats?.outOfStockCount || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-orange-600">Low Stock</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {healthStats?.lowStockCount || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Location Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{validWarehouse.name}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{validWarehouse.location || 'No location provided'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Tabs defaultValue="inventory" className="w-full">
                <TabsList className="bg-muted/50 backdrop-blur-sm border border-border/50 w-full justify-start rounded-lg h-12 p-1">
                  <TabsTrigger value="inventory" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Current Inventory</TabsTrigger>
                  <TabsTrigger value="transactions" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Transactions</TabsTrigger>
                  <TabsTrigger value="capacity" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Capacity</TabsTrigger>
                  <TabsTrigger value="activity" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Activity Log</TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="mt-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Current Inventory</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => navigate('/inventory')}>
                        View All
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <DataTable
                        columns={columns}
                        data={inventoryBalances?.data || []}
                        searchKey="productName"
                        searchPlaceholder="Search products..."
                        emptyTitle="No inventory items found"
                        emptyDescription="This warehouse currently has no stock."
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="transactions" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg bg-muted/10">
                        <RefreshCw className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg">No Recent Transactions</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">No inventory movements have been recorded for this warehouse recently.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="capacity" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Capacity Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg bg-muted/10">
                        <Box className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg">Capacity Data Unavailable</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">Detailed capacity tracking has not been configured for this warehouse. Update warehouse settings to track capacity.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Warehouse Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg bg-muted/10">
                        <Clock className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg">No Activity Logged</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">Events and changes related to this warehouse will appear here.</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <WarehouseDrawer open={isEditDrawerOpen} onOpenChange={setIsEditDrawerOpen} warehouse={validWarehouse as any} />
        </PageTemplate>
      )}
    </QueryStateWrapper>
  );
}
