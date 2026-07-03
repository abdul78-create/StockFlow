import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct, useDeleteProduct } from '@/lib/hooks/useProducts';
import { Icons } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Timeline } from '@/components/ui/timeline';
import { QueryStateWrapper } from '@/components/ui/query-state-wrapper';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ProductDrawer } from './components/ProductDrawer';
import { ProductVariantsTab } from './components/ProductVariantsTab';
import { ProductSuppliersTab } from './components/ProductSuppliersTab';
import { ProductUOMTab } from './components/ProductUOMTab';
import { ProductBundlesTab } from './components/ProductBundlesTab';
import { ProductImagesTab } from './components/ProductImagesTab';


export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useProduct(id);
  const deleteMutation = useDeleteProduct();

  const [isEditDrawerOpen, setIsEditDrawerOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  const handleDelete = async (productToDelete: any) => {
    await deleteMutation.mutateAsync(productToDelete.id);
    navigate('/products');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'ARCHIVED': return 'destructive';
      case 'DRAFT': return 'secondary';
      default: return 'outline';
    }
  };


  return (
    <QueryStateWrapper
      isLoading={isLoading}
      error={error}
      data={product}
      isEmpty={(p) => !p}
      emptyProps={{
        title: "Product Not Found",
        description: "The product you're looking for doesn't exist or was removed.",
      }}
    >
      {(validProduct: any) => (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/products')}>
                <Icons.chevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-3xl font-bold tracking-tight">{validProduct.name}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-muted-foreground text-sm font-mono">{validProduct.sku}</span>
                  <Badge variant={getStatusBadgeVariant(validProduct.status)}>{validProduct.status}</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setIsEditDrawerOpen(true)}>
                <Icons.edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                <Icons.delete className="mr-2 h-4 w-4" /> Archive
              </Button>
            </div>
          </div>

          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details">Overview</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
              <TabsTrigger value="bundles">Bundles</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
              <TabsTrigger value="uom">UOM</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pricing</CardTitle>
                    <Icons.products className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${Number(validProduct.sellingPrice).toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      Cost: ${Number(validProduct.costPrice).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
                    <Icons.inventory className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{validProduct.currentStock}</div>
                    <p className="text-xs text-muted-foreground">
                      Min: {validProduct.minimumStock} | Max: {validProduct.maximumStock}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                      <dd className="mt-1 text-sm">{validProduct.description || 'No description provided.'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Barcode</dt>
                      <dd className="mt-1 text-sm font-mono">{validProduct.barcode || 'N/A'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="variants" className="space-y-4">
              <ProductVariantsTab product={validProduct} />
            </TabsContent>
            <TabsContent value="bundles" className="space-y-4">
              <ProductBundlesTab product={validProduct} />
            </TabsContent>
            <TabsContent value="images" className="space-y-4">
              <ProductImagesTab product={validProduct} />
            </TabsContent>
            <TabsContent value="suppliers" className="space-y-4">
              <ProductSuppliersTab product={validProduct} />
            </TabsContent>
            <TabsContent value="uom" className="space-y-4">
              <ProductUOMTab product={validProduct} />
            </TabsContent>
</Tabs>

          <ProductDrawer 
            open={isEditDrawerOpen} 
            onOpenChange={setIsEditDrawerOpen} 
            product={validProduct} 
          />

          <ConfirmDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title="Archive Product"
            description={`Are you sure you want to archive ${validProduct.name}? This will hide it from active inventory.`}
            onConfirm={() => handleDelete(validProduct)}
            confirmLabel="Archive"
            variant="destructive"
          />
        </div>
      )}
    </QueryStateWrapper>
  );
}
