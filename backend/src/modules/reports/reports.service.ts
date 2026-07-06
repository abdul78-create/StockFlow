import prisma from '../../infra/database/prisma';

export interface CategoryValuation {
  categoryId: string;
  categoryName: string;
  productCount: number;
  totalQuantity: number;
  totalValuation: number;
}

export interface LowStockAlertItem {
  productId: string;
  sku: string;
  name: string;
  warehouseName: string;
  quantity: number;
  minimumStock: number;
}

export class ReportsService {
  async getInventoryValuationReport(organizationId: string): Promise<CategoryValuation[]> {
    const categories = await prisma.category.findMany({
      where: { organizationId, deletedAt: null },
      include: {
        products: {
          where: { deletedAt: null },
          include: {
            inventories: true,
          },
        },
      },
    });

    return categories.map((cat) => {
      const productCount = cat.products.length;
      let totalQuantity = 0;
      let totalValuation = 0;

      for (const prod of cat.products) {
        const prodQty = prod.inventories.reduce((sum, inv) => sum + inv.quantity, 0);
        totalQuantity += prodQty;
        totalValuation += prodQty * Number(prod.costPrice);
      }

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        productCount,
        totalQuantity,
        totalValuation,
      };
    });
  }

  async getLowStockReport(organizationId: string): Promise<LowStockAlertItem[]> {
    const inventories = await prisma.inventory.findMany({
      where: {
        product: {
          organizationId,
          deletedAt: null,
        },
      },
      include: {
        product: true,
        warehouse: true,
      },
    });

    const lowStockItems = inventories.filter((inv) => inv.quantity <= inv.product.minimumStock);

    return lowStockItems.map((inv) => ({
      productId: inv.product.id,
      sku: inv.product.sku,
      name: inv.product.name,
      warehouseName: inv.warehouse.name,
      quantity: inv.quantity,
      minimumStock: inv.product.minimumStock,
    }));
  }

  async getSalesReport(organizationId: string): Promise<unknown[]> {
    // Aggregates sales order counts and totals grouped by status
    const summary = await prisma.salesOrder.groupBy({
      by: ['status'],
      where: {
        organizationId,
        deletedAt: null,
      },
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
    });

    return summary.map((group) => ({
      status: group.status,
      count: group._count.id,
      totalRevenue: Number(group._sum.totalAmount || 0),
    }));
  }

  async getPurchaseReport(organizationId: string): Promise<unknown[]> {
    // Aggregates purchase order counts and totals grouped by status
    const summary = await prisma.purchaseOrder.groupBy({
      by: ['status'],
      where: {
        organizationId,
        deletedAt: null,
      },
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
    });

    return summary.map((group) => ({
      status: group.status,
      count: group._count.id,
      totalExpense: Number(group._sum.totalAmount || 0),
    }));
  }

  async getActivityLog(
    organizationId: string,
    page: number = 1,
    limit: number = 25,
    entity?: string,
    action?: string,
  ): Promise<{ logs: unknown[]; total: number }> {
    const where: any = { organizationId };
    if (entity) where.entity = entity;
    if (action) where.action = { contains: action, mode: 'insensitive' };

    const skip = (page - 1) * limit;

    const [logs, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs: logs.map((log) => ({
        id: log.id,
        userId: log.userId,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        metadata: log.metadata ? JSON.parse(log.metadata) : null,
        createdAt: log.createdAt,
      })),
      total,
    };
  }

  async getFinancialSummary(organizationId: string) {
    const [
      invoices,
      bills,
      paymentsReceived,
      paymentsMade
    ] = await Promise.all([
      prisma.invoice.aggregate({
        where: { organizationId, status: { notIn: ['PAID', 'CANCELLED'] } },
        _sum: { balanceDue: true }
      }),
      prisma.bill.aggregate({
        where: { organizationId, status: { notIn: ['PAID', 'CANCELLED'] } },
        _sum: { balanceDue: true }
      }),
      prisma.paymentReceived.aggregate({
        where: { organizationId },
        _sum: { amount: true }
      }),
      prisma.paymentMade.aggregate({
        where: { organizationId },
        _sum: { amount: true }
      })
    ]);

    return {
      totalAccountsReceivable: Number(invoices._sum.balanceDue || 0),
      totalAccountsPayable: Number(bills._sum.balanceDue || 0),
      totalCashReceived: Number(paymentsReceived._sum.amount || 0),
      totalCashPaid: Number(paymentsMade._sum.amount || 0),
      netCashFlow: Number(paymentsReceived._sum.amount || 0) - Number(paymentsMade._sum.amount || 0)
    };
  }
}
