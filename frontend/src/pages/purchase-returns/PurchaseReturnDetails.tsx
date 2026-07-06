import * as React from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { RETURN_STATUS } from '@/lib/enums';


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
  purchaseOrder: { poNumber: string };
  supplier: { companyName: string; email?: string };
  status: 'DRAFT' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
  reason?: string;
  notes?: string;
  totalAmount: number;
  createdAt: string;
  items: ReturnItem[];
}

export function PurchaseReturnDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ret, setRet] = React.useState<ReturnDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);

  const fetchDetail = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/purchase-returns/${id}`);
      setRet(data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load purchase return');
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleApprove = async () => {
    if (!confirm('Approving this return will reduce the stock levels in your inventory. Proceed?')) return;
    setUpdating(true);
    try {
      await api.put(`/purchase-returns/${id}/approve`);
      toast.success('Purchase return approved and inventory adjusted.');
      fetchDetail();
    } catch {
      toast.error('Failed to approve purchase return');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this return?')) return;
    setUpdating(true);
    try {
      await api.put(`/purchase-returns/${id}/cancel`);
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">{ret.returnNumber}</h2>
            <Badge variant={RETURN_STATUS[ret.status]?.variant ?? 'outline'}>
              {RETURN_STATUS[ret.status]?.label ?? ret.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">Supplier: {ret.supplier.companyName} | Ref PO: {ret.purchaseOrder.poNumber}</p>
        </div>
        <div className="flex gap-2">
          {ret.status === 'DRAFT' && (
            <>
              <Button variant="outline" disabled={updating} onClick={handleCancel} className="text-destructive border-destructive hover:bg-destructive/10">Cancel Return</Button>
              <Button disabled={updating} onClick={handleApprove}>Approve &amp; Revert Stock</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Returned items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ret.items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-xs text-muted-foreground">{item.product.sku}</div>
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>${Number(item.unitPrice).toFixed(2)}</TableCell>
                    <TableCell className="text-right">${Number(item.totalAmount).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
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

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-semibold block">Date Created:</span>
                <span className="text-muted-foreground">{new Date(ret.createdAt).toLocaleString()}</span>
              </div>
              {ret.reason && (
                <div>
                  <span className="font-semibold block">Reason for Return:</span>
                  <span className="text-muted-foreground">{ret.reason}</span>
                </div>
              )}
              {ret.notes && (
                <div>
                  <span className="font-semibold block">Logistics Notes:</span>
                  <span className="text-muted-foreground block border p-2 rounded bg-muted/20 text-xs mt-1">{ret.notes}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
export default PurchaseReturnDetails;
