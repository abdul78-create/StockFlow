import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useWarehouses } from '@/lib/hooks/useWarehouses';
import { Warehouse } from '@/lib/types/warehouse';
import { Icons } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { QueryStateWrapper } from '@/components/ui/query-state-wrapper';
import { WarehouseDrawer } from './WarehouseDrawer';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export function WarehousesList() {
  const { data, isLoading, error } = useWarehouses({});
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState(false);

  const columns: ColumnDef<Warehouse>[] = [
    {
      accessorKey: 'name',
      header: 'Warehouse Name',
      cell: ({ row }) => (
        <Link to={`/warehouses/${row.original.id}`} className="font-medium text-blue-600 hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.address}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Date Added',
      cell: ({ row }) => <span>{format(new Date(row.original.createdAt), 'MMM d, yyyy')}</span>,
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Warehouses</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsCreateDrawerOpen(true)}>
            <Icons.add className="mr-2 h-4 w-4" /> Add Warehouse
          </Button>
        </div>
      </div>

      <QueryStateWrapper
        isLoading={isLoading}
        error={error}
        data={data}
        isEmpty={(d) => !d || d.length === 0}
        emptyProps={{
          title: "No warehouses found",
          description: "Get started by adding a new warehouse to track inventory.",
          action: (
            <Button onClick={() => setIsCreateDrawerOpen(true)}>
              <Icons.add className="mr-2 h-4 w-4" /> Add Warehouse
            </Button>
          )
        }}
      >
        {(validData) => (
          <DataTable
            columns={columns}
            data={validData}
            searchKey="name"
            searchPlaceholder="Search warehouses..."
            enableRowSelection={false}
            enableExport={true} enableImport={true} onImport={() => console.log("Importing")}
          />
        )}
      </QueryStateWrapper>

      <WarehouseDrawer 
        open={isCreateDrawerOpen} 
        onOpenChange={setIsCreateDrawerOpen} 
      />
    </div>
  );
}
