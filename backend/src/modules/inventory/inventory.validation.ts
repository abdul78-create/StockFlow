import { z } from 'zod';

export const adjustStockSchema = z.object({
  productId: z.string().uuid({ message: 'Invalid Product ID format' }),
  warehouseId: z.string().uuid({ message: 'Invalid Warehouse ID format' }),
  quantityDelta: z.coerce
    .number()
    .int()
    .refine((val) => val !== 0, {
      message: 'Quantity delta must be a non-zero integer',
    }),
  reason: z.string().min(3, { message: 'Reason must be at least 3 characters long' }),
});

export const receiveStockSchema = z.object({
  productId: z.string().uuid({ message: 'Invalid Product ID format' }),
  warehouseId: z.string().uuid({ message: 'Invalid Warehouse ID format' }),
  quantity: z.coerce
    .number()
    .int()
    .positive({ message: 'Receive quantity must be a positive integer' }),
  reason: z.string().min(3, { message: 'Reason must be at least 3 characters long' }).optional(),
});

export const dispatchStockSchema = z.object({
  productId: z.string().uuid({ message: 'Invalid Product ID format' }),
  warehouseId: z.string().uuid({ message: 'Invalid Warehouse ID format' }),
  quantity: z.coerce
    .number()
    .int()
    .positive({ message: 'Dispatch quantity must be a positive integer' }),
  reason: z.string().min(3, { message: 'Reason must be at least 3 characters long' }).optional(),
});

export const transferStockSchema = z
  .object({
    productId: z.string().uuid({ message: 'Invalid Product ID format' }),
    fromWarehouseId: z.string().uuid({ message: 'Invalid source Warehouse ID format' }),
    toWarehouseId: z.string().uuid({ message: 'Invalid destination Warehouse ID format' }),
    quantity: z.coerce
      .number()
      .int()
      .positive({ message: 'Transfer quantity must be a positive integer' }),
    reason: z.string().min(3, { message: 'Reason must be at least 3 characters long' }).optional(),
  })
  .refine((data) => data.fromWarehouseId !== data.toWarehouseId, {
    message: 'Source and destination warehouses must be different',
    path: ['toWarehouseId'],
  });

export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type ReceiveStockInput = z.infer<typeof receiveStockSchema>;
export type DispatchStockInput = z.infer<typeof dispatchStockSchema>;
export type TransferStockInput = z.infer<typeof transferStockSchema>;
