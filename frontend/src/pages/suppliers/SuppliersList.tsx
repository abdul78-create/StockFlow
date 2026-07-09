import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { Supplier } from '@/lib/types/supplier';
import { Icons } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { QueryStateWrapper } from '@/components/ui/query-state-wrapper';
import { SupplierDrawer } from './SupplierDrawer';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export function SuppliersList() {
  const { data, isLoading, error } = useSuppliers({});
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState(false);
  const [activeView, setActiveView] = React.useState('ALL');

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: 'companyName',
      header: 'Company Name',
      cell: ({ row }) => (
        <Link to={`/suppliers/${row.original.id}`} className="font-medium text-blue-600 hover:underline">
          {row.original.companyName}
        </Link>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.email || '-'}</span>,
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.phone || '-'}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Date Added',
      cell: ({ row }) => <span>{format(new Date(row.original.createdAt), 'MMM d, yyyy')}</span>,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <Icons.moreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/suppliers/${row.original.id}`}>
                  <Icons.view className="mr-2 h-4 w-4" /> View Details
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    let result = data;
    if (activeView === 'RECENT') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      result = result.filter(s => new Date(s.createdAt) >= thirtyDaysAgo);
    }
    return result;
  }, [data, activeView]);

  const bulkActions = (selectedRows: Supplier[]) => (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => toast.info(`Bulk actions not implemented for ${selectedRows.length} suppliers yet.`)}
    >
      <Icons.settings className="mr-2 h-4 w-4" /> Actions ({selectedRows.length})
    </Button>
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Suppliers</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your vendors and purchasing contacts.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsCreateDrawerOpen(true)} className="bg-primary hover:bg-primary/90 shadow-sm">
            <Icons.add className="mr-2 h-4 w-4" /> Add Supplier
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
              All Suppliers
            </TabsTrigger>
            <TabsTrigger 
              value="RECENT" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-3 pt-2"
            >
              Recently Added
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <QueryStateWrapper
        isLoading={isLoading}
        error={error}
        data={filteredData}
        isEmpty={(d) => !d || d.length === 0}
        emptyProps={{
          title: "No suppliers found",
          description: "Get started by adding a new supplier to your network.",
          action: {
            label: "Add Supplier",
            icon: Icons.add,
            onClick: () => setIsCreateDrawerOpen(true)
          }
        }}
      >
        {(validData) => (
          <DataTable
            columns={columns}
            data={validData}
            searchKey="companyName"
            searchPlaceholder="Search suppliers by company name..."
            enableRowSelection={true}
            enableExport={true}
            enableImport={true}
            onImport={() => console.log('Importing')}
            bulkActions={bulkActions}
          />
        )}
      </QueryStateWrapper>

      <SupplierDrawer 
        open={isCreateDrawerOpen} 
        onOpenChange={setIsCreateDrawerOpen} 
      />
    </div>
  );
}
