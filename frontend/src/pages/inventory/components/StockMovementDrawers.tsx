import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAdjustStock, useReceiveStock, useTransferStock, useWarehouses } from '@/lib/hooks/useInventory';
import { useProducts } from '@/lib/hooks/useProducts';
import { Icons } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type DrawerActionType = 'RECEIVE' | 'TRANSFER' | 'ADJUST' | null;

interface StockMovementDrawersProps {
  action: DrawerActionType;
  onClose: () => void;
  defaultWarehouseId?: string;
}

// Zod schemas for validation
const baseSchema = {
  productId: z.string().min(1, 'Product is required'),
  reason: z.string().min(1, 'Reason is required'),
};

const receiveSchema = z.object({
  ...baseSchema,
  warehouseId: z.string().min(1, 'Warehouse is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be positive'),
});

const transferSchema = z.object({
  ...baseSchema,
  fromWarehouseId: z.string().min(1, 'Source warehouse is required'),
  toWarehouseId: z.string().min(1, 'Destination warehouse is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be positive'),
}).refine(data => data.fromWarehouseId !== data.toWarehouseId, {
  message: "Source and destination warehouses cannot be the same",
  path: ["toWarehouseId"],
});

const adjustSchema = z.object({
  ...baseSchema,
  warehouseId: z.string().min(1, 'Warehouse is required'),
  quantityDelta: z.coerce.number().int(), // Can be positive or negative
});

export function StockMovementDrawers({ action, onClose, defaultWarehouseId }: StockMovementDrawersProps) {
  const { data: products } = useProducts({ limit: 100 });
  const { data: warehouses } = useWarehouses();

  const receiveMutation = useReceiveStock();
  const transferMutation = useTransferStock();
  const adjustMutation = useAdjustStock();

  const getResolver = () => {
    switch (action) {
      case 'RECEIVE': return zodResolver(receiveSchema);
      case 'TRANSFER': return zodResolver(transferSchema);
      case 'ADJUST': return zodResolver(adjustSchema);
      default: return undefined;
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: getResolver() as any,
    defaultValues: {
      productId: '',
      warehouseId: defaultWarehouseId || '',
      fromWarehouseId: defaultWarehouseId || '',
      toWarehouseId: '',
      quantity: '',
      quantityDelta: '',
      reason: '',
    },
  });

  // Reset form when action changes
  React.useEffect(() => {
    if (action) reset();
  }, [action, reset]);

  const onSubmit = async (data: any) => {
    try {
      if (action === 'RECEIVE') {
        await receiveMutation.mutateAsync({
          productId: data.productId,
          warehouseId: data.warehouseId,
          quantity: Number(data.quantity),
          reason: data.reason,
        });
      } else if (action === 'TRANSFER') {
        await transferMutation.mutateAsync({
          productId: data.productId,
          fromWarehouseId: data.fromWarehouseId,
          toWarehouseId: data.toWarehouseId,
          quantity: Number(data.quantity),
          reason: data.reason,
        });
      } else if (action === 'ADJUST') {
        await adjustMutation.mutateAsync({
          productId: data.productId,
          warehouseId: data.warehouseId,
          quantityDelta: Number(data.quantityDelta),
          reason: data.reason,
        });
      }
      onClose();
    } catch (e) {
      // Error is handled by mutations' onError
    }
  };

  const isLoading = isSubmitting || receiveMutation.isPending || transferMutation.isPending || adjustMutation.isPending;

  const titles = {
    RECEIVE: 'Receive Stock',
    TRANSFER: 'Transfer Stock',
    ADJUST: 'Adjust Stock',
  };

  const descriptions = {
    RECEIVE: 'Record incoming stock from a supplier or return.',
    TRANSFER: 'Move stock from one warehouse to another.',
    ADJUST: 'Manually correct stock levels (positive or negative).',
  };

  return (
    <Drawer open={!!action} onOpenChange={(open) => !open && onClose()} direction="right">
      <DrawerContent className="h-screen top-0 right-0 left-auto mt-0 w-full sm:w-[500px] rounded-none">
        <DrawerHeader className="border-b border-border text-left">
          <DrawerTitle>{action ? titles[action] : ''}</DrawerTitle>
          <DrawerDescription>{action ? descriptions[action] : ''}</DrawerDescription>
          <DrawerClose asChild className="absolute right-4 top-4">
            <Button variant="ghost" size="icon">
              <Icons.close className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <form id="movement-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
            
            {/* Common: Product Selection */}
            <div className="space-y-2">
              <Label htmlFor="productId">Product <span className="text-destructive">*</span></Label>
              <Select onValueChange={(val) => setValue('productId', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products?.data.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.productId && <p className="text-xs text-destructive">{errors.productId.message as string}</p>}
            </div>

            {/* RECEIVE & ADJUST specific: Warehouse */}
            {(action === 'RECEIVE' || action === 'ADJUST') && (
              <div className="space-y-2">
                <Label htmlFor="warehouseId">Warehouse <span className="text-destructive">*</span></Label>
                <Select onValueChange={(val) => setValue('warehouseId', val)} defaultValue={defaultWarehouseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses?.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.warehouseId && <p className="text-xs text-destructive">{errors.warehouseId.message as string}</p>}
              </div>
            )}

            {/* TRANSFER specific: From and To Warehouses */}
            {action === 'TRANSFER' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromWarehouseId">From Warehouse <span className="text-destructive">*</span></Label>
                  <Select onValueChange={(val) => setValue('fromWarehouseId', val)} defaultValue={defaultWarehouseId}>
                    <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
                    <SelectContent>
                      {warehouses?.map((w) => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.fromWarehouseId && <p className="text-xs text-destructive">{errors.fromWarehouseId.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toWarehouseId">To Warehouse <span className="text-destructive">*</span></Label>
                  <Select onValueChange={(val) => setValue('toWarehouseId', val)}>
                    <SelectTrigger><SelectValue placeholder="Destination" /></SelectTrigger>
                    <SelectContent>
                      {warehouses?.map((w) => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.toWarehouseId && <p className="text-xs text-destructive">{errors.toWarehouseId.message as string}</p>}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor={action === 'ADJUST' ? 'quantityDelta' : 'quantity'}>
                Quantity {action === 'ADJUST' && '(use - for reduction)'} <span className="text-destructive">*</span>
              </Label>
              <Input 
                id={action === 'ADJUST' ? 'quantityDelta' : 'quantity'} 
                type="number" 
                {...register(action === 'ADJUST' ? 'quantityDelta' : 'quantity')} 
                placeholder={action === 'ADJUST' ? "-5 or 10" : "10"} 
              />
              {(errors.quantity || errors.quantityDelta) && (
                <p className="text-xs text-destructive">
                  {(errors.quantity?.message || errors.quantityDelta?.message) as string}
                </p>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason / Reference <span className="text-destructive">*</span></Label>
              <Textarea 
                id="reason" 
                {...register('reason')} 
                placeholder={action === 'RECEIVE' ? "PO #1234" : "Damaged in transit"} 
                className="resize-none h-24" 
              />
              {errors.reason && <p className="text-xs text-destructive">{errors.reason.message as string}</p>}
            </div>

          </form>
        </div>

        <DrawerFooter className="border-t border-border pt-4">
          <Button type="submit" form="movement-form" disabled={isLoading} className="w-full">
            {isLoading && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
            Confirm {action === 'RECEIVE' ? 'Receipt' : action === 'TRANSFER' ? 'Transfer' : 'Adjustment'}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
