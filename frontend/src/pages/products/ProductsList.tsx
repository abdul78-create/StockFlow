import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { useProducts, useDeleteProduct } from '@/lib/hooks/useProducts';
import { Product } from '@/lib/types/product';
import { Icons } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { QueryStateWrapper } from '@/components/ui/query-state-wrapper';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ImportWizardDialog } from '@/components/ui/import/ImportWizardDialog';
import { ProductDrawer } from './components/ProductDrawer';
import { useKeyboardShortcut } from '@/lib/hooks/useKeyboardShortcut';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ProductsList() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useProducts({});
  const deleteMutation = useDeleteProduct();

  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState(false);
  const [isImportOpen, setIsImportOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<string | null>(null);

  useKeyboardShortcut('c', () => setIsCreateDrawerOpen(true));

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'ARCHIVED': return 'destructive';
      case 'DRAFT': return 'secondary';
      default: return 'outline';
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.sku}</span>,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'sellingPrice',
      header: 'Price',
      cell: ({ row }) => <span>${Number(row.original.sellingPrice).toFixed(2)}</span>,
    },
    {
      accessorKey: 'currentStock',
      header: 'Stock',
      cell: ({ row }) => {
        const stock = row.original.currentStock;
        const min = row.original.minimumStock;
        const isLow = stock <= min;
        return (
          <div className="flex items-center gap-2">
            <span>{stock}</span>
            {isLow && <Badge variant="warning" className="h-5 px-1.5 text-[10px]">Low</Badge>}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={getStatusBadgeVariant(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const product = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                <span className="sr-only">Open menu</span>
                <Icons.moreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                navigate(`/products/${product.id}`);
              }}>
                <Icons.view className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  setProductToDelete(product.id);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Icons.delete className="mr-2 h-4 w-4" /> Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => setIsCreateDrawerOpen(true)}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
          >
            <Icons.add className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <QueryStateWrapper
        isLoading={isLoading}
        error={error}
        data={data}
        isEmpty={(d) => !d.data || d.data.length === 0}
        emptyProps={{
          title: "No products found",
          description: "Get started by adding a new product to your inventory catalog.",
          action: {
            label: "Add First Product",
            icon: Icons.add,
            onClick: () => setIsCreateDrawerOpen(true)
          }
        }}
      >
        {(validData) => (
          <DataTable
            columns={columns}
            data={validData.data}
            searchKey="name"
            searchPlaceholder="Search products..."
            enableRowSelection={true}
            enableExport={true} enableImport={true} onImport={() => setIsImportOpen(true)}
            exportFilename="products-export.csv"
            onRowClick={(row) => navigate(`/products/${row.id}`)}
          />
        )}
      </QueryStateWrapper>

      <ProductDrawer 
        open={isCreateDrawerOpen} 
        onOpenChange={setIsCreateDrawerOpen} 
      />

      <ImportWizardDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        moduleName="products"
      />

      <ConfirmDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
        title="Archive Product"
        description="Are you sure you want to archive this product? It will be hidden from active views."
        onConfirm={async () => {
          if (productToDelete) {
            await deleteMutation.mutateAsync(productToDelete);
            setProductToDelete(null);
          }
        }}
        confirmLabel="Archive"
        variant="destructive"
      />
    </div>
  );
}
