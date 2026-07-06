import { z } from 'zod';

export const createTaxRuleSchema = z.object({
  name: z.string().min(1),
  taxType: z.enum(['GST', 'VAT', 'SALES_TAX', 'CUSTOM']),
  rate: z.number().min(0).max(100),
  isDefault: z.boolean().optional().default(false),
});

export const updateTaxRuleSchema = z.object({
  name: z.string().min(1).optional(),
  taxType: z.enum(['GST', 'VAT', 'SALES_TAX', 'CUSTOM']).optional(),
  rate: z.number().min(0).max(100).optional(),
  isDefault: z.boolean().optional(),
});
