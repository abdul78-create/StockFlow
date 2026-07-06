import { z } from 'zod';

export const createCycleCountSchema = z.object({
  warehouseId: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  assignedTo: z.string().uuid().optional(),
});

export const updateCycleCountItemSchema = z.object({
  actualQuantity: z.number().int().min(0, 'Actual quantity must be non-negative'),
  notes: z.string().optional(),
});

export const cycleCountIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const itemIdParamSchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
});
