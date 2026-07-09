import * as React from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { QueryStateWrapper } from '@/components/ui/query-state-wrapper';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { useNavigate, Link } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PurchaseReturn {
  id: string;
  returnNumber: string;
  supplier: {
    companyName: string;
  };
  status: 'DRAFT' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  reason?: string;
  createdAt: string;
}

export function PurchaseReturnList() {
  const [returns, setReturns] = React.useState<PurchaseReturn[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [activeView, setActiveView] = React.useState('ALL');
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchReturns = async () => {
      try {
        const { data } = await api.get('/purchase-returns');
        setReturns(data.data.data || []);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReturns();
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'default';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'destructive';
      case 'DRAFT': return 'secondary';
      default: return 'outline';
    }
  };

  const columns: ColumnDef<PurchaseReturn>[] = [
    {
      accessorKey: 'returnNumber',
      header: 'Return Number',
      cell: ({ row }) => (
        <Link to={`/purchase-returns/${row.original.id}`} className="font-medium text-blue-600 hover:underline">
          {row.original.returnNumber}
        </Link>
      ),
    },
    {
      id: 'supplier',
      accessorFn: (row) => row.supplier?.companyName,
      header: 'Supplier',
      cell: ({ row }) => <span className="font-medium">{row.original.supplier?.companyName}</span>,
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
        <Badge variant={getStatusBadgeVariant(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
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
                <Link to={`/purchase-returns/${row.original.id}`}>
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
    if (!returns) return [];
    let result = returns;
    if (activeView === 'PENDING') {
      result = result.filter(r => r.status === 'DRAFT' || r.status === 'APPROVED');
    } else if (activeView === 'COMPLETED') {
      result = result.filter(r => r.status === 'COMPLETED');
    }
    return result;
  }, [returns, activeView]);

  const bulkActions = (selectedRows: PurchaseReturn[]) => (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => toast.info(`Bulk actions not implemented for ${selectedRows.length} returns yet.`)}
    >
      <Icons.settings className="mr-2 h-4 w-4" /> Actions ({selectedRows.length})
    </Button>
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Purchase Returns</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage and track product returns sent back to suppliers.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => navigate('/purchase-returns/new')} className="bg-primary hover:bg-primary/90 shadow-sm">
            <Icons.add className="mr-2 h-4 w-4" /> New Return
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
              All Returns
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
        isLoading={loading}
        error={error}
        data={filteredData}
        isEmpty={(d) => !d || d.length === 0}
        emptyProps={{
          title: "No purchase returns found",
          description: "Click \"New Return\" to create one.",
          action: {
            label: "New Return",
            icon: Icons.add,
            onClick: () => navigate('/purchase-returns/new')
          }
        }}
      >
        {(validData) => (
          <DataTable
            columns={columns}
            data={validData}
            searchKey="returnNumber"
            searchPlaceholder="Search return number..."
            enableRowSelection={true}
            enableExport={true}
            exportFilename="purchase-returns-export.csv"
            bulkActions={bulkActions}
          />
        )}
      </QueryStateWrapper>
    </div>
  );
}

export default PurchaseReturnList;
