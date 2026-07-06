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

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier: { companyName: string };
  items: Array<{
    id: string;
    productId: string;
    product: { name: string; sku: string };
    quantity: number;
    unitPrice: number;
    receivedQuantity: number;
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

export function PurchaseReturnForm() {
  const navigate = useNavigate();
  const [pos, setPos] = React.useState<PurchaseOrder[]>([]);
  const [selectedPoId, setSelectedPoId] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [items, setItems] = React.useState<ReturnItemInput[]>([]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const fetchPOs = async () => {
      try {
        const { data } = await api.get('/purchase-orders?limit=100');
        setPos(data.data.data || data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPOs();
  }, []);

  const handlePoChange = async (poId: string) => {
    setSelectedPoId(poId);
    try {
      const { data } = await api.get(`/purchase-orders/${poId}`);
      const po = data.data;
      // Populate items based on PO items that were received
      const initialItems = po.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.receivedQuantity || 0,
        unitPrice: Number(item.unitPrice),
        maxQty: item.receivedQuantity || 0,
        name: item.product.name,
        sku: item.product.sku,
      })).filter((i: any) => i.maxQty > 0);

      setItems(initialItems);
      if (initialItems.length === 0) {
        toast.warning('This Purchase Order has no received quantities to return.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load purchase order details');
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
    if (!selectedPoId) {
      toast.error('Please select a purchase order');
      return;
    }
    const returnItems = items.filter(i => i.quantity > 0);
    if (returnItems.length === 0) {
      toast.error('Please specify return quantity for at least one item');
      return;
    }

    setSaving(true);
    try {
      const activePo = pos.find(p => p.id === selectedPoId);
      const payload = {
        purchaseOrderId: selectedPoId,
        supplierId: activePo?.supplierId,
        reason,
        notes,
        items: returnItems.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      };
      await api.post('/purchase-returns', payload);
      toast.success('Purchase return created');
      navigate('/purchase-returns');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create purchase return');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">New Purchase Return</h2>
        <p className="text-muted-foreground">Record products being sent back to suppliers.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Source Document</CardTitle>
            <CardDescription>Select the source Purchase Order to return items from.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="po-select">Purchase Order</Label>
              <Select value={selectedPoId} onValueChange={handlePoChange}>
                <SelectTrigger id="po-select">
                  <SelectValue placeholder="Select Purchase Order" />
                </SelectTrigger>
                <SelectContent>
                  {pos.map(po => (
                    <SelectItem key={po.id} value={po.id}>
                      {po.poNumber} ({po.supplier.companyName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ret-reason">Return Reason</Label>
              <Input
                id="ret-reason"
                placeholder="e.g. Defective, Damaged goods"
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
              <CardDescription>Specify return quantities up to the received quantity limit.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Received Qty</TableHead>
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
                placeholder="Details of return logistics, shipping tracker, etc."
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
                <span>Total Value</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/purchase-returns')}>Cancel</Button>
          <Button type="submit" disabled={saving || items.length === 0}>
            {saving ? 'Creating...' : 'Create Purchase Return'}
          </Button>
        </div>
      </form>
    </div>
  );
}
export default PurchaseReturnForm;
