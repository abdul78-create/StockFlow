import { useState } from 'react';
import { useSalesOrders } from '@/lib/hooks/useSalesOrders';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { QueryStateWrapper } from '@/components/ui/query-state-wrapper';
import { Card } from '@/components/ui/card';
import { SO_STATUS } from '@/lib/enums';


export function SalesOrderList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useSalesOrders({ search, page: 1, limit: 20 });

  return (
    <PageTemplate
      title="Sales Orders"
      subtitle="Manage and track all sales orders from customers"
      actions={
        <Button onClick={() => navigate('/sales-orders/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search SO number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Card className="rounded-md border bg-card">
          <QueryStateWrapper
            isLoading={isLoading}
            error={error}
            data={data}
            isEmpty={(d) => !d.data || d.data.length === 0}
            emptyProps={{
              title: "No sales orders found",
              description: "You haven't created any sales orders yet.",
              action: (
                <Button onClick={() => navigate('/sales-orders/new')}>
                  Create Sales Order
                </Button>
              )
            }}
          >
            {(validData) => (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SO Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validData.data.map((so) => (
                    <TableRow key={so.id}>
                      <TableCell className="font-medium">{so.soNumber}</TableCell>
                      <TableCell>{so.customer?.name}</TableCell>
                      <TableCell>{format(new Date(so.createdAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={SO_STATUS[so.status]?.variant ?? 'outline'}>
                          {SO_STATUS[so.status]?.label ?? so.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${Number(so.totalAmount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/sales-orders/${so.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </QueryStateWrapper>
        </Card>
      </div>
    </PageTemplate>
  );
}
