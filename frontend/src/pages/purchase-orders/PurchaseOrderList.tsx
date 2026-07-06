import { useState } from 'react';
import { usePurchaseOrders } from '@/lib/hooks/usePurchaseOrders';
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
import { PO_STATUS } from '@/lib/enums';



export function PurchaseOrderList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = usePurchaseOrders({ search, page: 1, limit: 20 });

  return (
    <PageTemplate
      title="Purchase Orders"
      subtitle="Manage and track all purchase orders from suppliers"
      actions={
        <Button onClick={() => navigate('/purchase-orders/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search PO number or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Card>
          <QueryStateWrapper
            isLoading={isLoading}
            error={error}
            data={data}
            isEmpty={(d) => !d.data || d.data.length === 0}
            emptyProps={{
              title: "No purchase orders found",
              description: "You haven't created any purchase orders yet.",
              action: (
                <Button onClick={() => navigate('/purchase-orders/new')}>
                  Create Purchase Order
                </Button>
              )
            }}
          >
            {(validData) => (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validData.data.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">{po.poNumber}</TableCell>
                      <TableCell>{po.supplier?.companyName}</TableCell>
                      <TableCell>{format(new Date(po.createdAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={PO_STATUS[po.status]?.variant ?? 'outline'}>
                          {PO_STATUS[po.status]?.label ?? po.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${Number(po.totalAmount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/purchase-orders/${po.id}`)}
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
