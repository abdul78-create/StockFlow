import { z } from 'zod';

export const createIntegrationSchema = z.object({
  provider: z.enum(['STRIPE', 'SENDGRID', 'QUICKBOOKS', 'SHOPIFY']),
  category: z.enum(['PAYMENT', 'EMAIL', 'ACCOUNTING', 'E_COMMERCE']),
  config: z.string(), // We'll expect the frontend to send stringified JSON or we'll stringify it
});

export const updateIntegrationSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'ERROR']).optional(),
  config: z.string().optional(),
});
