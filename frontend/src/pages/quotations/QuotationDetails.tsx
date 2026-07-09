import * as React from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { QUOTATION_STATUS } from '@/lib/enums';


interface QuoteItem {
  id: string;
  product: { name: string; sku: string };
  variant?: { name: string; sku: string };
  quantity: number;
  unitPrice: number;
  discount: number;
  totalAmount: number;
}

interface QuoteDetail {
  id: string;
  quoteNumber: string;
  customer: { name: string; email?: string; phone?: string };
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  validUntil?: string;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  convertedToSoId?: string;
  createdAt: string;
  items: QuoteItem[];
}

export function QuotationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = React.useState<QuoteDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);

  const fetchDetail = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/quotations/${id}`);
      setQuote(data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load quotation');
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleStatusUpdate = async (status: string) => {
    setUpdating(true);
    try {
      await api.put(`/quotations/${id}/status`, { status });
      toast.success(`Quotation marked as ${status.toLowerCase()}`);
      fetchDetail();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleConvertToOrder = async () => {
    setUpdating(true);
    try {
      const { data } = await api.post(`/quotations/${id}/convert`);
      toast.success('Successfully converted to Sales Order!');
      navigate(`/sales-orders/${data.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Conversion failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading quotation details...</div>;
  if (!quote) return <div className="text-center py-12 text-red-500">Quotation not found.</div>;

  const columns: ColumnDef<QuoteItem>[] = [
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
      accessorKey: 'discount',
      header: 'Discount',
      cell: ({ row }) => <span>${Number(row.original.discount).toFixed(2)}</span>,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }) => <span className="font-medium">${Number(row.original.totalAmount).toFixed(2)}</span>,
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">{quote.quoteNumber}</h2>
            <Badge variant={QUOTATION_STATUS[quote.status]?.variant ?? 'outline'}>
              {QUOTATION_STATUS[quote.status]?.label ?? quote.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">Estimate for customer: <span className="font-medium text-foreground">{quote.customer.name}</span></p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quote.status === 'DRAFT' && (
            <Button disabled={updating} onClick={() => handleStatusUpdate('SENT')}>Mark as Sent</Button>
          )}
          {quote.status === 'SENT' && (
            <>
              <Button variant="outline" disabled={updating} onClick={() => handleStatusUpdate('REJECTED')} className="text-destructive border-destructive hover:bg-destructive/10">Reject</Button>
              <Button disabled={updating} onClick={() => handleStatusUpdate('ACCEPTED')}>Accept Quote</Button>
            </>
          )}
          {quote.status === 'ACCEPTED' && !quote.convertedToSoId && (
            <Button disabled={updating} onClick={handleConvertToOrder}>Convert to Sales Order</Button>
          )}
          {quote.convertedToSoId && (
            <Button variant="secondary" onClick={() => navigate(`/sales-orders/${quote.convertedToSoId}`)}>View Sales Order</Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={quote.items}
              searchKey="productName"
              searchPlaceholder="Search items..."
              emptyTitle="No items found"
              emptyDescription="There are no items in this quotation."
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${(Number(quote.totalAmount) + Number(quote.discountAmount)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-green-600">-${Number(quote.discountAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-3">
                <span>Total</span>
                <span>${Number(quote.totalAmount).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Quote Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="font-semibold block text-muted-foreground mb-1">Valid Until</span>
                <span className="font-medium">
                  {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'No expiry date set'}
                </span>
              </div>
              <div>
                <span className="font-semibold block text-muted-foreground mb-1">Date Created</span>
                <span className="font-medium">{new Date(quote.createdAt).toLocaleString()}</span>
              </div>
              {quote.notes && (
                <div>
                  <span className="font-semibold block text-muted-foreground mb-1">Notes</span>
                  <span className="text-foreground block border p-3 rounded-md bg-muted/20 text-xs mt-1 leading-relaxed">{quote.notes}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default QuotationDetails;
