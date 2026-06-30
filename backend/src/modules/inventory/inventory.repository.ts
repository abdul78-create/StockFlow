import prisma from '../../infra/database/prisma';
import { Inventory, InventoryTransaction, Prisma, TransactionType } from '@prisma/client';
import { ParsedQuery } from '../../common/utils/query';

export class InventoryRepository {
  async findEntry(warehouseId: string, productId: string): Promise<Inventory | null> {
    return prisma.inventory.findUnique({
      where: {
        warehouseId_productId: {
          warehouseId,
          productId,
        },
      },
    });
  }

  async findAllBalances(
    organizationId: string,
    query: ParsedQuery,
    categoryId?: string,
  ): Promise<{ balances: unknown[]; total: number }> {
    const productWhere: Prisma.ProductWhereInput = {
      organizationId,
      deletedAt: null,
    };

    if (categoryId) {
      productWhere.categoryId = categoryId;
    }

    if (query.search) {
      productWhere.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const whereClause: Prisma.InventoryWhereInput = {
      product: productWhere,
    };

    const [balances, total] = await prisma.$transaction([
      prisma.inventory.findMany({
        where: whereClause,
        include: {
          product: {
            include: {
              category: true,
            },
          },
          warehouse: true,
        },
        orderBy: {
          product: {
            name: query.order,
          },
        },
        skip: query.skip,
        take: query.limit,
      }),
      prisma.inventory.count({ where: whereClause }),
    ]);

    return { balances, total };
  }

  async findTransactionsHistory(
    organizationId: string,
    query: ParsedQuery,
    type?: TransactionType,
  ): Promise<{ transactions: unknown[]; total: number }> {
    const productWhere: Prisma.ProductWhereInput = {
      organizationId,
    };

    if (query.search) {
      productWhere.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const inventoryWhere: Prisma.InventoryWhereInput = {
      product: productWhere,
    };

    const whereClause: Prisma.InventoryTransactionWhereInput = {
      inventory: inventoryWhere,
    };

    if (type) {
      whereClause.type = type;
    }

    const [transactions, total] = await prisma.$transaction([
      prisma.inventoryTransaction.findMany({
        where: whereClause,
        include: {
          inventory: {
            include: {
              product: true,
              warehouse: true,
            },
          },
        },
        orderBy: { createdAt: query.order },
        skip: query.skip,
        take: query.limit,
      }),
      prisma.inventoryTransaction.count({ where: whereClause }),
    ]);

    return { transactions, total };
  }

  // Transactions-safe DB operations (passing the transaction context 'tx')
  async createInventoryEntry(
    tx: Prisma.TransactionClient,
    warehouseId: string,
    productId: string,
    quantity: number,
  ): Promise<Inventory> {
    return tx.inventory.create({
      data: {
        warehouseId,
        productId,
        quantity,
      },
    });
  }

  async updateInventoryQuantity(
    tx: Prisma.TransactionClient,
    id: string,
    quantity: number,
  ): Promise<Inventory> {
    return tx.inventory.update({
      where: { id },
      data: { quantity },
    });
  }

  async createTransaction(
    tx: Prisma.TransactionClient,
    inventoryId: string,
    type: TransactionType,
    quantity: number,
    previousQuantity: number,
    newQuantity: number,
    reason: string | null,
    performedBy: string,
  ): Promise<InventoryTransaction> {
    return tx.inventoryTransaction.create({
      data: {
        inventoryId,
        type,
        quantity,
        previousQuantity,
        newQuantity,
        reason,
        performedBy,
      },
    });
  }
}
