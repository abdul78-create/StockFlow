import prisma from '../../infra/database/prisma';

export class SalesReturnRepository {
  async findAll(organizationId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.salesReturn.findMany({
        where: { organizationId, deletedAt: null },
        include: {
          customer: { select: { name: true } },
          items: { include: { product: { select: { name: true, sku: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.salesReturn.count({ where: { organizationId, deletedAt: null } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string, organizationId: string) {
    return prisma.salesReturn.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        customer: { select: { name: true, email: true } },
        salesOrder: { select: { soNumber: true } },
        items: {
          include: {
            product: { select: { name: true, sku: true } },
            variant: { select: { name: true, sku: true } },
          },
        },
      },
    });
  }

  async create(organizationId: string, data: {
    returnNumber: string;
    salesOrderId: string;
    customerId: string;
    reason?: string;
    notes?: string;
    totalAmount: number;
    createdBy: string;
    items: Array<{ productId: string; variantId?: string; quantity: number; unitPrice: number; totalAmount: number }>;
  }) {
    return prisma.salesReturn.create({
      data: {
        organizationId,
        returnNumber: data.returnNumber,
        salesOrderId: data.salesOrderId,
        customerId: data.customerId,
        reason: data.reason,
        notes: data.notes,
        totalAmount: data.totalAmount,
        createdBy: data.createdBy,
        items: { create: data.items },
      },
      include: { items: true },
    });
  }

  async updateStatus(id: string, status: string, approvedBy?: string) {
    return prisma.salesReturn.update({ where: { id }, data: { status, approvedBy } });
  }

  async getNextReturnNumber(organizationId: string) {
    const count = await prisma.salesReturn.count({ where: { organizationId } });
    return `SR-${String(count + 1).padStart(4, '0')}`;
  }
}
