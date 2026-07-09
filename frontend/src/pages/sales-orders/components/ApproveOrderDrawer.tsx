import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
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
import { SalesOrder, useUpdateSalesOrderStatus } from '@/lib/hooks/useSalesOrders';
import { useWarehouses } from '@/lib/hooks/useInventory';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const formSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface ApproveOrderDrawerProps {
  so: SalesOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApproveOrderDrawer({ so, open, onOpenChange }: ApproveOrderDrawerProps) {
  const { data: warehousesData } = useWarehouses({ limit: 100 });
  const updateStatus = useUpdateSalesOrderStatus();
  const [showConfirm, setShowConfirm] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      warehouseId: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    updateStatus.mutate(
      {
        id: so.id,
        status: 'APPROVED',
        warehouseId: values.warehouseId,
      },
      {
        onSuccess: () => {
          toast.success('Order approved successfully');
          onOpenChange(false);
          form.reset();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Failed to approve order');
        }
      }
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && form.formState.isDirty) {
      setShowConfirm(true);
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Approve Order</SheetTitle>
          <SheetDescription>
            Select the warehouse from which stock will be allocated for {so.soNumber}.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="warehouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allocation Warehouse</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select warehouse for allocation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {warehousesData?.map((wh) => (
                          <SelectItem key={wh.id} value={wh.id}>
                            {wh.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button variant="outline" type="button" onClick={() => handleOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateStatus.isPending}>
                  {updateStatus.isPending ? 'Approving...' : 'Confirm Approval'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
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
