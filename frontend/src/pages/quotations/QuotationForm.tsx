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

interface Customer {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
}

interface QuoteItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export function QuotationForm() {
  const navigate = useNavigate();
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  
  const [customerId, setCustomerId] = React.useState('');
  const [validUntil, setValidUntil] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [discountAmount, setDiscountAmount] = React.useState('0');
  
  const [items, setItems] = React.useState<QuoteItemInput[]>([]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    const load = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          api.get('/customers?limit=100'),
          api.get('/products?limit=100'),
        ]);
        setCustomers(custRes.data.data.data || custRes.data.data || []);
        setProducts(prodRes.data.data.data || prodRes.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, unitPrice: 0, discount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, key: keyof QuoteItemInput, val: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [key]: val };

    // Auto-populate price when product is selected
    if (key === 'productId') {
      const prod = products.find(p => p.id === val);
      if (prod) {
        updated[index].unitPrice = Number(prod.sellingPrice);
      }
    }

    setItems(updated);
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice - item.discount), 0);
  const total = Math.max(0, subtotal - Number(discountAmount));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      toast.error('Please select a customer');
      return;
    }
    if (items.length === 0 || items.some(item => !item.productId)) {
      toast.error('Please add at least one valid product line');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customerId,
        notes,
        discountAmount: Number(discountAmount),
        validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
        items: items.map(i => ({
          productId: i.productId,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          discount: Number(i.discount),
        })),
      };
      await api.post('/quotations', payload);
      toast.success('Quotation created successfully');
      navigate('/quotations');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create quotation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">New Quotation</h2>
        <p className="text-muted-foreground">Draft a new price quote for a prospective customer.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>General Details</CardTitle>
            <CardDescription>Select customer and validity terms.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cust">Customer *</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger id="cust">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valid">Valid Until</Label>
              <Input
                id="valid"
                type="date"
                value={validUntil}
                onChange={e => setValidUntil(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Line Items</CardTitle>
              <CardDescription>Add products, prices, and discounts.</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
              Add Product Line
            </Button>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">No lines added yet. Click &quot;Add Product Line&quot;.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit Price ($)</TableHead>
                    <TableHead>Line Disc ($)</TableHead>
                    <TableHead>Total ($)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => {
                    const rowTotal = item.quantity * item.unitPrice - item.discount;
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Select value={item.productId} onValueChange={val => handleItemChange(index, 'productId', val)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={e => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                            className="w-28"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.discount}
                            onChange={e => handleItemChange(index, 'discount', Number(e.target.value))}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell className="align-middle font-medium">
                          ${rowTotal.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                            className="text-destructive hover:bg-destructive/10"
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Totals & Notes */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                placeholder="Include custom terms or details..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full h-24 p-3 border rounded-md bg-transparent outline-none text-sm placeholder:text-muted-foreground"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="disc">Overall Discount ($)</Label>
                <Input
                  id="disc"
                  type="number"
                  step="0.01"
                  value={discountAmount}
                  onChange={e => setDiscountAmount(e.target.value)}
                />
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/quotations')}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Creating...' : 'Create Quotation'}
          </Button>
        </div>
      </form>
    </div>
  );
}
export default QuotationForm;
