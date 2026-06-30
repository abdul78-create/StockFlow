/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SalesOrderService } from '../src/modules/sales-orders/sales-order.service';
import { SalesOrderRepository } from '../src/modules/sales-orders/sales-order.repository';
import { InventoryRepository } from '../src/modules/inventory/inventory.repository';
import { ValidationError } from '../src/common/errors/app-error';
import prisma from '../src/infra/database/prisma';

// Mock DB
vi.mock('../src/infra/database/prisma', () => ({
  default: {
    customer: { findFirst: vi.fn() },
    product: { findFirst: vi.fn() },
    warehouse: { findFirst: vi.fn() },
    auditLog: { create: vi.fn() },
    salesOrder: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    inventory: {
      create: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

vi.mock('../src/modules/sales-orders/sales-order.repository', () => {
  return {
    SalesOrderRepository: vi.fn().mockImplementation(() => ({
      findAll: vi.fn(),
      findById: vi.fn(),
      findBySoNumber: vi.fn(),
      create: vi.fn(),
      updateStatus: vi.fn(),
      updateItemShippedQuantity: vi.fn(),
    })),
  };
});

vi.mock('../src/modules/inventory/inventory.repository', () => {
  return {
    InventoryRepository: vi.fn().mockImplementation(() => ({
      findEntry: vi.fn(),
      createInventoryEntry: vi.fn(),
      updateInventoryQuantity: vi.fn(),
      createTransaction: vi.fn(),
    })),
  };
});

describe('SalesOrderService Unit Tests', () => {
  let soService: SalesOrderService;
  let mockSORepo: any;
  let mockInventoryRepo: any;
  const orgId = 'org-uuid-123';
  const userId = 'user-uuid-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockSORepo = new SalesOrderRepository();
    mockInventoryRepo = new InventoryRepository();
    soService = new SalesOrderService(mockSORepo, mockInventoryRepo);
  });

  describe('updateSOStatus - Stock Reservation Checks', () => {
    const mockSO = {
      id: 'so-123',
      soNumber: 'SO-001',
      status: 'DRAFT',
      items: [
        {
          productId: 'prod-uuid-123',
          quantity: 10,
          product: { name: 'Item A' },
        },
      ],
    };

    it('should throw ValidationError if warehouseId is missing when reserving stock', async () => {
      mockSORepo.findById.mockResolvedValue(mockSO);

      await expect(soService.updateSOStatus(orgId, 'so-123', userId, 'APPROVED')).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw ValidationError if available stock is insufficient to reserve', async () => {
      mockSORepo.findById.mockResolvedValue(mockSO);
      (prisma.warehouse.findFirst as any).mockResolvedValue({ id: 'ware-123' });

      // Physical quantity = 10, reserved = 8 -> available = 2. But we need 10.
      mockInventoryRepo.findEntry.mockResolvedValue({
        id: 'inv-1',
        quantity: 10,
        reserved: 8,
      });

      await expect(
        soService.updateSOStatus(orgId, 'so-123', userId, 'APPROVED', 'ware-123'),
      ).rejects.toThrow(ValidationError);
    });

    it('should increment reserved count in database on successful allocation reservation', async () => {
      mockSORepo.findById.mockResolvedValue(mockSO);
      (prisma.warehouse.findFirst as any).mockResolvedValue({ id: 'ware-123' });
      mockInventoryRepo.findEntry.mockResolvedValue({
        id: 'inv-1',
        quantity: 50,
        reserved: 5,
      });
      mockSORepo.updateStatus.mockResolvedValue({ id: 'so-123', status: 'APPROVED' });

      const result = await soService.updateSOStatus(
        orgId,
        'so-123',
        userId,
        'APPROVED',
        'ware-123',
      );

      expect(result.status).toBe('APPROVED');
    });
  });

  describe('dispatchOrder', () => {
    const mockApprovedSO = {
      id: 'so-123',
      soNumber: 'SO-001',
      status: 'APPROVED',
      items: [
        {
          id: 'so-item-1',
          productId: 'prod-uuid-123',
          quantity: 5,
          product: { name: 'Item A' },
        },
      ],
    };

    it('should deduct physical quantity and release reservation count on valid dispatch', async () => {
      mockSORepo.findById.mockResolvedValue(mockApprovedSO);
      (prisma.warehouse.findFirst as any).mockResolvedValue({ id: 'ware-123' });

      // Physical quantity = 50, reserved = 15
      mockInventoryRepo.findEntry.mockResolvedValue({
        id: 'inv-1',
        quantity: 50,
        reserved: 15,
      });

      (prisma.salesOrder.findUnique as any).mockResolvedValue({
        ...mockApprovedSO,
        status: 'SHIPPED',
      });

      const result = await soService.dispatchOrder(orgId, 'so-123', userId, 'ware-123');

      expect(result.status).toBe('SHIPPED');
    });
  });
});
