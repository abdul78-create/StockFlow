import { useState } from 'react';
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
import { PurchaseOrder, useReceivePurchaseOrder } from '@/lib/hooks/usePurchaseOrders';
import { useWarehouses } from '@/lib/hooks/useInventory';

const formSchema = z.object({
  warehouseId: z.string().min(1, 'Warehouse is required'),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      productName: z.string(),
      variantName: z.string().optional(),
      orderedQuantity: z.number(),
      previouslyReceived: z.number(),
      quantity: z.number().min(0, 'Quantity cannot be negative'),
    })
  ).refine(
    (items) => items.some((item) => item.quantity > 0),
    'Must receive at least one item'
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface ReceiveGoodsDrawerProps {
  po: PurchaseOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceiveGoodsDrawer({ po, open, onOpenChange }: ReceiveGoodsDrawerProps) {
  const { data: warehousesData } = useWarehouses();
  const receiveMutation = useReceivePurchaseOrder();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      warehouseId: '',
      items: po.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product?.name || 'Unknown Product',
        variantName: item.variant?.name,
        orderedQuantity: item.quantity,
        previouslyReceived: item.receivedQuantity || 0,
        quantity: Math.max(0, item.quantity - (item.receivedQuantity || 0)), // default to remaining
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const onSubmit = (values: FormValues) => {
    const itemsToReceive = values.items
      .filter((item) => item.quantity > 0)
      .map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      }));

    receiveMutation.mutate(
      {
        id: po.id,
        warehouseId: values.warehouseId,
        items: itemsToReceive,
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
          <SheetTitle>Receive Goods</SheetTitle>
          <SheetDescription>
            Record inbound stock for {po.poNumber}. Select the destination warehouse and specify quantities received.
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
                    <FormLabel>Destination Warehouse</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select warehouse" />
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
                <h4 className="text-sm font-medium leading-none">Items to Receive</h4>
                {fields.map((field, index) => {
                  const remaining = field.orderedQuantity - field.previouslyReceived;
                  return (
                    <div key={field.id} className="grid gap-2 border rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-medium">{field.productName}</div>
                          {field.variantName && <div className="text-xs text-muted-foreground mt-0.5 text-emerald-600">Variant: {field.variantName}</div>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {field.previouslyReceived} / {field.orderedQuantity} Received
                        </div>
                      </div>
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field: inputField }) => (
                          <FormItem className="grid grid-cols-[1fr,auto] items-center gap-4">
                            <FormLabel className="text-xs text-muted-foreground m-0 leading-normal">
                              Quantity to Receive
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                className="w-24 h-8"
                                min="0"
                                max={remaining}
                                {...inputField}
                                onChange={(e) => inputField.onChange(parseInt(e.target.value, 10) || 0)}
                              />
                            </FormControl>
                            <FormMessage className="col-span-2" />
                          </FormItem>
                        )}
                      />
                    </div>
                  );
                })}
              </div>

              {form.formState.errors.items?.root?.message && (
                <div className="text-sm font-medium text-destructive">
                  {form.formState.errors.items.root.message}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={receiveMutation.isPending}>
                  {receiveMutation.isPending ? 'Processing...' : 'Confirm Receipt'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
