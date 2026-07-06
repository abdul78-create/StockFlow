import { z } from 'zod';

export const createQuotationSchema = z.object({
  customerId: z.string().uuid(),
  validUntil: z.string().datetime().optional(),
  notes: z.string().optional(),
  discountAmount: z.number().min(0).default(0),
  items: z.array(z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    discount: z.number().min(0).default(0),
  })).min(1),
});

export const updateQuotationStatusSchema = z.object({
  status: z.enum(['SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
