import { useParams, useNavigate } from 'react-router-dom';
import { useWarehouse, useStockHealth, useInventoryBalances } from '@/lib/hooks/useInventory';
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
import { ArrowLeft, MapPin, Building2, TrendingDown, Package, AlertTriangle, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function WarehouseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: warehouse, isLoading, error } = useWarehouse(id!);
  const { data: healthStats } = useStockHealth(id!);
  const { data: inventoryBalances } = useInventoryBalances({ warehouseId: id, limit: 10 });

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
            <Button variant="outline" onClick={() => navigate('/warehouses')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
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
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Current Inventory</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => navigate('/inventory')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryBalances?.data && inventoryBalances.data.length > 0 ? (
                        inventoryBalances.data.map((item: any) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.product.name}</TableCell>
                            <TableCell>{item.product.sku}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">
                              {item.quantity === 0 ? (
                                <Badge variant="destructive">Out of Stock</Badge>
                              ) : item.quantity <= item.product.minimumStock ? (
                                <Badge variant="outline" className="text-orange-600 border-orange-600">Low Stock</Badge>
                              ) : (
                                <Badge variant="secondary">In Stock</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            No inventory items found in this warehouse.
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
