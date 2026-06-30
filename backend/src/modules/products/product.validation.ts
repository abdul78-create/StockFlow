import { z } from 'zod';

export const createProductSchema = z
  .object({
    sku: z.string().min(3, { message: 'SKU must be at least 3 characters long' }),
    barcode: z.string().optional(),
    name: z.string().min(2, { message: 'Product name must be at least 2 characters long' }),
    description: z.string().optional(),
    costPrice: z.coerce.number().positive({ message: 'Cost price must be a positive number' }),
    sellingPrice: z.coerce
      .number()
      .positive({ message: 'Selling price must be a positive number' }),
    taxRate: z.coerce
      .number()
      .nonnegative({ message: 'Tax rate must be a non-negative number' })
      .default(0),
    weight: z.coerce.number().positive({ message: 'Weight must be a positive number' }).optional(),
    minimumStock: z.coerce
      .number()
      .int()
      .nonnegative({ message: 'Minimum stock must be a non-negative integer' })
      .default(0),
    maximumStock: z.coerce
      .number()
      .int()
      .positive({ message: 'Maximum stock must be a positive integer' })
      .default(100),
    categoryId: z.string().uuid({ message: 'Invalid Category ID format' }),
    supplierId: z.string().uuid({ message: 'Invalid Supplier ID format' }).optional(),
    imageUrl: z.string().url({ message: 'Invalid Image URL format' }).optional(),
    status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).default('ACTIVE'),
  })
  .refine((data) => data.sellingPrice >= data.costPrice, {
    message: 'Selling price cannot be less than cost price',
    path: ['sellingPrice'],
  });

export const updateProductSchema = z.object({
  sku: z.string().min(3).optional(),
  barcode: z.string().optional(),
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  costPrice: z.coerce.number().positive().optional(),
  sellingPrice: z.coerce.number().positive().optional(),
  taxRate: z.coerce.number().nonnegative().optional(),
  weight: z.coerce.number().positive().optional(),
  minimumStock: z.coerce.number().int().nonnegative().optional(),
  maximumStock: z.coerce.number().int().positive().optional(),
  categoryId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  imageUrl: z.string().url().optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
});

export const productIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid Product ID format, must be a valid UUID' }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
