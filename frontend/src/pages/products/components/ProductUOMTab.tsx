import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAddProductUnit } from '@/lib/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Icons } from '@/lib/icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const unitSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  conversionRatio: z.coerce.number().positive('Ratio must be positive'),
});

export function ProductUOMTab({ product }: { product: any }) {
  const [open, setOpen] = React.useState(false);
  const addMutation = useAddProductUnit(product.id);

  const form = useForm({
    resolver: zodResolver(unitSchema),
    defaultValues: { name: '', conversionRatio: 1 },
  });

  const onSubmit = async (values: any) => {
    await addMutation.mutateAsync(values);
    setOpen(false);
    form.reset();
  };

  const columns = [
    { accessorKey: 'name', header: 'Unit Name' },
    { accessorKey: 'conversionRatio', header: 'Conversion Ratio (to Base Unit)' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Units of Measure (UOM)</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Icons.add className="mr-2 h-4 w-4" /> Add Unit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Unit of Measure</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Unit Name (e.g. Box, Dozen)</FormLabel><FormControl><Input {...field} value={field.value as string | number} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="conversionRatio" render={({ field }) => (
                  <FormItem><FormLabel>Conversion Ratio</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value as string | number} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={addMutation.isPending}>
                  {addMutation.isPending ? 'Saving...' : 'Save Unit'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={product.units || []} searchKey="name" searchPlaceholder="Search units..." />
    </div>
  );
}