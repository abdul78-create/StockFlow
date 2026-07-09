import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { useProducts, useDeleteProduct } from '@/lib/hooks/useProducts';
import { useCategories } from '@/lib/hooks/useCategories';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export function ProductsList() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = React.useState('ALL');
  const [selectedCategory, setSelectedCategory] = React.useState('ALL');
  const [selectedStockStatus, setSelectedStockStatus] = React.useState('ALL');
  const [bulkConfirmOpen, setBulkConfirmOpen] = React.useState(false);
  const [selectedBulkRows, setSelectedBulkRows] = React.useState<Product[]>([]);

  // Map view to status
  const viewStatusMap: Record<string, string | undefined> = {
    'ALL': undefined,
    'ACTIVE': 'ACTIVE',
    'ARCHIVED': 'ARCHIVED',
    'DRAFT': 'DRAFT',
  };

  const { data, isLoading, error } = useProducts({
    status: viewStatusMap[activeView],
    categoryId: selectedCategory === 'ALL' ? undefined : selectedCategory,
    limit: 100, // Fetch more for local filtering if needed
  });
  
  const { data: categories } = useCategories();
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
      header: 'Product Name',
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-foreground">{row.original.name}</span>
          {(row.original as any).category && (
            <div className="text-xs text-muted-foreground mt-0.5">{(row.original as any).category.name}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'sellingPrice',
      header: 'Selling Price',
      cell: ({ row }) => <span>${Number(row.original.sellingPrice).toFixed(2)}</span>,
    },
    {
      accessorKey: 'currentStock',
      header: 'Stock Level',
      cell: ({ row }) => {
        const stock = row.original.currentStock;
        const min = row.original.minimumStock;
        const isLow = stock <= min && stock > 0;
        const isOut = stock === 0;
        return (
          <div className="flex items-center gap-2">
            <span className={isOut ? "text-destructive font-medium" : ""}>{stock}</span>
            {isOut ? (
              <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">Out of Stock</Badge>
            ) : isLow ? (
              <Badge variant="warning" className="h-5 px-1.5 text-[10px]">Low Stock</Badge>
            ) : null}
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
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                navigate(`/products/${product.id}`);
              }}>
                <Icons.edit className="mr-2 h-4 w-4" /> Edit Product
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

  const filteredData = React.useMemo(() => {
    if (!data?.data) return [];
    let result = data.data;

    if (selectedStockStatus !== 'ALL') {
      result = result.filter(p => {
        if (selectedStockStatus === 'LOW_STOCK') return p.currentStock > 0 && p.currentStock <= p.minimumStock;
        if (selectedStockStatus === 'OUT_OF_STOCK') return p.currentStock === 0;
        if (selectedStockStatus === 'IN_STOCK') return p.currentStock > p.minimumStock;
        return true;
      });
    }

    return result;
  }, [data, selectedStockStatus]);

  const handleBulkArchive = async () => {
    if (selectedBulkRows.length === 0) return;
    try {
      await Promise.all(selectedBulkRows.map(row => deleteMutation.mutateAsync(row.id)));
      toast.success(`Successfully archived ${selectedBulkRows.length} products`);
    } catch (e) {
      toast.error('Failed to archive some products');
    } finally {
      setBulkConfirmOpen(false);
      setSelectedBulkRows([]);
    }
  };

  const advancedFilters = (
    <div className="flex items-center gap-2">
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className="w-[160px] h-9">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Categories</SelectItem>
          {categories?.map(c => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedStockStatus} onValueChange={setSelectedStockStatus}>
        <SelectTrigger className="w-[160px] h-9">
          <SelectValue placeholder="Stock Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Any Stock Status</SelectItem>
          <SelectItem value="IN_STOCK">In Stock</SelectItem>
          <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
          <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const bulkActions = (selectedRows: Product[]) => (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => {
        setSelectedBulkRows(selectedRows);
        setBulkConfirmOpen(true);
      }}
      className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
    >
      <Icons.delete className="mr-2 h-4 w-4" /> Archive Selected ({selectedRows.length})
    </Button>
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your product catalog, variants, and stock levels.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setIsImportOpen(true)}>
            <Icons.upload className="mr-2 h-4 w-4" /> Import
          </Button>
          <Button 
            onClick={() => setIsCreateDrawerOpen(true)}
            className="bg-primary hover:bg-primary/90 shadow-sm"
          >
            <Icons.add className="mr-2 h-4 w-4" /> Add Product
            <kbd className="ml-2 hidden rounded bg-primary-foreground/20 px-1.5 text-[10px] font-medium sm:inline-block">C</kbd>
          </Button>
        </div>
      </div>

      <div className="border-b pt-2 pb-0">
        <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
          <TabsList className="bg-transparent border-b-0 p-0 h-auto gap-4">
            <TabsTrigger 
              value="ALL" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-3 pt-2"
            >
              All Products
            </TabsTrigger>
            <TabsTrigger 
              value="ACTIVE" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-3 pt-2"
            >
              Active
            </TabsTrigger>
            <TabsTrigger 
              value="DRAFT" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-3 pt-2"
            >
              Drafts
            </TabsTrigger>
            <TabsTrigger 
              value="ARCHIVED" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-3 pt-2"
            >
              Archived
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <QueryStateWrapper
        isLoading={isLoading}
        error={error}
        data={{ data: filteredData }} // wrap for QueryStateWrapper expectations
        isEmpty={() => filteredData.length === 0}
        emptyProps={{
          title: "No products found",
          description: "Get started by adding a new product or adjust your filters.",
          action: {
            label: "Add Product",
            icon: Icons.add,
            onClick: () => setIsCreateDrawerOpen(true)
          }
        }}
      >
        {() => (
          <DataTable
            columns={columns}
            data={filteredData}
            searchKey="name"
            searchPlaceholder="Search products by name or SKU..."
            enableRowSelection={true}
            enableExport={true}
            exportFilename={`products-export-${new Date().toISOString().split('T')[0]}.csv`}
            onRowClick={(row) => navigate(`/products/${row.id}`)}
            advancedFilters={advancedFilters}
            bulkActions={bulkActions}
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

      <ConfirmDialog
        open={bulkConfirmOpen}
        onOpenChange={setBulkConfirmOpen}
        title="Bulk Archive Products"
        description={`Are you sure you want to archive ${selectedBulkRows.length} selected products?`}
        onConfirm={handleBulkArchive}
        confirmLabel="Archive All"
        variant="destructive"
      />
    </div>
  );
}

