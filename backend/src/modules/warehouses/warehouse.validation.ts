import { z } from 'zod';

export const createWarehouseSchema = z.object({
  name: z.string().min(2, 'Warehouse name must be at least 2 characters'),
  address: z.string().optional().or(z.literal('')),
});

export const updateWarehouseSchema = createWarehouseSchema.partial();

export const warehouseIdParamSchema = z.object({
  id: z.string().uuid('Invalid warehouse ID format'),
});
