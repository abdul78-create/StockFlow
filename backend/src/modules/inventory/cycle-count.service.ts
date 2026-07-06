import prisma from '../../infra/database/prisma';
import { NotFoundError, ValidationError } from '../../common/errors/app-error';
import { AuditService } from '../../common/services/audit.service';
import { InventoryRepository } from './inventory.repository';

export class CycleCountService {
  private inventoryRepo = new InventoryRepository();

  async createCycleCount(organizationId: string, userId: string, data: { warehouseId: string; name: string; assignedTo?: string }) {
    // Verify warehouse
    const warehouse = await prisma.warehouse.findFirst({
      where: { id: data.warehouseId, organizationId, deletedAt: null }
    });
    if (!warehouse) throw new NotFoundError('Warehouse not found');

    // Get all current inventory items in warehouse
    const inventories = await prisma.inventory.findMany({
      where: { warehouseId: data.warehouseId }
    });

    const cycleCount = await prisma.cycleCount.create({
      data: {
        organizationId,
        warehouseId: data.warehouseId,
        name: data.name,
        assignedTo: data.assignedTo,
        items: {
          create: inventories.map(inv => ({
            inventoryId: inv.id,
            expectedQuantity: inv.quantity
          }))
        }
      },
      include: { items: true }
    });

    await AuditService.log(organizationId, userId, 'CYCLE_COUNT_CREATED', 'CycleCount', cycleCount.id, {
      warehouseId: data.warehouseId,
      name: data.name
    });

    return cycleCount;
  }

  async getCycleCounts(organizationId: string) {
    return prisma.cycleCount.findMany({
      where: { organizationId },
      include: {
        warehouse: true,
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getCycleCountById(organizationId: string, id: string) {
    const cycleCount = await prisma.cycleCount.findFirst({
      where: { id, organizationId },
      include: {
        warehouse: true,
        items: {
          include: {
            inventory: {
              include: {
                product: true,
                variant: true
              }
            }
          }
        }
      }
    });

    if (!cycleCount) throw new NotFoundError('Cycle count not found');
    return cycleCount;
  }

  async updateItemCount(organizationId: string, userId: string, cycleCountId: string, itemId: string, actualQuantity: number, notes?: string) {
    const cycleCount = await prisma.cycleCount.findFirst({
      where: { id: cycleCountId, organizationId }
    });

    if (!cycleCount) throw new NotFoundError('Cycle count not found');
    if (cycleCount.status === 'COMPLETED') throw new ValidationError('Cannot edit a completed cycle count');

    const item = await prisma.cycleCountItem.findFirst({
      where: { id: itemId, cycleCountId }
    });
    if (!item) throw new NotFoundError('Cycle count item not found');

    if (cycleCount.status === 'PENDING') {
      await prisma.cycleCount.update({
        where: { id: cycleCountId },
        data: { status: 'IN_PROGRESS', startedAt: new Date() }
      });
    }

    const updatedItem = await prisma.cycleCountItem.update({
      where: { id: itemId },
      data: {
        actualQuantity,
        discrepancy: actualQuantity - item.expectedQuantity,
        notes
      }
    });

    return updatedItem;
  }

  async completeCycleCount(organizationId: string, userId: string, id: string) {
    const cycleCount = await prisma.cycleCount.findFirst({
      where: { id, organizationId },
      include: { items: true }
    });

    if (!cycleCount) throw new NotFoundError('Cycle count not found');
    if (cycleCount.status === 'COMPLETED') throw new ValidationError('Already completed');

    // Ensure all items are counted
    const uncounted = cycleCount.items.filter(i => i.actualQuantity === null);
    if (uncounted.length > 0) {
      throw new ValidationError(`Cannot complete: ${uncounted.length} items have not been counted`);
    }

    return prisma.$transaction(async (tx) => {
      for (const item of cycleCount.items) {
        if (item.discrepancy && item.discrepancy !== 0 && item.actualQuantity !== null) {
          // Adjust physical stock
          await tx.inventory.update({
            where: { id: item.inventoryId },
            data: { quantity: item.actualQuantity }
          });

          // Log transaction
          await this.inventoryRepo.createTransaction(
            tx,
            item.inventoryId,
            'ADJUSTMENT',
            item.discrepancy,
            item.expectedQuantity,
            item.actualQuantity,
            `Cycle count auto-adjustment. Expected: ${item.expectedQuantity}, Actual: ${item.actualQuantity}`,
            userId
          );
        }
      }

      const completed = await tx.cycleCount.update({
        where: { id },
        data: { status: 'COMPLETED', completedAt: new Date() }
      });

      await AuditService.log(organizationId, userId, 'CYCLE_COUNT_COMPLETED', 'CycleCount', id, {
        discrepanciesAdjusted: cycleCount.items.filter(i => (i.discrepancy || 0) !== 0).length
      });

      return completed;
    });
  }
}
