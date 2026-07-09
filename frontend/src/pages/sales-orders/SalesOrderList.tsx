import * as React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useSalesOrders } from '@/lib/hooks/useSalesOrders';
import { Icons } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { QueryStateWrapper } from '@/components/ui/query-state-wrapper';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { SO_STATUS } from '@/lib/enums';
import { toast } from 'sonner';

export function SalesOrderList() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useSalesOrders({ limit: 1000 }); // Getting all for client side filtering
  const [activeView, setActiveView] = React.useState('ALL');

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'soNumber',
      header: 'SO Number',
      cell: ({ row }) => (
        <Link to={`/sales-orders/${row.original.id}`} className="font-medium text-blue-600 hover:underline">
          {row.original.soNumber}
        </Link>
      ),
    },
    {
      accessorFn: (row) => row.customer?.name,
      id: 'customer',
      header: 'Customer',
      cell: ({ row }) => <span className="font-medium">{row.original.customer?.name}</span>,
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
        <Badge variant={SO_STATUS[row.original.status]?.variant ?? 'outline'}>
          {SO_STATUS[row.original.status]?.label ?? row.original.status}
        </Badge>
      )
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }) => <span>${Number(row.original.totalAmount).toFixed(2)}</span>,
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
                <Link to={`/sales-orders/${row.original.id}`}>
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
    if (!data?.data) return [];
    let result = data.data;
    if (activeView === 'PENDING') {
      result = result.filter((so: any) => so.status === 'DRAFT' || so.status === 'APPROVED');
    } else if (activeView === 'COMPLETED') {
      result = result.filter((so: any) => so.status === 'COMPLETED');
    }
    return result;
  }, [data, activeView]);

  const bulkActions = (selectedRows: any[]) => (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => toast.info(`Bulk actions not implemented for ${selectedRows.length} orders yet.`)}
    >
      <Icons.settings className="mr-2 h-4 w-4" /> Actions ({selectedRows.length})
    </Button>
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales Orders</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage and track all sales orders from customers.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => navigate('/sales-orders/new')} className="bg-primary hover:bg-primary/90 shadow-sm">
            <Icons.add className="mr-2 h-4 w-4" /> Create Order
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
              All Orders
            </TabsTrigger>
            <TabsTrigger 
              value="PENDING" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-3 pt-2"
            >
              Pending
            </TabsTrigger>
            <TabsTrigger 
              value="COMPLETED" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 pb-3 pt-2"
            >
              Completed
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
          title: "No sales orders found",
          description: "You haven't created any sales orders yet.",
          action: {
            label: "Create Sales Order",
            icon: Icons.add,
            onClick: () => navigate('/sales-orders/new')
          }
        }}
      >
        {(validData) => (
          <DataTable
            columns={columns}
            data={validData}
            searchKey="soNumber"
            searchPlaceholder="Search orders by SO number..."
            enableRowSelection={true}
            enableExport={true}
            bulkActions={bulkActions}
          />
        )}
      </QueryStateWrapper>
    </div>
  );
}
