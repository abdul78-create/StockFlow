import { PrismaClient } from '@prisma/client';
import prisma from '../../infra/database/prisma';

export class FinanceRepository {
  // Invoices
  async createInvoice(data: any) {
    return prisma.invoice.create({
      data: {
        ...data,
        items: {
          create: data.items
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
        salesOrder: true
      }
    });
  }

  async getInvoices(organizationId: string) {
    return prisma.invoice.findMany({
      where: { organizationId },
      include: {
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getInvoiceById(id: string, organizationId: string) {
    return prisma.invoice.findFirst({
      where: { id, organizationId },
      include: {
        items: {
          include: { product: true }
        },
        customer: true,
        salesOrder: true,
        payments: true
      }
    });
  }

  async updateInvoiceStatus(id: string, status: any) {
    return prisma.invoice.update({
      where: { id },
      data: { status }
    });
  }

  async updateInvoiceBalance(id: string, newBalance: number) {
    return prisma.invoice.update({
      where: { id },
      data: { balanceDue: newBalance }
    });
  }

  // Bills
  async createBill(data: any) {
    return prisma.bill.create({
      data: {
        ...data,
        items: {
          create: data.items
        }
      },
      include: {
        items: {
          include: { product: true }
        },
        supplier: true,
        purchaseOrder: true
      }
    });
  }

  async getBills(organizationId: string) {
    return prisma.bill.findMany({
      where: { organizationId },
      include: {
        supplier: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getBillById(id: string, organizationId: string) {
    return prisma.bill.findFirst({
      where: { id, organizationId },
      include: {
        items: {
          include: { product: true }
        },
        supplier: true,
        purchaseOrder: true,
        payments: true
      }
    });
  }

  async updateBillStatus(id: string, status: any) {
    return prisma.bill.update({
      where: { id },
      data: { status }
    });
  }

  async updateBillBalance(id: string, newBalance: number) {
    return prisma.bill.update({
      where: { id },
      data: { balanceDue: newBalance }
    });
  }

  // Payments
  async createPaymentReceived(data: any) {
    return prisma.paymentReceived.create({
      data
    });
  }

  async createPaymentMade(data: any) {
    return prisma.paymentMade.create({
      data
    });
  }
}
