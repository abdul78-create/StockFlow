import { useInvoices } from '@/lib/hooks/useFinance';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { DataTable } from '@/components/ui/data-table';
import { QueryStateWrapper } from '@/components/ui/query-state-wrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
  DRAFT:     { label: 'Draft',     variant: 'secondary' },
  SENT:      { label: 'Sent',      variant: 'outline' },
  PARTIAL:   { label: 'Partial',   variant: 'warning' },
  PAID:      { label: 'Paid',      variant: 'success' },
  OVERDUE:   { label: 'Overdue',   variant: 'destructive' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
};

export function InvoicesList() {
  const { data: invoices, isLoading, error } = useInvoices();
  const navigate = useNavigate();

  const columns = [
    {
      header: 'Invoice Number',
      accessorKey: 'invoiceNumber',
      cell: ({ row }: any) => <span className="font-medium font-mono">{row.original.invoiceNumber}</span>,
    },
    {
      header: 'Customer',
      accessorKey: 'customer.name',
      cell: ({ row }: any) => <span>{row.original.customer?.name ?? '—'}</span>,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }: any) => {
        const cfg = statusConfig[row.original.status] ?? { label: row.original.status, variant: 'outline' as BadgeVariant };
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      header: 'Amount',
      accessorKey: 'totalAmount',
      cell: ({ row }: any) => `$${Number(row.original.totalAmount ?? 0).toFixed(2)}`,
    },
    {
      header: 'Balance Due',
      accessorKey: 'balanceDue',
      cell: ({ row }: any) => `$${Number(row.original.balanceDue ?? 0).toFixed(2)}`,
    },
    {
      header: 'Issued Date',
      accessorKey: 'issuedDate',
      cell: ({ row }: any) => {
        const d = row.original.issuedDate;
        return d ? format(new Date(d), 'MMM d, yyyy') : '—';
      },
    },
    {
      id: 'actions',
      cell: ({ row }: any) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/finance/invoices/${row.original.id}`)}>
          <Eye className="h-4 w-4 mr-2" /> View
        </Button>
      ),
    },
  ];

  return (
    <PageTemplate title="Invoices" subtitle="Manage customer invoices and track payments">
      <QueryStateWrapper
        isLoading={isLoading}
        error={error}
        data={invoices}
        isEmpty={(d) => !d || d.length === 0}
        emptyProps={{
          title: 'No invoices yet',
          description: 'Invoices are generated from approved sales orders.',
        }}
      >
        {(validData) => (
          <DataTable
            columns={columns}
            data={validData}
            searchKey="invoiceNumber"
            searchPlaceholder="Search invoices..."
            onRowClick={(row) => navigate(`/finance/invoices/${row.id}`)}
          />
        )}
      </QueryStateWrapper>
    </PageTemplate>
  );
}
