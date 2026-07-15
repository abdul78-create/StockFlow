import { z } from 'zod';

export const createSupplierSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  gst: z.string().optional().or(z.literal('')),
  paymentTerms: z.string().optional().or(z.literal('')),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const supplierIdParamSchema = z.object({
  id: z.string().uuid('Invalid supplier ID format'),
});
