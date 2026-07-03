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

export function SuppliersList() {
  const { data, isLoading, error } = useSuppliers({});
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState(false);

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
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Suppliers</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsCreateDrawerOpen(true)}>
            <Icons.add className="mr-2 h-4 w-4" /> Add Supplier
          </Button>
        </div>
      </div>

      <QueryStateWrapper
        isLoading={isLoading}
        error={error}
        data={data}
        isEmpty={(d) => !d || d.length === 0}
        emptyProps={{
          title: "No suppliers found",
          description: "Get started by adding a new supplier to your network.",
          action: (
            <Button onClick={() => setIsCreateDrawerOpen(true)}>
              <Icons.add className="mr-2 h-4 w-4" /> Add Supplier
            </Button>
          )
        }}
      >
        {(validData) => (
          <DataTable
            columns={columns}
            data={validData}
            searchKey="companyName"
            searchPlaceholder="Search suppliers..."
            enableRowSelection={false}
            enableExport={false}
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
