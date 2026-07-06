import { z } from 'zod';

export const createSalesReturnSchema = z.object({
  salesOrderId: z.string().uuid(),
  customerId: z.string().uuid(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
  })).min(1),
});

export type CreateSalesReturnInput = z.infer<typeof createSalesReturnSchema>;
