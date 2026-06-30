import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(2, { message: 'Customer name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Invalid email address format' }).optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  gst: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  gst: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

export const customerIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid Customer ID format, must be a valid UUID' }),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
