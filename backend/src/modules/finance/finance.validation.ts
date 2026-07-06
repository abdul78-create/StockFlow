import { z } from 'zod';

export const createInvoiceSchema = z.object({
  salesOrderId: z.string().uuid().optional(),
  customerId: z.string().uuid(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
    taxRuleId: z.string().uuid().optional(),
  })).min(1),
});

export const createBillSchema = z.object({
  purchaseOrderId: z.string().uuid().optional(),
  supplierId: z.string().uuid(),
  dueDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive(),
  })).min(1),
});

export const createPaymentReceivedSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.string().min(1),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const createPaymentMadeSchema = z.object({
  billId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.string().min(1),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});
