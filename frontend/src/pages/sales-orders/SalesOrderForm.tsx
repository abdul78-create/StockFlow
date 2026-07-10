import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumericInput } from '@/components/ui/numeric-input';
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
import { useCustomers } from '@/lib/hooks/useCustomers';
import { useProducts } from '@/lib/hooks/useProducts';
import { useCreateSalesOrder } from '@/lib/hooks/useSalesOrders';
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
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
  discountAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function SalesOrderForm() {
  const navigate = useNavigate();
  const { data: customersData } = useCustomers({ limit: 100 });
  const { data: productsData } = useProducts({ limit: 100 });
  const createMutation = useCreateSalesOrder();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: '',
      items: [{ productId: '', variantId: '', quantity: 1, unitPrice: 0 }],
      shippingCost: 0,
      taxAmount: 0,
      discountAmount: 0,
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values, {
      onSuccess: (res: any) => {
        toast.success('Sales order created successfully');
        const id = res?.id;
        if (id) {
          navigate(`/sales-orders/${id}`);
        } else {
          navigate('/sales-orders');
        }
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to create sales order');
      }
    });
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = productsData?.data.find((p: any) => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.unitPrice`, Number(product.sellingPrice || 0));
    }
  };

  return (
    <PageTemplate
      title="Create Sales Order"
      subtitle="Draft a new sales order for a customer"
      breadcrumbs={[
        { label: 'Sales Orders', href: '/sales-orders' },
        { label: 'Create', href: '/sales-orders/new' },
      ]}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem className="max-w-md">
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customersData?.map((customer) => (
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
                          <NumericInput
                            min={1}
                            precision={0}
                            thousands={false}
                            value={field.value}
                            onChange={(val) => field.onChange(val || 0)}
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
                          <NumericInput
                            min={0}
                            precision={2}
                            value={field.value}
                            onChange={(val) => field.onChange(val || 0)}
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
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="shippingCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Cost ($)</FormLabel>
                      <FormControl>
                        <NumericInput min={0} precision={2} value={field.value} onChange={val => field.onChange(val || 0)} />
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
                        <NumericInput min={0} precision={2} value={field.value} onChange={val => field.onChange(val || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discountAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Amount ($)</FormLabel>
                      <FormControl>
                        <NumericInput min={0} precision={2} value={field.value} onChange={val => field.onChange(val || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes / Comments</FormLabel>
                    <FormControl>
                      <Input placeholder="Any special instructions..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => navigate('/sales-orders')}>
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
