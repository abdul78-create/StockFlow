import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateWarehouse, useUpdateWarehouse } from '@/lib/hooks/useWarehouses';
import { WarehouseFormValues, Warehouse } from '@/lib/types/warehouse';
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

const warehouseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
});

interface WarehouseDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouse?: Warehouse | null;
}

export function WarehouseDrawer({ open, onOpenChange, warehouse }: WarehouseDrawerProps) {
  const isEditing = !!warehouse;
  const createMutation = useCreateWarehouse();
  const updateMutation = useUpdateWarehouse(warehouse?.id || '');
  const [showConfirm, setShowConfirm] = React.useState(false);

  const form = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: '',
      address: '',
    },
  });

  // Reset form when drawer opens
  React.useEffect(() => {
    if (open) {
      if (warehouse) {
        form.reset({
          name: warehouse.name,
          address: warehouse.address,
        });
      } else {
        form.reset({
          name: '',
          address: '',
        });
      }
    }
  }, [open, warehouse, form]);

  const onSubmit = async (data: WarehouseFormValues) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(data);
        toast.success('Warehouse updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Warehouse created successfully');
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} warehouse`);
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
          <SheetTitle>{isEditing ? 'Edit Warehouse' : 'Create Warehouse'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Update the details of this physical location.' : 'Add a new physical location to track inventory.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warehouse Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Main Distribution Center" {...field} />
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
                {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Warehouse')}
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
