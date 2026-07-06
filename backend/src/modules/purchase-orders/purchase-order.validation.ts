import { z } from 'zod';

export const createPOSchema = z.object({
  poNumber: z.string().min(3, { message: 'PO Number must be at least 3 characters long' }),
  supplierId: z.string().uuid({ message: 'Invalid Supplier ID format' }),
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
    .min(1, { message: 'Purchase Order must contain at least 1 item' }),
  shippingCost: z.coerce.number().min(0).optional(),
  taxAmount: z.coerce.number().min(0).optional(),
  otherCosts: z.coerce.number().min(0).optional(),
  expectedDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const updatePOStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED']),
});

export const receiveGoodsSchema = z.object({
  warehouseId: z.string().uuid({ message: 'Invalid Warehouse ID format' }),
  items: z
    .array(
      z.object({
        productId: z.string().uuid({ message: 'Invalid Product ID format' }),
        variantId: z.string().uuid({ message: 'Invalid Variant ID format' }).optional(),
        quantity: z.coerce
          .number()
          .int()
          .positive({ message: 'Received quantity must be a positive integer' }),
        batchNumber: z.string().optional(),
        manufacturingDate: z.coerce.date().optional(),
        expiryDate: z.coerce.date().optional(),
      }),
    )
    .min(1, { message: 'Must receive at least 1 product item' }),
});

export const poIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid Purchase Order ID format, must be a valid UUID' }),
});

export type CreatePOInput = z.infer<typeof createPOSchema>;
export type UpdatePOStatusInput = z.infer<typeof updatePOStatusSchema>;
export type ReceiveGoodsInput = z.infer<typeof receiveGoodsSchema>;
