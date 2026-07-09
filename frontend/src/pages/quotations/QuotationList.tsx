import * as React from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { QueryStateWrapper } from '@/components/ui/query-state-wrapper';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/lib/icons';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';

interface Quotation {
  id: string;
  quoteNumber: string;
  customer: {
    name: string;
  };
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  totalAmount: number;
  validUntil?: string;
  createdAt: string;
}

export function QuotationList() {
  const [quotes, setQuotes] = React.useState<Quotation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const { data } = await api.get('/quotations');
        setQuotes(data.data.data || []);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotes();
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'success';
      case 'SENT': return 'default';
      case 'REJECTED': return 'destructive';
      case 'EXPIRED': return 'secondary';
      case 'DRAFT': return 'outline';
      default: return 'outline';
    }
  };

  const columns: ColumnDef<Quotation>[] = [
    {
      accessorKey: 'quoteNumber',
      header: 'Quote Number',
      cell: ({ row }) => <span className="font-semibold text-primary">{row.original.quoteNumber}</span>,
    },
    {
      id: 'customer',
      accessorFn: (row) => row.customer.name,
      header: 'Customer',
      cell: ({ row }) => <span>{row.original.customer.name}</span>,
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
      accessorKey: 'validUntil',
      header: 'Valid Until',
      cell: ({ row }) => <span>{row.original.validUntil ? new Date(row.original.validUntil).toLocaleDateString() : 'N/A'}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created At',
      cell: ({ row }) => <span>{new Date(row.original.createdAt).toLocaleDateString()}</span>,
    }
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quotations</h2>
          <p className="text-muted-foreground">Manage and track customer price quotations.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => navigate('/quotations/new')}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
          >
            <Icons.add className="mr-2 h-4 w-4" /> New Quotation
          </Button>
        </div>
      </div>

      <QueryStateWrapper
        isLoading={loading}
        error={error}
        data={{ data: quotes }}
        isEmpty={(d) => !d.data || d.data.length === 0}
        emptyProps={{
          title: "No quotations found",
          description: "Click \"New Quotation\" to create one.",
          action: {
            label: "New Quotation",
            icon: Icons.add,
            onClick: () => navigate('/quotations/new')
          }
        }}
      >
        {(validData) => (
          <DataTable
            columns={columns}
            data={validData.data}
            searchKey="quoteNumber"
            searchPlaceholder="Search quote number..."
            enableRowSelection={true}
            enableExport={true}
            exportFilename="quotations-export.csv"
            onRowClick={(row) => navigate(`/quotations/${row.id}`)}
          />
        )}
      </QueryStateWrapper>
    </div>
  );
}

export default QuotationList;
