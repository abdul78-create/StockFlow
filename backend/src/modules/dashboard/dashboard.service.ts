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
  dailyTransactions: { date: string; transactions: number; revenue: number; expenses: number }[];
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
        select: { totalAmount: true, createdAt: true },
      }),
      prisma.purchaseOrder.findMany({
        where: {
          organizationId,
          deletedAt: null,
          status: {
            in: [PurchaseOrderStatus.COMPLETED, PurchaseOrderStatus.APPROVED],
          },
        },
        select: { totalAmount: true, createdAt: true },
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

    const dailyMap = new Map<string, { transactions: number; revenue: number; expenses: number }>();
    for (let i = 0; i < 14; i++) {
      const d = new Date(fourteenDaysAgo);
      d.setDate(d.getDate() + i + 1);
      const dateStr = d.toISOString().split('T')[0];
      dailyMap.set(dateStr, { transactions: 0, revenue: 0, expenses: 0 });
    }

    const recentAuditLogs = await prisma.auditLog.findMany({
      where: { organizationId, createdAt: { gte: fourteenDaysAgo } },
    });

    recentAuditLogs.forEach((log) => {
      const dateStr = (log.createdAt as Date).toISOString().split('T')[0];
      if (dailyMap.has(dateStr)) {
        dailyMap.get(dateStr)!.transactions++;
      }
    });

    salesOrders.forEach((so) => {
      const dateStr = (so.createdAt as Date).toISOString().split('T')[0];
      if (dailyMap.has(dateStr)) {
        dailyMap.get(dateStr)!.revenue += Number(so.totalAmount);
      }
    });
    
    purchaseOrders.forEach((po) => {
      const dateStr = (po.createdAt as Date).toISOString().split('T')[0];
      if (dailyMap.has(dateStr)) {
        dailyMap.get(dateStr)!.expenses += Number(po.totalAmount);
      }
    });

    const dailyTransactions = Array.from(dailyMap.entries()).map((entry) => {
      const date = entry[0];
      const data = entry[1];
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        transactions: data.transactions,
        revenue: data.revenue,
        expenses: data.expenses,
      };
    });

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
