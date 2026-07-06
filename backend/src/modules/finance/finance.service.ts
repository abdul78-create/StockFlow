import { FinanceRepository } from './finance.repository';
import prisma from '../../infra/database/prisma';
import { Prisma } from '@prisma/client';

export class FinanceService {
  private repository: FinanceRepository;

  constructor() {
    this.repository = new FinanceRepository();
  }

  async createInvoice(organizationId: string, data: any) {
    // Fetch organization tax rules to compute tax amounts
    const taxRules = await prisma.taxRule.findMany({ where: { organizationId } });
    
    let totalTax = 0;
    const computedItems = data.items.map((item: any) => {
      let taxAmount = 0;
      if (item.taxRuleId) {
        const rule = taxRules.find(r => r.id === item.taxRuleId);
        if (rule) {
          // taxAmount = (quantity * unitPrice) * (rate / 100)
          taxAmount = Number((item.quantity * item.unitPrice * (Number(rule.rate) / 100)).toFixed(2));
        }
      }
      const lineTotal = item.quantity * item.unitPrice + taxAmount;
      totalTax += taxAmount;
      return {
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRuleId: item.taxRuleId || null,
        taxAmount,
        totalAmount: lineTotal,
      };
    });

    const subtotal = data.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const grandTotal = subtotal + totalTax;

    const count = await prisma.invoice.count({ where: { organizationId } });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const invoiceData = {
      customerId: data.customerId,
      salesOrderId: data.salesOrderId || null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      notes: data.notes || null,
      organizationId,
      invoiceNumber,
      totalAmount: grandTotal,
      balanceDue: grandTotal,
      items: computedItems
    };

    return prisma.invoice.create({
      data: {
        ...invoiceData,
        items: {
          create: invoiceData.items
        }
      },
      include: {
        items: {
          include: { product: true }
        },
        customer: true,
        salesOrder: true
      }
    });
  }

  async getInvoices(organizationId: string) {
    return this.repository.getInvoices(organizationId);
  }

  async getInvoiceById(id: string, organizationId: string) {
    const invoice = await this.repository.getInvoiceById(id, organizationId);
    if (!invoice) throw new Error('Invoice not found');
    return invoice;
  }

  async createBill(organizationId: string, data: any) {
    const totalAmount = data.items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    
    const count = await prisma.bill.count({ where: { organizationId } });
    const billNumber = `BILL-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const billData = {
      ...data,
      organizationId,
      billNumber,
      totalAmount,
      balanceDue: totalAmount,
      items: data.items.map((item: any) => ({
        ...item,
        totalAmount: item.quantity * item.unitPrice
      }))
    };

    return this.repository.createBill(billData);
  }

  async getBills(organizationId: string) {
    return this.repository.getBills(organizationId);
  }

  async getBillById(id: string, organizationId: string) {
    const bill = await this.repository.getBillById(id, organizationId);
    if (!bill) throw new Error('Bill not found');
    return bill;
  }

  async recordPaymentReceived(organizationId: string, data: any) {
    const invoice = await this.getInvoiceById(data.invoiceId, organizationId);
    
    if (Number(invoice.balanceDue) < data.amount) {
      throw new Error('Payment amount exceeds balance due');
    }

    const newBalance = Number(invoice.balanceDue) - data.amount;
    let newStatus = invoice.status;

    if (newBalance <= 0) {
      newStatus = 'PAID';
    } else if (newBalance < Number(invoice.totalAmount)) {
      newStatus = 'PARTIAL';
    }

    // Wrap in transaction
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const payment = await tx.paymentReceived.create({
        data: {
          ...data,
          organizationId,
          customerId: invoice.customerId
        }
      });

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          balanceDue: newBalance,
          status: newStatus
        }
      });

      return payment;
    });
  }

  async recordPaymentMade(organizationId: string, data: any) {
    const bill = await this.getBillById(data.billId, organizationId);
    
    if (Number(bill.balanceDue) < data.amount) {
      throw new Error('Payment amount exceeds balance due');
    }

    const newBalance = Number(bill.balanceDue) - data.amount;
    let newStatus = bill.status;

    if (newBalance <= 0) {
      newStatus = 'PAID';
    } else if (newBalance < Number(bill.totalAmount)) {
      newStatus = 'PARTIAL';
    }

    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const payment = await tx.paymentMade.create({
        data: {
          ...data,
          organizationId,
          supplierId: bill.supplierId
        }
      });

      await tx.bill.update({
        where: { id: bill.id },
        data: {
          balanceDue: newBalance,
          status: newStatus
        }
      });

      return payment;
    });
  }
}
