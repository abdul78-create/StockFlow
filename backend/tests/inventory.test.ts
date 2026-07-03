/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryService } from '../src/modules/inventory/inventory.service';
import { InventoryRepository } from '../src/modules/inventory/inventory.repository';
import { NotFoundError, ValidationError } from '../src/common/errors/app-error';
import prisma from '../src/infra/database/prisma';

// Mock database
vi.mock('../src/infra/database/prisma', () => ({
  default: {
    product: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    purchaseOrderItem: {
      findFirst: vi.fn(),
    },
    warehouse: {
      findFirst: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

vi.mock('../src/modules/inventory/inventory.repository', () => {
  return {
    InventoryRepository: vi.fn().mockImplementation(() => ({
      findEntry: vi.fn(),
      findAllBalances: vi.fn(),
      findTransactionsHistory: vi.fn(),
      createInventoryEntry: vi.fn(),
      updateInventoryQuantity: vi.fn(),
      createTransaction: vi.fn(),
    })),
  };
});

describe('InventoryService Unit Tests', () => {
  let inventoryService: InventoryService;
  let mockRepo: any;
  const orgId = 'org-uuid-123';
  const userId = 'user-uuid-123';

  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.product.findUnique as any).mockResolvedValue(null);
    (prisma.purchaseOrderItem.findFirst as any).mockResolvedValue(null);
    mockRepo = new InventoryRepository();
    inventoryService = new InventoryService(mockRepo);
  });

  describe('adjustStock', () => {
    const input = {
      productId: 'prod-uuid-123',
      warehouseId: 'ware-uuid-123',
      quantityDelta: 20,
      reason: 'Manual adjustment',
    };

    it('should throw NotFoundError if product does not exist or belongs to another tenant', async () => {
      (prisma.product.findFirst as any).mockResolvedValue(null);

      await expect(inventoryService.adjustStock(orgId, userId, input)).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw ValidationError if adjustment drops stock quantity below zero', async () => {
      (prisma.product.findFirst as any).mockResolvedValue({ id: 'prod-uuid-123' });
      (prisma.warehouse.findFirst as any).mockResolvedValue({ id: 'ware-uuid-123' });
      mockRepo.findEntry.mockResolvedValue({ id: 'inv-1', quantity: 10 }); // existing has 10

      const negativeInput = { ...input, quantityDelta: -15 }; // -15 would drop to -5

      await expect(inventoryService.adjustStock(orgId, userId, negativeInput)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should calculate new balance and log transaction on success', async () => {
      (prisma.product.findFirst as any).mockResolvedValue({ id: 'prod-uuid-123' });
      (prisma.warehouse.findFirst as any).mockResolvedValue({ id: 'ware-uuid-123' });
      mockRepo.findEntry.mockResolvedValue({ id: 'inv-1', quantity: 50 });
      mockRepo.updateInventoryQuantity.mockResolvedValue({ id: 'inv-1', quantity: 70 });
      mockRepo.createTransaction.mockResolvedValue({ id: 'tx-123', quantity: 20 });

      const result = await inventoryService.adjustStock(orgId, userId, input);

      expect(result).toHaveProperty('id', 'tx-123');
      expect(mockRepo.updateInventoryQuantity).toHaveBeenCalledWith(prisma, 'inv-1', 70);
      expect(mockRepo.createTransaction).toHaveBeenCalledWith(
        prisma,
        'inv-1',
        'ADJUSTMENT',
        20,
        50,
        70,
        'Manual adjustment',
        userId,
      );
    });
  });

  describe('transferStock', () => {
    const transferInput = {
      productId: 'prod-uuid-123',
      fromWarehouseId: 'ware-source-123',
      toWarehouseId: 'ware-dest-456',
      quantity: 15,
      reason: 'Relocate stock',
    };

    it('should throw ValidationError if source warehouse has insufficient stock levels', async () => {
      (prisma.product.findFirst as any).mockResolvedValue({ id: 'prod-uuid-123' });
      (prisma.warehouse.findFirst as any).mockResolvedValue({ id: 'ware-source-123' });
      (prisma.warehouse.findFirst as any).mockResolvedValue({ id: 'ware-dest-456' }); // call 2

      mockRepo.findEntry.mockResolvedValue({ id: 'inv-source', quantity: 10 }); // only 10 available, need 15

      await expect(inventoryService.transferStock(orgId, userId, transferInput)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should deduct from source and add to destination warehouse on success', async () => {
      (prisma.product.findFirst as any).mockResolvedValue({ id: 'prod-uuid-123' });
      (prisma.warehouse.findFirst as any).mockResolvedValue({ id: 'ware-source-123' }); // call 1
      // mock dest warehouse check
      vi.spyOn(prisma.warehouse, 'findFirst').mockImplementation(async (args: any) => {
        if (args.where.id === 'ware-dest-456') {
          return { id: 'ware-dest-456', name: 'Dest Ware' } as any;
        }
        return { id: 'ware-source-123', name: 'Source Ware' } as any;
      });

      mockRepo.findEntry.mockImplementation(async (wId: string) => {
        if (wId === 'ware-source-123') return { id: 'inv-source', quantity: 100 };
        return { id: 'inv-dest', quantity: 20 };
      });

      mockRepo.updateInventoryQuantity.mockResolvedValue({ id: 'inv-source', quantity: 85 });
      mockRepo.createTransaction.mockResolvedValue({ id: 'tx-source', quantity: -15 });

      const result = await inventoryService.transferStock(orgId, userId, transferInput);

      expect(result).toHaveProperty('sourceTransaction');
      expect(result).toHaveProperty('destTransaction');
      expect(mockRepo.updateInventoryQuantity).toHaveBeenCalledWith(prisma, 'inv-source', 85);
      expect(mockRepo.updateInventoryQuantity).toHaveBeenCalledWith(prisma, 'inv-dest', 35);
    });
  });
});
