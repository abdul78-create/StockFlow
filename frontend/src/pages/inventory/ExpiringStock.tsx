import * as React from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { QueryStateWrapper } from '@/components/ui/query-state-wrapper';
import { ColumnDef } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface ExpiringBatch {
  id: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  manufacturingDate?: string;
  inventory: {
    product: {
      name: string;
      sku: string;
      baseUnit: string;
    };
    warehouse: {
      name: string;
    };
  };
}

export function ExpiringStock() {
  const [batches, setBatches] = React.useState<ExpiringBatch[]>([]);
  const [days, setDays] = React.useState(30);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchExpiring = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/inventory/expiring?days=${days}`);
        setBatches(data.data || []);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpiring();
  }, [days]);

  const columns: ColumnDef<ExpiringBatch>[] = [
    {
      accessorFn: (row) => row.inventory.product.name,
      id: 'productName',
      header: 'Product',
      cell: ({ row }) => <span className="font-medium">{row.original.inventory.product.name}</span>,
    },
    {
      accessorFn: (row) => row.inventory.product.sku,
      id: 'sku',
      header: 'SKU',
    },
    {
      accessorKey: 'batchNumber',
      header: 'Batch No',
      cell: ({ row }) => <Badge variant="outline">{row.original.batchNumber}</Badge>,
    },
    {
      accessorFn: (row) => row.inventory.warehouse.name,
      id: 'warehouse',
      header: 'Warehouse',
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => <span>{row.original.quantity} {row.original.inventory.product.baseUnit}</span>,
    },
    {
      accessorKey: 'expiryDate',
      header: 'Expiry Date',
      cell: ({ row }) => <span>{new Date(row.original.expiryDate).toLocaleDateString()}</span>,
    },
    {
      id: 'timeLeft',
      header: 'Time Left',
      cell: ({ row }) => (
        <Badge variant="destructive">
          {formatDistanceToNow(new Date(row.original.expiryDate), { addSuffix: false })}
        </Badge>
      ),
    }
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expiring Stock</h2>
          <p className="text-muted-foreground">Monitor product batches and lots nearing their expiry dates.</p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Soon-to-Expire Batches</CardTitle>
            <CardDescription>All tracked batches expiring within the specified timeframe.</CardDescription>
          </div>
          <div className="flex items-center gap-2 max-w-xs">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Filter (days):</span>
            <Input
              type="number"
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              min={1}
              className="w-24"
            />
          </div>
        </CardHeader>
        <CardContent>
          <QueryStateWrapper
            isLoading={loading}
            error={error}
            data={{ data: batches }}
            isEmpty={(d) => !d.data || d.data.length === 0}
            emptyProps={{
              title: "No expiring stock",
              description: `No stock found expiring within the next ${days} days.`,
            }}
          >
            {(validData) => (
              <DataTable
                columns={columns}
                data={validData.data}
                searchKey="productName"
                searchPlaceholder="Search product..."
              />
            )}
          </QueryStateWrapper>
        </CardContent>
      </Card>
    </div>
  );
}

export default ExpiringStock;
