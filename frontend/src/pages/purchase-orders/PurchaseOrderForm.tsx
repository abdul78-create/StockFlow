import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useSuppliers } from '@/lib/hooks/useSuppliers';
import { useProducts } from '@/lib/hooks/useProducts';
import { useCreatePurchaseOrder } from '@/lib/hooks/usePurchaseOrders';
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product is required'),
      variantId: z.string().optional(),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      unitPrice: z.number().min(0.01, 'Unit price must be at least 0.01'),
    })
  ).min(1, 'At least one item is required'),
  shippingCost: z.number().min(0).optional(),
  taxAmount: z.number().min(0).optional(),
  otherCosts: z.number().min(0).optional(),
  expectedDate: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function PurchaseOrderForm() {
  const navigate = useNavigate();
  const { data: suppliersData } = useSuppliers({ limit: 100 });
  const { data: productsData } = useProducts({ limit: 100 });
  const createMutation = useCreatePurchaseOrder();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplierId: '',
      items: [{ productId: '', variantId: '', quantity: 1, unitPrice: 0 }],
      shippingCost: 0,
      taxAmount: 0,
      otherCosts: 0,
      expectedDate: '',
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
      expectedDate: values.expectedDate ? new Date(values.expectedDate) : undefined,
    };
    createMutation.mutate(formattedValues, {
      onSuccess: (res: any) => {
        toast.success('Purchase order created successfully');
        const id = res?.id || res?.data?.data?.id || res?.data?.id || (res?.data && res.data.id) || (res?.data?.data && res.data.data.id);
        if (id) {
          navigate(`/purchase-orders/${id}`);
        } else {
          navigate('/purchase-orders');
        }
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to create purchase order');
      }
    });
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = productsData?.data.find((p: any) => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.unitPrice`, Number(product.costPrice || 0));
    }
  };

  return (
    <PageTemplate
      title="Create Purchase Order"
      subtitle="Draft a new purchase order to a supplier"
      breadcrumbs={[
        { label: 'Purchase Orders', href: '/purchase-orders' },
        { label: 'Create', href: '/purchase-orders/new' },
      ]}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Details</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem className="max-w-md">
                    <FormLabel>Supplier</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliersData?.map((supplier: any) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order Items</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ productId: '', variantId: '', quantity: 1, unitPrice: 0 })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-4">
                  <FormField
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
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
                            {productsData?.data.map((product) => (
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
                    name={`items.${index}.variantId`}
                    render={({ field }) => (
                      <FormItem className="w-48">
                        <FormLabel>Variant (Optional)</FormLabel>
                        <Select onValueChange={(v) => field.onChange(v === 'none' ? undefined : v)} value={field.value || 'none'}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="No variant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">No variant</SelectItem>
                            {productsData?.data.find((p: any) => p.id === form.watch(`items.${index}.productId`))?.variants?.map((v: any) => (
                              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
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
                      <FormItem className="w-32">
                        <FormLabel>Quantity</FormLabel>
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

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive mb-2"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="shippingCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Cost ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="otherCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Costs ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="expectedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Delivery Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Notes</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter any notes..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => navigate('/purchase-orders')}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Draft Order'}
            </Button>
          </div>
        </form>
      </Form>
    </PageTemplate>
  );
}
