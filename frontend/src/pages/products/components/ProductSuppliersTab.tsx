import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAddProductSupplier } from '@/lib/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Icons } from '@/lib/icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const supplierSchema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
  supplierSku: z.string().min(1, 'Supplier SKU is required'),
  supplierPrice: z.coerce.number().positive('Price must be positive'),
});

export function ProductSuppliersTab({ product }: { product: any }) {
  const [open, setOpen] = React.useState(false);
  const addMutation = useAddProductSupplier(product.id);

  const form = useForm({
    resolver: zodResolver(supplierSchema),
    defaultValues: { supplierId: '', supplierSku: '', supplierPrice: 0 },
  });

  const onSubmit = async (values: any) => {
    await addMutation.mutateAsync(values);
    setOpen(false);
    form.reset();
  };

  const columns = [
    { accessorKey: 'supplier.companyName', header: 'Supplier Name', cell: ({ row }: any) => row.original.supplier?.companyName || 'Unknown' },
    { accessorKey: 'supplierSku', header: 'Supplier SKU' },
    { accessorKey: 'supplierPrice', header: 'Price', cell: ({ row }: any) => `$${Number(row.original.supplierPrice).toFixed(2)}` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Suppliers</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Icons.add className="mr-2 h-4 w-4" /> Add Supplier Mapping</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Supplier Mapping</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="supplierId" render={({ field }) => (
                  <FormItem><FormLabel>Supplier ID</FormLabel><FormControl><Input {...field} value={field.value as string | number} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="supplierSku" render={({ field }) => (
                  <FormItem><FormLabel>Supplier SKU</FormLabel><FormControl><Input {...field} value={field.value as string | number} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="supplierPrice" render={({ field }) => (
                  <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value as string | number} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={addMutation.isPending}>
                  {addMutation.isPending ? 'Saving...' : 'Save Mapping'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={product.suppliers || []} searchKey="supplierSku" searchPlaceholder="Search..." />
    </div>
  );
}
