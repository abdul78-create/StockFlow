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
}
