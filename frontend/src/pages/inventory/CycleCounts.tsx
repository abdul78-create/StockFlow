import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { DataTable } from '@/components/ui/data-table';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function CycleCounts() {
  const { data, isLoading } = useQuery({
    queryKey: ['cycle-counts'],
    queryFn: async () => {
      const res = await api.get('/cycle-counts');
      return res.data;
    }
  });

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: any) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'warehouse',
      header: 'Warehouse',
      cell: ({ row }: any) => <span>{row.original.warehouse?.name}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const s = row.original.status;
        const color = s === 'COMPLETED' ? 'bg-success/10 text-success' : s === 'IN_PROGRESS' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground';
        return <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>{s}</span>;
      },
    },
    {
      accessorKey: 'items',
      header: 'Items to Count',
      cell: ({ row }: any) => <span>{row.original._count?.items || 0}</span>,
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cycle Counts</h2>
          <p className="text-muted-foreground">Manage inventory auditing and counts.</p>
        </div>
        
        <Button>
          <Icons.add className="mr-2 h-4 w-4" /> New Cycle Count
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Audits</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            searchKey="name"
            searchPlaceholder="Search cycle counts..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
