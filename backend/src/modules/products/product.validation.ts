import { z } from 'zod';

export const createProductSchema = z
  .object({
    sku: z.string().min(3, { message: 'SKU must be at least 3 characters long' }),
    barcode: z.string().optional().nullable(),
    name: z.string().min(2, { message: 'Product name must be at least 2 characters long' }),
    description: z.string().optional().nullable(),
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
    reorderLevel: z.coerce
      .number()
      .int()
      .nonnegative({ message: 'Reorder level must be a non-negative integer' })
      .default(0),
    brand: z.string().optional().nullable(),
    supplierId: z.string().uuid({ message: 'Invalid Supplier ID format' }).optional().nullable(),
    categoryId: z.string().uuid({ message: 'Invalid Category ID format' }),
    imageUrl: z.string().optional().nullable(),
    status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).default('ACTIVE'),
    qrCode: z.string().optional().nullable(),
    hasVariants: z.boolean().default(false),
    isBundle: z.boolean().default(false),
    baseUnit: z.string().default('pcs'),
  })
  .refine((data) => data.sellingPrice >= data.costPrice, {
    message: 'Selling price cannot be less than cost price',
    path: ['sellingPrice'],
  });

export const updateProductSchema = z.object({
  sku: z.string().min(3).optional(),
  barcode: z.string().optional().nullable(),
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  costPrice: z.coerce.number().positive().optional(),
  sellingPrice: z.coerce.number().positive().optional(),
  taxRate: z.coerce.number().nonnegative().optional(),
  weight: z.coerce.number().positive().optional(),
  minimumStock: z.coerce.number().int().nonnegative().optional(),
  maximumStock: z.coerce.number().int().positive().optional(),
  reorderLevel: z.coerce.number().int().nonnegative().optional(),
  brand: z.string().optional().nullable(),
  supplierId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid().optional(),
  imageUrl: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).optional(),
  qrCode: z.string().optional().nullable(),
  hasVariants: z.boolean().optional(),
  isBundle: z.boolean().optional(),
  baseUnit: z.string().optional(),
});

export const productIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid Product ID format, must be a valid UUID' }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const addBundleItemSchema = z.object({
  componentProductId: z.string().uuid(),
  quantity: z.coerce.number().int().positive(),
});

export const addImageSchema = z.object({
  url: z.string().url(),
  isPrimary: z.boolean().default(false),
});
