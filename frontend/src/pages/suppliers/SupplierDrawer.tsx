import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateSupplier, useUpdateSupplier } from '@/lib/hooks/useSuppliers';
import { SupplierFormValues, Supplier } from '@/lib/types/supplier';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const supplierSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

interface SupplierDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
}

export function SupplierDrawer({ open, onOpenChange, supplier }: SupplierDrawerProps) {
  const isEditing = !!supplier;
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier(supplier?.id || '');
  const [showConfirm, setShowConfirm] = React.useState(false);

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      companyName: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      if (supplier) {
        form.reset({
          companyName: supplier.companyName,
          email: supplier.email || '',
          phone: supplier.phone || '',
          address: supplier.address || '',
        });
      } else {
        form.reset({
          companyName: '',
          email: '',
          phone: '',
          address: '',
        });
      }
    }
  }, [open, supplier, form]);

  const onSubmit = async (data: SupplierFormValues) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(data);
        toast.success('Supplier updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Supplier created successfully');
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} supplier`);
    }
  };
  
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && form.formState.isDirty) {
      setShowConfirm(true);
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Supplier' : 'Create Supplier'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Update the details of this supplier.' : 'Add a new supplier to the procurement network.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Acme Supply Co." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="contact@acme.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1-555-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Physical Address</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Full street address..." 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Supplier')}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to discard them?"
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
        variant="destructive"
        onConfirm={() => {
          setShowConfirm(false);
          form.reset();
          onOpenChange(false);
        }}
      />
    </Sheet>
  );
}
