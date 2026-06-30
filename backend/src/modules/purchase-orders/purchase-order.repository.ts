import prisma from '../../infra/database/prisma';
import { PurchaseOrder, Prisma, PurchaseOrderStatus } from '@prisma/client';
import { ParsedQuery } from '../../common/utils/query';
import { CreatePOInput } from './purchase-order.validation';

export class PurchaseOrderRepository {
  async findAll(
    organizationId: string,
    query: ParsedQuery,
    status?: PurchaseOrderStatus,
  ): Promise<{ orders: PurchaseOrder[]; total: number }> {
    const whereClause: Prisma.PurchaseOrderWhereInput = {
      organizationId,
      deletedAt: null,
    };

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
  ): Promise<PurchaseOrder> {
    return prisma.purchaseOrder.create({
      data: {
        poNumber: input.poNumber,
        supplierId: input.supplierId,
        organizationId,
        status: 'DRAFT',
        totalAmount,
        items: {
          create: input.items.map((item) => ({
            productId: item.productId,
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
  ): Promise<void> {
    await tx.purchaseOrderItem.update({
      where: { id: itemId },
      data: { receivedQuantity },
    });
  }
}
