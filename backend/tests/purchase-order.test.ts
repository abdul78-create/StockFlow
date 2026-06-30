/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PurchaseOrderService } from '../src/modules/purchase-orders/purchase-order.service';
import { PurchaseOrderRepository } from '../src/modules/purchase-orders/purchase-order.repository';
import { InventoryRepository } from '../src/modules/inventory/inventory.repository';
import { ValidationError } from '../src/common/errors/app-error';
import prisma from '../src/infra/database/prisma';

// Mock DB
vi.mock('../src/infra/database/prisma', () => ({
  default: {
    supplier: { findFirst: vi.fn() },
    product: { findFirst: vi.fn() },
    warehouse: { findFirst: vi.fn() },
    auditLog: { create: vi.fn() },
    purchaseOrder: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

vi.mock('../src/modules/purchase-orders/purchase-order.repository', () => {
  return {
    PurchaseOrderRepository: vi.fn().mockImplementation(() => ({
      findAll: vi.fn(),
      findById: vi.fn(),
      findByPoNumber: vi.fn(),
      create: vi.fn(),
      updateStatus: vi.fn(),
      updateItemReceivedQuantity: vi.fn(),
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

describe('PurchaseOrderService Unit Tests', () => {
  let poService: PurchaseOrderService;
  let mockPORepo: any;
  let mockInventoryRepo: any;
  const orgId = 'org-uuid-123';
  const userId = 'user-uuid-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockPORepo = new PurchaseOrderRepository();
    mockInventoryRepo = new InventoryRepository();
    poService = new PurchaseOrderService(mockPORepo, mockInventoryRepo);
  });

  describe('updatePOStatus', () => {
    it('should throw ValidationError if canceling an approved order', async () => {
      mockPORepo.findById.mockResolvedValue({ id: 'po-123', status: 'APPROVED' });

      await expect(poService.updatePOStatus(orgId, 'po-123', userId, 'CANCELLED')).rejects.toThrow(
        ValidationError,
      );
    });

    it('should successfully update status if transition is valid', async () => {
      mockPORepo.findById.mockResolvedValue({ id: 'po-123', status: 'DRAFT' });
      mockPORepo.updateStatus.mockResolvedValue({ id: 'po-123', status: 'PENDING' });

      const result = await poService.updatePOStatus(orgId, 'po-123', userId, 'PENDING');
      expect(result.status).toBe('PENDING');
    });
  });

  describe('receiveGoods', () => {
    const receiveInput = {
      warehouseId: 'ware-uuid-123',
      items: [{ productId: 'prod-uuid-123', quantity: 5 }],
    };

    it('should throw ValidationError if PO is not in APPROVED status', async () => {
      mockPORepo.findById.mockResolvedValue({ id: 'po-123', status: 'DRAFT' });

      await expect(poService.receiveGoods(orgId, 'po-123', userId, receiveInput)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw ValidationError if received quantity exceeds ordered amount', async () => {
      mockPORepo.findById.mockResolvedValue({
        id: 'po-123',
        poNumber: 'PO-001',
        status: 'APPROVED',
        items: [
          {
            id: 'po-item-1',
            productId: 'prod-uuid-123',
            quantity: 10,
            receivedQuantity: 8, // only 2 left to receive
            product: { name: 'Item A' },
          },
        ],
      });
      (prisma.warehouse.findFirst as any).mockResolvedValue({ id: 'ware-uuid-123' });

      // Trying to receive 5 units when only 2 remain
      await expect(poService.receiveGoods(orgId, 'po-123', userId, receiveInput)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should update inventory stock levels on valid receipt', async () => {
      const mockPO = {
        id: 'po-123',
        poNumber: 'PO-001',
        status: 'APPROVED',
        items: [
          {
            id: 'po-item-1',
            productId: 'prod-uuid-123',
            quantity: 10,
            receivedQuantity: 0,
            product: { name: 'Item A' },
          },
        ],
      };
      mockPORepo.findById.mockResolvedValue(mockPO);
      (prisma.warehouse.findFirst as any).mockResolvedValue({ id: 'ware-uuid-123' });

      // Mock inventory adjustments
      mockInventoryRepo.findEntry.mockResolvedValue({ id: 'inv-1', quantity: 15 });
      mockInventoryRepo.updateInventoryQuantity.mockResolvedValue({ id: 'inv-1', quantity: 20 });

      // Mock refreshed order callbacks
      (prisma.purchaseOrder.findUnique as any).mockResolvedValue({
        ...mockPO,
        items: [{ ...mockPO.items[0], receivedQuantity: 5 }],
      });

      const result = await poService.receiveGoods(orgId, 'po-123', userId, receiveInput);

      expect(result).toBeDefined();
      expect(mockInventoryRepo.updateInventoryQuantity).toHaveBeenCalledWith(prisma, 'inv-1', 20);
      expect(mockPORepo.updateItemReceivedQuantity).toHaveBeenCalledWith(prisma, 'po-item-1', 5);
    });
  });
});
