import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const formSchema = z.object({
  salesOrderId: z.string().min(1, 'Sales Order is required'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(0, 'Quantity must be at least 0'),
      maxQty: z.number(),
      unitPrice: z.number(),
      name: z.string(),
      sku: z.string(),
    })
  ).min(1, 'At least one item is required'),
}).refine(data => {
  return data.items.some(item => item.quantity > 0);
}, {
  message: "At least one item must have a return quantity greater than 0",
  path: ["items"],
});

type FormValues = z.infer<typeof formSchema>;

export function SalesReturnForm() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = React.useState(false);

  const { data: sosData } = useQuery({
    queryKey: ['sales-orders', 'all'],
    queryFn: async () => {
      const { data } = await api.get('/sales-orders?limit=100');
      return data.data.orders || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/sales-returns', data),
    onSuccess: (res: any) => {
      toast.success('Sales return created');
      const id = res?.data?.data?.id || res?.data?.id;
      if (id) {
        navigate(`/sales-returns/${id}`);
      } else {
        navigate('/sales-returns');
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create sales return');
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salesOrderId: '',
      reason: '',
      notes: '',
      items: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const handleSoChange = async (soId: string) => {
    form.setValue('salesOrderId', soId);
    try {
      const { data } = await api.get(`/sales-orders/${soId}`);
      const so = data.data;
      
      const initialItems = so.items.map((item: any) => ({
        productId: item.productId,
        quantity: 0,
        unitPrice: Number(item.unitPrice),
        maxQty: item.shippedQuantity || 0,
        name: item.product.name,
        sku: item.product.sku,
      })).filter((i: any) => i.maxQty > 0);

      replace(initialItems);
      
      if (initialItems.length === 0) {
        toast.warning('This Sales Order has no shipped quantities to return.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load sales order details');
    }
  };

  const onSubmit = (values: FormValues) => {
    const activeSo = sosData?.find((s: any) => s.id === values.salesOrderId);
    const returnItems = values.items.filter(i => i.quantity > 0);
    
    const payload = {
      salesOrderId: values.salesOrderId,
      customerId: activeSo?.customerId,
      reason: values.reason,
      notes: values.notes,
      items: returnItems.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    };
    
    createMutation.mutate(payload);
  };

  const itemsValue = form.watch('items');
  const totalAmount = itemsValue.reduce((sum, item) => sum + ((item.quantity || 0) * item.unitPrice), 0);

  return (
    <PageTemplate
      title="New Sales Return"
      subtitle="Record products returned by customer."
      breadcrumbs={[
        { label: 'Sales Returns', href: '/sales-returns' },
        { label: 'Create', href: '/sales-returns/new' },
      ]}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Source Document</CardTitle>
              <CardDescription>Select the source Sales Order to return items from.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="salesOrderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales Order</FormLabel>
                    <Select onValueChange={(val) => handleSoChange(val)} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Sales Order" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sosData?.map((so: any) => (
                          <SelectItem key={so.id} value={so.id}>
                            {so.soNumber} ({so.customer.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return Reason</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Changed mind, Wrong product color" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {fields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Returned Items</CardTitle>
                <CardDescription>Specify return quantities up to the shipped limit.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.formState.errors.items?.root && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.items.root.message}
                  </p>
                )}
                {fields.map((field, idx) => {
                  const currentItem = itemsValue[idx];
                  const lineTotal = (currentItem?.quantity || 0) * currentItem.unitPrice;

                  return (
                    <div key={field.id} className="flex flex-wrap items-end gap-4 p-4 border rounded-md">
                      <div className="flex-1 min-w-[200px]">
                        <Label className="text-xs text-muted-foreground mb-1 block">Product</Label>
                        <div className="font-semibold">{currentItem.name}</div>
                        <div className="text-xs text-muted-foreground">{currentItem.sku}</div>
                      </div>

                      <div className="w-24">
                        <Label className="text-xs text-muted-foreground mb-1 block">Shipped Qty</Label>
                        <div className="font-medium h-10 flex items-center">{currentItem.maxQty}</div>
                      </div>

                      <FormField
                        control={form.control}
                        name={`items.${idx}.quantity`}
                        render={({ field }) => (
                          <FormItem className="w-28">
                            <FormLabel className="text-xs text-muted-foreground">Return Qty</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                max={currentItem.maxQty}
                                {...field}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10) || 0;
                                  field.onChange(Math.min(val, currentItem.maxQty));
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="w-24">
                        <Label className="text-xs text-muted-foreground mb-1 block">Unit Price</Label>
                        <div className="font-medium h-10 flex items-center">${currentItem.unitPrice.toFixed(2)}</div>
                      </div>

                      <div className="w-24 pb-2 text-right">
                        <span className="text-xs text-muted-foreground">Line Total</span>
                        <div className="font-semibold text-base">${lineTotal.toFixed(2)}</div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <textarea
                          placeholder="Details of return reasons, credit notes, or client shipping tickets..."
                          {...field}
                          className="w-full h-24 p-3 border rounded-md bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                if (form.formState.isDirty) {
                  setShowConfirm(true);
                  return;
                }
                navigate('/sales-returns');
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || fields.length === 0}>
              {createMutation.isPending ? 'Creating...' : 'Create Sales Return'}
            </Button>
          </div>
        </form>
      </Form>
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to discard them and leave?"
        confirmLabel="Leave Page"
        cancelLabel="Keep Editing"
        variant="destructive"
        onConfirm={() => {
          setShowConfirm(false);
          navigate('/sales-returns');
        }}
      />
    </PageTemplate>
  );
}

export default SalesReturnForm;
