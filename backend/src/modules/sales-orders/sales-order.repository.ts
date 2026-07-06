import prisma from '../../infra/database/prisma';
import { SalesOrder, Prisma, SalesOrderStatus } from '@prisma/client';
import { ParsedQuery } from '../../common/utils/query';
import { CreateSOInput } from './sales-order.validation';

export class SalesOrderRepository {
  async findAll(
    organizationId: string,
    query: ParsedQuery,
    status?: SalesOrderStatus,
    customerId?: string,
  ): Promise<{ orders: SalesOrder[]; total: number }> {
    const whereClause: Prisma.SalesOrderWhereInput = {
      organizationId,
      deletedAt: null,
    };

    if (customerId) {
      whereClause.customerId = customerId;
    }

    if (status) {
      whereClause.status = status;
    }

    if (query.search) {
      whereClause.soNumber = { contains: query.search, mode: 'insensitive' };
    }

    const [orders, total] = await prisma.$transaction([
      prisma.salesOrder.findMany({
        where: whereClause,
        include: {
          customer: true,
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
      prisma.salesOrder.count({ where: whereClause }),
    ]);

    return { orders, total };
  }

  async findById(organizationId: string, id: string): Promise<SalesOrder | null> {
    return prisma.salesOrder.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
  }

  async findBySoNumber(organizationId: string, soNumber: string): Promise<SalesOrder | null> {
    return prisma.salesOrder.findFirst({
      where: {
        soNumber,
        organizationId,
        deletedAt: null,
      },
    });
  }

  async create(
    organizationId: string,
    input: CreateSOInput,
    totalAmount: number,
  ): Promise<SalesOrder> {
    return prisma.salesOrder.create({
      data: {
        soNumber: input.soNumber,
        customerId: input.customerId,
        organizationId,
        status: 'DRAFT',
        totalAmount,
        shippingCost: input.shippingCost || 0,
        taxAmount: input.taxAmount || 0,
        discountAmount: input.discountAmount || 0,
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
    status: SalesOrderStatus,
    tx?: Prisma.TransactionClient,
  ): Promise<SalesOrder> {
    const client = tx || prisma;
    return client.salesOrder.update({
      where: {
        id,
        organizationId,
      },
      data: {
        status,
      },
    });
  }

  async updateItemShippedQuantity(
    tx: Prisma.TransactionClient,
    itemId: string,
    shippedQuantity: number,
    cogs?: number,
  ): Promise<void> {
    await tx.salesOrderItem.update({
      where: { id: itemId },
      data: { shippedQuantity, cogs },
    });
  }
}
