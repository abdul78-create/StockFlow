/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardService } from '../src/modules/dashboard/dashboard.service';
import { ReportsService } from '../src/modules/reports/reports.service';
import prisma from '../src/infra/database/prisma';

// Mock DB
vi.mock('../src/infra/database/prisma', () => ({
  default: {
    product: { count: vi.fn(), findMany: vi.fn() },
    warehouse: { count: vi.fn() },
    supplier: { count: vi.fn() },
    customer: { count: vi.fn(), findMany: vi.fn() },
    purchaseOrder: { count: vi.fn(), findMany: vi.fn() },
    inventory: { findMany: vi.fn() },
    inventoryTransaction: { count: vi.fn(), findMany: vi.fn() },
    auditLog: { findMany: vi.fn() },
    category: { findMany: vi.fn() },
    salesOrder: { count: vi.fn(), findMany: vi.fn(), groupBy: vi.fn() },
  },
}));

describe('Dashboard and Reports Service Unit Tests', () => {
  let dashboardService: DashboardService;
  let reportsService: ReportsService;
  const orgId = 'org-uuid-123';

  beforeEach(() => {
    vi.clearAllMocks();
    dashboardService = new DashboardService();
    reportsService = new ReportsService();
  });

  describe('DashboardService - getMetrics', () => {
    it('should aggregate counts, calculate valuation, and get low stock counts', async () => {
      // Mock basic counts
      (prisma.product.count as any).mockResolvedValue(10);
      (prisma.warehouse.count as any).mockResolvedValue(2);
      (prisma.supplier.count as any).mockResolvedValue(5);
      (prisma.customer.count as any).mockResolvedValue(3);
      (prisma.salesOrder.count as any).mockResolvedValue(4);
      (prisma.purchaseOrder.count as any).mockResolvedValue(6);
      (prisma.salesOrder.findMany as any).mockResolvedValue([{ totalAmount: 250 }]);
      (prisma.purchaseOrder.findMany as any).mockResolvedValue([{ totalAmount: 125 }]);

      // Mock inventory valuation (2 items with costPrice 100, quantity 5 -> total 1000)
      // One has minStock 10 (qty 5 <= 10 -> low stock warning)
      // One has minStock 2 (qty 5 > 2 -> no warning)
      (prisma.inventory.findMany as any).mockResolvedValue([
        { quantity: 5, product: { costPrice: 100, minimumStock: 10 } },
        { quantity: 5, product: { costPrice: 100, minimumStock: 2 } },
      ]);

      (prisma.inventoryTransaction.count as any).mockResolvedValue(50);
      (prisma.inventoryTransaction.findMany as any).mockResolvedValue([]);
      (prisma.auditLog.findMany as any).mockResolvedValue([]);
      // New queries for topProducts and recentCustomers
      (prisma.product.findMany as any).mockResolvedValue([]);
      (prisma.customer.findMany as any).mockResolvedValue([]);

      const result = await dashboardService.getMetrics(orgId);

      expect(result.totalProducts).toBe(10);
      expect(result.totalWarehouses).toBe(2);
      expect(result.totalSuppliers).toBe(5);
      expect(result.totalCustomers).toBe(3);
      expect(result.totalSalesOrders).toBe(4);
      expect(result.totalPurchaseOrders).toBe(6);
      expect(result.revenue).toBe(250);
      expect(result.expenses).toBe(125);
      expect(result.inventoryValue).toBe(1000);
      expect(result.lowStockCount).toBe(1);
      expect(result.monthlyTransactionsCount).toBe(50);
    });
  });

  describe('ReportsService - getInventoryValuationReport', () => {
    it('should calculate category product counts and valuations dynamically', async () => {
      // Mock categories with products and inventories
      (prisma.category.findMany as any).mockResolvedValue([
        {
          id: 'cat-1',
          name: 'Electronics',
          products: [
            {
              costPrice: 500,
              inventories: [{ quantity: 2 }, { quantity: 3 }], // total qty = 5, valuation = 2500
            },
          ],
        },
      ]);

      const report = await reportsService.getInventoryValuationReport(orgId);

      expect(report).toHaveLength(1);
      expect(report[0].categoryName).toBe('Electronics');
      expect(report[0].productCount).toBe(1);
      expect(report[0].totalQuantity).toBe(5);
      expect(report[0].totalValuation).toBe(2500);
    });
  });
});
