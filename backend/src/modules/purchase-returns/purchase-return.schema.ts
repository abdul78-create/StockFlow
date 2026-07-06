import { z } from 'zod';

export const createPurchaseReturnSchema = z.object({
  purchaseOrderId: z.string().uuid(),
  supplierId: z.string().uuid(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
  })).min(1),
});

export const updatePurchaseReturnStatusSchema = z.object({
  status: z.enum(['APPROVED', 'COMPLETED', 'CANCELLED']),
});

export type CreatePurchaseReturnInput = z.infer<typeof createPurchaseReturnSchema>;
