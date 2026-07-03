import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Icons } from '@/lib/icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';

const imageSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  isPrimary: z.boolean().default(false),
});

export function ProductImagesTab({ product }: { product: any }) {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await api.post(`/products/${product.id}/images`, values);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', product.id] });
    },
  });

  const form = useForm({
    resolver: zodResolver(imageSchema),
    defaultValues: { url: '', isPrimary: false },
  });

  const onSubmit = async (values: any) => {
    await addMutation.mutateAsync(values);
    setOpen(false);
    form.reset();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Images</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Icons.add className="mr-2 h-4 w-4" /> Add Image</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Product Image</DialogTitle></DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="url" render={({ field }) => (
                  <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://example.com/image.jpg" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="isPrimary" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Set as Primary Image</FormLabel>
                    </div>
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" disabled={addMutation.isPending}>
                  {addMutation.isPending ? 'Saving...' : 'Add Image'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {(!product.images || product.images.length === 0) ? (
        <div className="text-center p-8 border rounded-lg bg-muted/20">
          <Icons.products className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-semibold">No images</h3>
          <p className="text-muted-foreground text-sm">Add an image to display it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {product.images.map((img: any) => (
            <Card key={img.id} className={img.isPrimary ? 'border-primary' : ''}>
              <CardContent className="p-2 relative aspect-square">
                {img.isPrimary && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded shadow-sm z-10">
                    Primary
                  </div>
                )}
                <img src={img.url} alt="Product" className="w-full h-full object-cover rounded-sm" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
