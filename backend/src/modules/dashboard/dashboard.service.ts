import prisma from '../../infra/database/prisma';
import { AuditLog, SalesOrderStatus, PurchaseOrderStatus } from '@prisma/client';

export interface TopProduct {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  stockValue: number;
}

export interface RecentCustomer {
  id: string;
  name: string;
  email: string | null;
  createdAt: Date;
}

export interface DashboardMetrics {
  totalProducts: number;
  totalWarehouses: number;
  totalSuppliers: number;
  totalCustomers: number;
  totalSalesOrders: number;
  totalPurchaseOrders: number;
  pendingSalesOrders: number;
  pendingPurchaseOrders: number;
  revenue: number;
  expenses: number;
  profit: number;
  inventoryValue: number;
  lowStockCount: number;
  monthlyTransactionsCount: number;
  dailyTransactions: { date: string; transactions: number }[];
  recentActivity: AuditLog[];
  topProducts: TopProduct[];
  recentCustomers: RecentCustomer[];
}

export class DashboardService {
  async getMetrics(organizationId: string): Promise<DashboardMetrics> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Counts in parallel
    const [
      totalProducts,
      totalWarehouses,
      totalSuppliers,
      totalCustomers,
      totalSalesOrders,
      totalPurchaseOrders,
      pendingSalesOrders,
      pendingPurchaseOrders,
    ] = await Promise.all([
      prisma.product.count({ where: { organizationId, deletedAt: null } }),
      prisma.warehouse.count({ where: { organizationId, deletedAt: null } }),
      prisma.supplier.count({ where: { organizationId, deletedAt: null } }),
      prisma.customer.count({ where: { organizationId, deletedAt: null } }),
      prisma.salesOrder.count({ where: { organizationId, deletedAt: null } }),
      prisma.purchaseOrder.count({ where: { organizationId, deletedAt: null } }),
      prisma.salesOrder.count({
        where: {
          organizationId,
          deletedAt: null,
          status: { in: [SalesOrderStatus.DRAFT, SalesOrderStatus.PENDING, SalesOrderStatus.APPROVED] },
        },
      }),
      prisma.purchaseOrder.count({
        where: {
          organizationId,
          deletedAt: null,
          status: { in: [PurchaseOrderStatus.DRAFT, PurchaseOrderStatus.PENDING, PurchaseOrderStatus.APPROVED] },
        },
      }),
    ]);

    // 2. Financial metrics
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
            in: [PurchaseOrderStatus.COMPLETED, PurchaseOrderStatus.APPROVED],
          },
        },
        select: { totalAmount: true },
      }),
    ]);

    const revenue = salesOrders.reduce((sum, so) => sum + Number(so.totalAmount), 0);
    const expenses = purchaseOrders.reduce((sum, po) => sum + Number(po.totalAmount), 0);
    const profit = revenue - expenses;

    // 3. Inventory valuation
    const inventoryItems = await prisma.inventory.findMany({
      where: { product: { organizationId, deletedAt: null } },
      include: { product: true },
    });

    const inventoryValue = inventoryItems.reduce(
      (sum, item) => sum + item.quantity * Number(item.product.costPrice),
      0,
    );

    const lowStockCount = inventoryItems.filter(
      (item) => item.quantity <= item.product.minimumStock,
    ).length;

    // 4. Transaction activity
    const monthlyTransactionsCount = await prisma.inventoryTransaction.count({
      where: {
        inventory: { product: { organizationId } },
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const recentTx = await prisma.inventoryTransaction.findMany({
      where: {
        inventory: { product: { organizationId } },
        createdAt: { gte: fourteenDaysAgo },
      },
      select: { createdAt: true },
    });

    const dailyMap: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyMap[d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })] = 0;
    }
    recentTx.forEach((tx) => {
      const dateStr = tx.createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (dailyMap[dateStr] !== undefined) dailyMap[dateStr]++;
    });
    const dailyTransactions = Object.entries(dailyMap).map(([date, transactions]) => ({ date, transactions }));

    // 5. Recent audit logs
    const recentActivity = await prisma.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    // 6. Top products by stock value
    const topProductsRaw = await prisma.product.findMany({
      where: { organizationId, deletedAt: null, status: 'ACTIVE' },
      include: { inventories: { select: { quantity: true } } },
      take: 20,
    });

    const topProducts: TopProduct[] = topProductsRaw
      .map((p) => {
        const stock = p.inventories.reduce((sum: number, inv: { quantity: number }) => sum + inv.quantity, 0);
        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          currentStock: stock,
          stockValue: stock * Number(p.costPrice),
        };
      })
      .sort((a, b) => b.stockValue - a.stockValue)
      .slice(0, 5);

    // 7. Recent customers
    const recentCustomersRaw = await prisma.customer.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true },
    });

    const recentCustomers: RecentCustomer[] = recentCustomersRaw.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      createdAt: c.createdAt,
    }));

    return {
      totalProducts,
      totalWarehouses,
      totalSuppliers,
      totalCustomers,
      totalSalesOrders,
      totalPurchaseOrders,
      pendingSalesOrders,
      pendingPurchaseOrders,
      revenue,
      expenses,
      profit,
      inventoryValue,
      lowStockCount,
      monthlyTransactionsCount,
      dailyTransactions,
      recentActivity,
      topProducts,
      recentCustomers,
    };
  }
}
