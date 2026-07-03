import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAddProductVariant } from '@/lib/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Icons } from '@/lib/icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const variantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.coerce.number().positive('Price must be positive'),
  cost: z.coerce.number().positive('Cost must be positive'),
});

export function ProductVariantsTab({ product }: { product: any }) {
  const [open, setOpen] = React.useState(false);
  const addMutation = useAddProductVariant(product.id);

  const form = useForm({
    resolver: zodResolver(variantSchema),
    defaultValues: { name: '', sku: '', price: 0, cost: 0 },
  });

  const onSubmit = async (values: any) => {
    await addMutation.mutateAsync(values);
    setOpen(false);
    form.reset();
  };

  const columns = [
    { accessorKey: 'sku', header: 'SKU' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'price', header: 'Price', cell: ({ row }: any) => `$${Number(row.original.price).toFixed(2)}` },
    { accessorKey: 'cost', header: 'Cost', cell: ({ row }: any) => `$${Number(row.original.cost).toFixed(2)}` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Variants</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Icons.add className="mr-2 h-4 w-4" /> Add Variant</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Product Variant</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} value={field.value as string | number} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="sku" render={({ field }) => (
                  <FormItem><FormLabel>SKU</FormLabel><FormControl><Input {...field} value={field.value as string | number} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value as string | number} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="cost" render={({ field }) => (
                    <FormItem><FormLabel>Cost</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value as string | number} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <Button type="submit" className="w-full" disabled={addMutation.isPending}>
                  {addMutation.isPending ? 'Saving...' : 'Save Variant'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={product.variants || []} searchKey="name" searchPlaceholder="Search variants..." />
    </div>
  );
}