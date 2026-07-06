import prisma from '../../infra/database/prisma';

const INCLUDE = {
  customer: { select: { name: true, email: true, phone: true } },
  items: {
    include: {
      product: { select: { name: true, sku: true, imageUrl: true } },
      variant: { select: { name: true, sku: true } },
    },
  },
};

export class QuotationRepository {
  async findAll(organizationId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.quotation.findMany({
        where: { organizationId, deletedAt: null },
        include: { customer: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.quotation.count({ where: { organizationId, deletedAt: null } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string, organizationId: string) {
    return prisma.quotation.findFirst({ where: { id, organizationId, deletedAt: null }, include: INCLUDE });
  }

  async create(data: {
    organizationId: string;
    quoteNumber: string;
    customerId: string;
    validUntil?: string;
    notes?: string;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    createdBy: string;
    items: Array<{ productId: string; variantId?: string; quantity: number; unitPrice: number; discount: number; totalAmount: number }>;
  }) {
    return prisma.quotation.create({
      data: {
        organizationId: data.organizationId,
        quoteNumber: data.quoteNumber,
        customerId: data.customerId,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
        notes: data.notes,
        discountAmount: data.discountAmount,
        taxAmount: data.taxAmount,
        totalAmount: data.totalAmount,
        createdBy: data.createdBy,
        items: { create: data.items },
      },
      include: INCLUDE,
    });
  }

  async updateStatus(id: string, status: string, convertedToSoId?: string) {
    return prisma.quotation.update({ where: { id }, data: { status, convertedToSoId } });
  }

  async getNextQuoteNumber(organizationId: string) {
    const count = await prisma.quotation.count({ where: { organizationId } });
    return `QT-${String(count + 1).padStart(4, '0')}`;
  }

  async expireOverdue() {
    const now = new Date();
    return prisma.quotation.updateMany({
      where: { validUntil: { lt: now }, status: { in: ['DRAFT', 'SENT'] } },
      data: { status: 'EXPIRED' },
    });
  }
}
