import prisma from '../../infra/database/prisma';
import { AuditLog, SalesOrderStatus, PurchaseOrderStatus } from '@prisma/client';

export interface DashboardMetrics {
  totalProducts: number;
  totalWarehouses: number;
  totalSuppliers: number;
  totalCustomers: number;
  totalSalesOrders: number;
  totalPurchaseOrders: number;
  revenue: number;
  expenses: number;
  inventoryValue: number;
  lowStockCount: number;
  monthlyTransactionsCount: number;
  dailyTransactions: { date: string; transactions: number }[];
  recentActivity: AuditLog[];
}

export class DashboardService {
  async getMetrics(organizationId: string): Promise<DashboardMetrics> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Fetch counts in parallel
    const [
      totalProducts,
      totalWarehouses,
      totalSuppliers,
      totalCustomers,
      totalSalesOrders,
      totalPurchaseOrders,
    ] = await Promise.all([
      prisma.product.count({ where: { organizationId, deletedAt: null } }),
      prisma.warehouse.count({ where: { organizationId, deletedAt: null } }),
      prisma.supplier.count({ where: { organizationId, deletedAt: null } }),
      prisma.customer.count({ where: { organizationId, deletedAt: null } }),
      prisma.salesOrder.count({ where: { organizationId, deletedAt: null } }),
      prisma.purchaseOrder.count({ where: { organizationId, deletedAt: null } }),
    ]);

    // 1.5 Fetch financial metrics
    const [salesOrders, purchaseOrders] = await Promise.all([
      prisma.salesOrder.findMany({
        where: {
          organizationId,
          deletedAt: null,
          status: {
            in: [
              SalesOrderStatus.APPROVED,
              SalesOrderStatus.PACKED,
              SalesOrderStatus.SHIPPED,
              SalesOrderStatus.DELIVERED,
            ],
          },
        },
        select: { totalAmount: true },
      }),
      prisma.purchaseOrder.findMany({
        where: {
          organizationId,
          deletedAt: null,
          status: {
            in: [
              PurchaseOrderStatus.COMPLETED,
              PurchaseOrderStatus.APPROVED,
            ],
          },
        },
        select: { totalAmount: true },
      }),
    ]);

    const revenue = salesOrders.reduce((sum, so) => sum + Number(so.totalAmount), 0);
    const expenses = purchaseOrders.reduce((sum, po) => sum + Number(po.totalAmount), 0);

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

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const recentTx = await prisma.inventoryTransaction.findMany({
      where: {
        inventory: {
          product: { organizationId },
        },
        createdAt: { gte: fourteenDaysAgo },
      },
      select: { createdAt: true },
    });

    // Group by localized short date
    const dailyMap: Record<string, number> = {};
    // Initialize last 14 days with 0
    for(let i=13; i>=0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyMap[d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })] = 0;
    }
    
    recentTx.forEach(tx => {
      const dateStr = tx.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (dailyMap[dateStr] !== undefined) {
        dailyMap[dateStr]++;
      }
    });

    const dailyTransactions = Object.entries(dailyMap).map(([date, transactions]) => ({ date, transactions }));

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
      totalCustomers,
      totalSalesOrders,
      totalPurchaseOrders,
      revenue,
      expenses,
      inventoryValue,
      lowStockCount,
      monthlyTransactionsCount,
      dailyTransactions,
      recentActivity,
    };
  }
}
