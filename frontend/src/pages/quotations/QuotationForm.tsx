import { useNavigate } from 'react-router-dom';
import * as React from 'react';
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
import { useCustomers } from '@/lib/hooks/useCustomers';
import { useProducts } from '@/lib/hooks/useProducts';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const formSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  validUntil: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      unitPrice: z.number().min(0, 'Unit price must be positive'),
      discount: z.number().min(0, 'Discount must be positive'),
    })
  ).min(1, 'At least one item is required'),
  discountAmount: z.number().min(0),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function QuotationForm() {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = React.useState(false);
  const { data: customersData } = useCustomers({ limit: 100 });
  const { data: productsData } = useProducts({ limit: 100 });
  
  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/quotations', data),
    onSuccess: (res: any) => {
      toast.success('Quotation created successfully');
      navigate('/quotations');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create quotation');
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: '',
      validUntil: '',
      items: [{ productId: '', quantity: 1, unitPrice: 0, discount: 0 }],
      discountAmount: 0,
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const onSubmit = (values: FormValues) => {
    const formattedValues = {
      ...values,
      validUntil: values.validUntil ? new Date(values.validUntil).toISOString() : undefined,
    };
    createMutation.mutate(formattedValues);
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = productsData?.data.find((p: any) => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.unitPrice`, Number(product.sellingPrice || 0));
    }
  };

  const itemsValue = form.watch('items');
  const discountAmountValue = form.watch('discountAmount') || 0;
  const subtotal = itemsValue.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0) - (item.discount || 0)), 0);
  const total = Math.max(0, subtotal - discountAmountValue);

  return (
    <PageTemplate
      title="New Quotation"
      subtitle="Draft a new price quote for a prospective customer."
      breadcrumbs={[
        { label: 'Quotations', href: '/quotations' },
        { label: 'Create', href: '/quotations/new' },
      ]}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>General Details</CardTitle>
              <CardDescription>Select customer and validity terms.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customersData?.map((customer: any) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
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
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Until</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Line Items</CardTitle>
                <CardDescription>Add products, prices, and discounts.</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ productId: '', quantity: 1, unitPrice: 0, discount: 0 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product Line
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">No lines added yet. Click &quot;Add Product Line&quot;.</div>
              ) : (
                fields.map((field, index) => {
                  const currentItem = itemsValue[index];
                  const lineTotal = ((currentItem?.quantity || 0) * (currentItem?.unitPrice || 0)) - (currentItem?.discount || 0);

                  return (
                    <div key={field.id} className="flex flex-wrap items-end gap-4 p-4 border rounded-md">
                      <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                          <FormItem className="flex-1 min-w-[200px]">
                            <FormLabel>Product</FormLabel>
                            <Select
                              onValueChange={(val) => {
                                field.onChange(val);
                                handleProductSelect(index, val);
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {productsData?.data.map((product: any) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} ({product.sku})
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
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormLabel>Qty</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.unitPrice`}
                        render={({ field }) => (
                          <FormItem className="w-32">
                            <FormLabel>Unit Price ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.discount`}
                        render={({ field }) => (
                          <FormItem className="w-32">
                            <FormLabel>Line Disc ($)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="w-24 pb-2 text-right">
                        <span className="text-sm font-medium">Total</span>
                        <div className="font-semibold text-base">${Math.max(0, lineTotal).toFixed(2)}</div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive mb-1"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <textarea
                          placeholder="Include custom terms or details..."
                          {...field}
                          className="w-full h-32 p-3 border rounded-md bg-transparent outline-none text-sm placeholder:text-muted-foreground"
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
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <FormField
                  control={form.control}
                  name="discountAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Overall Discount ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
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
                navigate('/quotations');
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Quotation'}
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
          navigate('/quotations');
        }}
      />
    </PageTemplate>
  );
}

export default QuotationForm;


