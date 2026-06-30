import { useForm, useFieldArray } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
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
import { SalesOrder, useDispatchSalesOrder } from '@/lib/hooks/useSalesOrders';
import { useWarehouses } from '@/lib/hooks/useInventory';

const formSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface DispatchOrderDrawerProps {
  so: SalesOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DispatchOrderDrawer({ so, open, onOpenChange }: DispatchOrderDrawerProps) {
  const { data: warehousesData } = useWarehouses({ limit: 100 });
  const dispatchMutation = useDispatchSalesOrder();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      warehouseId: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    dispatchMutation.mutate(
      {
        id: so.id,
        warehouseId: values.warehouseId,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          form.reset();
        },
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Dispatch Order</SheetTitle>
          <SheetDescription>
            Select the warehouse from which stock will be deducted for {so.soNumber}.
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
                    <FormLabel>Source Warehouse</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select warehouse to dispatch from" />
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

              <div className="space-y-4">
                <h4 className="text-sm font-medium leading-none">Items to Dispatch</h4>
                {so.items.map((item) => {
                  return (
                    <div key={item.id} className="grid gap-2 border rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-medium">{item.product?.name}</div>
                        <div className="text-sm font-semibold">
                          Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={dispatchMutation.isPending}>
                  {dispatchMutation.isPending ? 'Processing...' : 'Confirm Dispatch'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
