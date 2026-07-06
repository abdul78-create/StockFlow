import * as React from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

  React.useEffect(() => {
    const fetchExpiring = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/inventory/expiring?days=${days}`);
        setBatches(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchExpiring();
  }, [days]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Expiring Stock</h2>
        <p className="text-muted-foreground">Monitor product batches and lots nearing their expiry dates.</p>
      </div>

      <Card>
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
          {loading ? (
            <div className="text-center py-8 text-sm text-muted-foreground">Loading expiring stock...</div>
          ) : batches.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No expiring stock found within {days} days.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Batch No</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Time Left</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map(batch => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">{batch.inventory.product.name}</TableCell>
                    <TableCell>{batch.inventory.product.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{batch.batchNumber}</Badge>
                    </TableCell>
                    <TableCell>{batch.inventory.warehouse.name}</TableCell>
                    <TableCell>
                      {batch.quantity} {batch.inventory.product.baseUnit}
                    </TableCell>
                    <TableCell>{new Date(batch.expiryDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {formatDistanceToNow(new Date(batch.expiryDate), { addSuffix: false })}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
export default ExpiringStock;
