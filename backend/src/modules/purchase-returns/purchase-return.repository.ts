import prisma from '../../infra/database/prisma';

export class PurchaseReturnRepository {
  async findAll(organizationId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.purchaseReturn.findMany({
        where: { organizationId, deletedAt: null },
        include: {
          supplier: { select: { companyName: true } },
          items: { include: { product: { select: { name: true, sku: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.purchaseReturn.count({ where: { organizationId, deletedAt: null } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string, organizationId: string) {
    return prisma.purchaseReturn.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        supplier: { select: { companyName: true, email: true } },
        purchaseOrder: { select: { poNumber: true } },
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
    purchaseOrderId: string;
    supplierId: string;
    reason?: string;
    notes?: string;
    totalAmount: number;
    createdBy: string;
    items: Array<{ productId: string; variantId?: string; quantity: number; unitPrice: number; totalAmount: number }>;
  }) {
    return prisma.purchaseReturn.create({
      data: {
        organizationId,
        returnNumber: data.returnNumber,
        purchaseOrderId: data.purchaseOrderId,
        supplierId: data.supplierId,
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
    return prisma.purchaseReturn.update({
      where: { id },
      data: { status, approvedBy },
    });
  }

  async getNextReturnNumber(organizationId: string) {
    const count = await prisma.purchaseReturn.count({ where: { organizationId } });
    return `PR-${String(count + 1).padStart(4, '0')}`;
  }
}
