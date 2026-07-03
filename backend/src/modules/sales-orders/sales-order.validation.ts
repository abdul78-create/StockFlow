import { z } from 'zod';

export const createSOSchema = z.object({
  soNumber: z.string().min(3, { message: 'SO Number must be at least 3 characters long' }),
  customerId: z.string().uuid({ message: 'Invalid Customer ID format' }),
  items: z
    .array(
      z.object({
        productId: z.string().uuid({ message: 'Invalid Product ID format' }),
        variantId: z.string().uuid({ message: 'Invalid Variant ID format' }).optional(),
        quantity: z.coerce
          .number()
          .int()
          .positive({ message: 'Quantity must be a positive integer' }),
        unitPrice: z.coerce.number().positive({ message: 'Unit price must be a positive number' }),
      }),
    )
    .min(1, { message: 'Sales Order must contain at least 1 item' }),
});

export const updateSOStatusSchema = z.object({
  status: z.enum([
    'DRAFT',
    'PENDING',
    'APPROVED',
    'PACKED',
    'DISPATCHED',
    'DELIVERED',
    'CANCELLED',
  ]),
  warehouseId: z.string().uuid().optional(),
});

export const dispatchSOSchema = z.object({
  warehouseId: z.string().uuid({ message: 'Invalid Warehouse ID format' }),
});

export const soIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid Sales Order ID format, must be a valid UUID' }),
});

export type CreateSOInput = z.infer<typeof createSOSchema>;
export type UpdateSOStatusInput = z.infer<typeof updateSOStatusSchema>;
export type DispatchSOInput = z.infer<typeof dispatchSOSchema>;
