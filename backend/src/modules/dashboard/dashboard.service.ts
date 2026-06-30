import prisma from '../../infra/database/prisma';
import { AuditLog } from '@prisma/client';

export interface DashboardMetrics {
  totalProducts: number;
  totalWarehouses: number;
  totalSuppliers: number;
  inventoryValue: number;
  lowStockCount: number;
  monthlyTransactionsCount: number;
  recentActivity: AuditLog[];
}

export class DashboardService {
  async getMetrics(organizationId: string): Promise<DashboardMetrics> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Fetch counts in parallel
    const [totalProducts, totalWarehouses, totalSuppliers] = await Promise.all([
      prisma.product.count({ where: { organizationId, deletedAt: null } }),
      prisma.warehouse.count({ where: { organizationId, deletedAt: null } }),
      prisma.supplier.count({ where: { organizationId, deletedAt: null } }),
    ]);

    // 2. Fetch all inventory records to calculate valuation and warnings
    const inventoryItems = await prisma.inventory.findMany({
      where: {
        product: {
          organizationId,
          deletedAt: null,
        },
      },
      include: {
        product: true,
      },
    });

    const inventoryValue = inventoryItems.reduce(
      (sum, item) => sum + item.quantity * Number(item.product.costPrice),
      0,
    );

    const lowStockCount = inventoryItems.filter(
      (item) => item.quantity <= item.product.minimumStock,
    ).length;

    // 3. Fetch monthly transactions counts
    const monthlyTransactionsCount = await prisma.inventoryTransaction.count({
      where: {
        inventory: {
          product: {
            organizationId,
          },
        },
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // 4. Retrieve recent activity audit logs
    const recentActivity = await prisma.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      totalProducts,
      totalWarehouses,
      totalSuppliers,
      inventoryValue,
      lowStockCount,
      monthlyTransactionsCount,
      recentActivity,
    };
  }
}
