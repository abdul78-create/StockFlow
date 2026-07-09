import * as React from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { RETURN_STATUS } from '@/lib/enums';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';


interface ReturnItem {
  id: string;
  product: { name: string; sku: string };
  variant?: { name: string; sku: string };
  quantity: number;
  unitPrice: number;
  totalAmount: number;
}

interface ReturnDetail {
  id: string;
  returnNumber: string;
  salesOrder: { soNumber: string };
  customer: { name: string; email?: string };
  status: 'DRAFT' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
  reason?: string;
  notes?: string;
  totalAmount: number;
  createdAt: string;
  items: ReturnItem[];
}

export function SalesReturnDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ret, setRet] = React.useState<ReturnDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);

  const fetchDetail = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/sales-returns/${id}`);
      setRet(data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load sales return details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleApprove = async () => {
    if (!confirm('Approving this return will add the items back into your inventory levels. Proceed?')) return;
    setUpdating(true);
    try {
      await api.put(`/sales-returns/${id}/approve`);
      toast.success('Sales return approved and stock levels credited.');
      fetchDetail();
    } catch {
      toast.error('Failed to approve sales return');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this return?')) return;
    setUpdating(true);
    try {
      await api.put(`/sales-returns/${id}/cancel`);
      toast.success('Return cancelled');
      fetchDetail();
    } catch {
      toast.error('Failed to cancel return');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading return details...</div>;
  if (!ret) return <div className="text-center py-12 text-red-500">Return details not found.</div>;

  const columns: ColumnDef<ReturnItem>[] = [
    {
      accessorFn: (row) => row.product.name,
      id: 'productName',
      header: 'Product',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.product.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.product.sku}</div>
        </div>
      )
    },
    {
      accessorKey: 'quantity',
      header: 'Qty',
    },
    {
      accessorKey: 'unitPrice',
      header: 'Unit Price',
      cell: ({ row }) => <span>${Number(row.original.unitPrice).toFixed(2)}</span>,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }) => <span className="font-medium">${Number(row.original.totalAmount).toFixed(2)}</span>,
    }
  ];

  return (
    <PageTemplate
      title={ret.returnNumber}
      subtitle={`Customer: ${ret.customer.name} | Ref SO: ${ret.salesOrder.soNumber}`}
      breadcrumbs={[
        { label: 'Sales Returns', href: '/sales-returns' },
        { label: ret.returnNumber, href: `/sales-returns/${ret.id}` },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/sales-returns')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {ret.status === 'DRAFT' && (
            <>
              <Button variant="destructive" disabled={updating} onClick={handleCancel}>
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Return
              </Button>
              <Button disabled={updating} onClick={handleApprove} className="bg-emerald-600 hover:bg-emerald-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve & Credit Stock
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Returned items</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={ret.items}
              searchKey="productName"
              searchPlaceholder="Search items..."
              emptyTitle="No items found"
              emptyDescription="There are no items in this return."
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between font-bold text-base border-t pt-3">
                <span>Total Value</span>
                <span>${Number(ret.totalAmount).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="font-semibold block text-muted-foreground mb-1">Date Created</span>
                <span className="font-medium">{new Date(ret.createdAt).toLocaleString()}</span>
              </div>
              {ret.reason && (
                <div>
                  <span className="font-semibold block text-muted-foreground mb-1">Reason for Return</span>
                  <span className="text-foreground">{ret.reason}</span>
                </div>
              )}
              {ret.notes && (
                <div>
                  <span className="font-semibold block text-muted-foreground mb-1">Internal Notes</span>
                  <span className="text-foreground block border p-3 rounded-md bg-muted/20 text-xs mt-1 leading-relaxed">{ret.notes}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
}

export default SalesReturnDetails;
