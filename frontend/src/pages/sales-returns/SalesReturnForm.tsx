import * as React from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface SalesOrder {
  id: string;
  soNumber: string;
  customerId: string;
  customer: { name: string };
  items: Array<{
    id: string;
    productId: string;
    product: { name: string; sku: string };
    quantity: number;
    unitPrice: number;
    shippedQuantity: number;
  }>;
}

interface ReturnItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  maxQty: number;
  name: string;
  sku: string;
}

export function SalesReturnForm() {
  const navigate = useNavigate();
  const [sos, setSos] = React.useState<SalesOrder[]>([]);
  const [selectedSoId, setSelectedSoId] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [items, setItems] = React.useState<ReturnItemInput[]>([]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const fetchSOs = async () => {
      try {
        const { data } = await api.get('/sales-orders?limit=100');
        setSos(data.data.data || data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSOs();
  }, []);

  const handleSoChange = async (soId: string) => {
    setSelectedSoId(soId);
    try {
      const { data } = await api.get(`/sales-orders/${soId}`);
      const so = data.data;
      // Populate items based on SO items that were shipped/delivered
      const initialItems = so.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.shippedQuantity || 0,
        unitPrice: Number(item.unitPrice),
        maxQty: item.shippedQuantity || 0,
        name: item.product.name,
        sku: item.product.sku,
      })).filter((i: any) => i.maxQty > 0);

      setItems(initialItems);
      if (initialItems.length === 0) {
        toast.warning('This Sales Order has no shipped quantities to return.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load sales order details');
    }
  };

  const handleItemQtyChange = (idx: number, qty: number) => {
    const updated = [...items];
    updated[idx].quantity = Math.min(qty, updated[idx].maxQty);
    setItems(updated);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSoId) {
      toast.error('Please select a sales order');
      return;
    }
    const returnItems = items.filter(i => i.quantity > 0);
    if (returnItems.length === 0) {
      toast.error('Please specify return quantity for at least one item');
      return;
    }

    setSaving(true);
    try {
      const activeSo = sos.find(s => s.id === selectedSoId);
      const payload = {
        salesOrderId: selectedSoId,
        customerId: activeSo?.customerId,
        reason,
        notes,
        items: returnItems.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      };
      await api.post('/sales-returns', payload);
      toast.success('Sales return created');
      navigate('/sales-returns');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create sales return');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">New Sales Return</h2>
        <p className="text-muted-foreground">Record products returned by customer.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Source Document</CardTitle>
            <CardDescription>Select the source Sales Order to return items from.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="so-select">Sales Order</Label>
              <Select value={selectedSoId} onValueChange={handleSoChange}>
                <SelectTrigger id="so-select">
                  <SelectValue placeholder="Select Sales Order" />
                </SelectTrigger>
                <SelectContent>
                  {sos.map(so => (
                    <SelectItem key={so.id} value={so.id}>
                      {so.soNumber} ({so.customer.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ret-reason">Return Reason</Label>
              <Input
                id="ret-reason"
                placeholder="e.g. Changed mind, Wrong product color"
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Returned Items</CardTitle>
              <CardDescription>Specify return quantities up to the shipped limit.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Shipped Qty</TableHead>
                    <TableHead>Return Qty</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead className="text-right">Line Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, idx) => (
                    <TableRow key={item.productId}>
                      <TableCell className="font-semibold">{item.name}</TableCell>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.maxQty}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={item.maxQty}
                          value={item.quantity}
                          onChange={e => handleItemQtyChange(idx, Number(e.target.value))}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                placeholder="Details of return reasons, credit notes, or client shipping tickets..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full h-24 p-3 border rounded-md bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Return Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total Refund Value</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/sales-returns')}>Cancel</Button>
          <Button type="submit" disabled={saving || items.length === 0}>
            {saving ? 'Creating...' : 'Create Sales Return'}
          </Button>
        </div>
      </form>
    </div>
  );
}
export default SalesReturnForm;
