import prisma from '../../infra/database/prisma';
import { PurchaseOrder, Prisma, PurchaseOrderStatus } from '@prisma/client';
import { ParsedQuery } from '../../common/utils/query';
import { CreatePOInput } from './purchase-order.validation';

export class PurchaseOrderRepository {
  async findAll(
    organizationId: string,
    query: ParsedQuery,
    status?: PurchaseOrderStatus,
    supplierId?: string,
  ): Promise<{ orders: PurchaseOrder[]; total: number }> {
    const whereClause: Prisma.PurchaseOrderWhereInput = {
      organizationId,
      deletedAt: null,
    };

    if (supplierId) {
      whereClause.supplierId = supplierId;
    }

    if (status) {
      whereClause.status = status;
    }

    if (query.search) {
      whereClause.poNumber = { contains: query.search, mode: 'insensitive' };
    }

    const [orders, total] = await prisma.$transaction([
      prisma.purchaseOrder.findMany({
        where: whereClause,
        include: {
          supplier: true,
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
        orderBy: { createdAt: query.order },
        skip: query.skip,
        take: query.limit,
      }),
      prisma.purchaseOrder.count({ where: whereClause }),
    ]);

    return { orders, total };
  }

  async findById(organizationId: string, id: string): Promise<PurchaseOrder | null> {
    return prisma.purchaseOrder.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
  }

  async findByPoNumber(organizationId: string, poNumber: string): Promise<PurchaseOrder | null> {
    return prisma.purchaseOrder.findFirst({
      where: {
        poNumber,
        organizationId,
        deletedAt: null,
      },
    });
  }

  async create(
    organizationId: string,
    input: CreatePOInput,
    totalAmount: number,
    tx?: Prisma.TransactionClient,
  ): Promise<PurchaseOrder> {
    const client = tx || prisma;
    return client.purchaseOrder.create({
      data: {
        poNumber: input.poNumber,
        supplierId: input.supplierId,
        organizationId,
        status: 'DRAFT',
        totalAmount,
        shippingCost: input.shippingCost || 0,
        taxAmount: input.taxAmount || 0,
        otherCosts: input.otherCosts || 0,
        expectedDate: input.expectedDate,
        notes: input.notes,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });
  }

  async updateStatus(
    organizationId: string,
    id: string,
    status: PurchaseOrderStatus,
    tx?: Prisma.TransactionClient,
  ): Promise<PurchaseOrder> {
    const client = tx || prisma;
    return client.purchaseOrder.update({
      where: {
        id,
        organizationId,
      },
      data: {
        status,
      },
    });
  }

  async updateItemReceivedQuantity(
    tx: Prisma.TransactionClient,
    itemId: string,
    receivedQuantity: number,
    landedUnitCost?: number,
  ): Promise<void> {
    const data: any = { receivedQuantity };
    if (landedUnitCost !== undefined) {
      data.landedUnitCost = landedUnitCost;
    }
    await tx.purchaseOrderItem.update({
      where: { id: itemId },
      data,
    });
  }
}
