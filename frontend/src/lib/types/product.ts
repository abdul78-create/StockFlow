import { z } from 'zod';

export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  costPrice: number;
  sellingPrice: number;
  taxRate?: number;
  weight?: number;
  minimumStock: number;
  maximumStock: number;
  categoryId: string;
  supplierId?: string;
  status: ProductStatus;
  currentStock: number; // Computed or fetched from inventory
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

// Zod schemas for forms
export const productSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  costPrice: z.coerce.number().min(0, 'Cost price must be positive'),
  sellingPrice: z.coerce.number().min(0, 'Selling price must be positive'),
  taxRate: z.coerce.number().min(0).optional(),
  weight: z.coerce.number().min(0).optional(),
  minimumStock: z.coerce.number().int().min(0),
  maximumStock: z.coerce.number().int().min(0),
  categoryId: z.string().min(1, 'Category is required'),
  supplierId: z.string().optional(),
}).refine((data) => data.sellingPrice >= data.costPrice, {
  message: "Selling price cannot be lower than cost price",
  path: ["sellingPrice"],
}).refine((data) => data.maximumStock >= data.minimumStock, {
  message: "Maximum stock must be greater than or equal to minimum stock",
  path: ["maximumStock"],
});

export type ProductFormValues = z.infer<typeof productSchema>;

// API Response types
export interface PaginatedProducts {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
