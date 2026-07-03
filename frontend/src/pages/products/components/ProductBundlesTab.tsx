import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Icons } from '@/lib/icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const bundleSchema = z.object({
  componentProductId: z.string().uuid('Valid Product ID is required'),
  quantity: z.coerce.number().positive('Quantity must be positive'),
});

export function ProductBundlesTab({ product }: { product: any }) {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await api.post(`/products/${product.id}/bundles`, values);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', product.id] });
    },
  });

  const form = useForm({
    resolver: zodResolver(bundleSchema),
    defaultValues: { componentProductId: '', quantity: 1 },
  });

  const onSubmit = async (values: any) => {
    await addMutation.mutateAsync(values);
    setOpen(false);
    form.reset();
  };

  const columns = [
    { accessorKey: 'componentProduct.name', header: 'Component Name' },
    { accessorKey: 'quantity', header: 'Quantity' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Bundle Components</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Icons.add className="mr-2 h-4 w-4" /> Add Component</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Component to Bundle</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="componentProductId" render={({ field }) => (
                  <FormItem><FormLabel>Component Product ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="quantity" render={({ field }) => (
                  <FormItem><FormLabel>Quantity</FormLabel><FormControl><Input type="number" {...field} value={field.value as number} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={addMutation.isPending}>
                  {addMutation.isPending ? 'Saving...' : 'Add Component'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={product.bundleItems || []} searchKey="componentProductId" searchPlaceholder="Search components..." />
    </div>
  );
}
