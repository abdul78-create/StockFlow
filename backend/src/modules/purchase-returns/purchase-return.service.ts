import { PurchaseReturnRepository } from './purchase-return.repository';
import { NotFoundError, ValidationError } from '../../common/errors/app-error';
import { AuditService } from '../../common/services/audit.service';
import { NotificationService } from '../notifications/notification.service';
import { CreatePurchaseReturnInput } from './purchase-return.schema';
import prisma from '../../infra/database/prisma';

export class PurchaseReturnService {
  private repo = new PurchaseReturnRepository();

  async getAll(organizationId: string, page?: number, limit?: number) {
    return this.repo.findAll(organizationId, page, limit);
  }

  async getById(id: string, organizationId: string) {
    const ret = await this.repo.findById(id, organizationId);
    if (!ret) throw new NotFoundError('Purchase return not found');
    return ret;
  }

  async create(organizationId: string, userId: string, input: CreatePurchaseReturnInput) {
    const totalAmount = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const returnNumber = await this.repo.getNextReturnNumber(organizationId);

    const ret = await this.repo.create(organizationId, {
      returnNumber,
      purchaseOrderId: input.purchaseOrderId,
      supplierId: input.supplierId,
      reason: input.reason,
      notes: input.notes,
      totalAmount,
      createdBy: userId,
      items: input.items.map(i => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalAmount: i.quantity * i.unitPrice,
      })),
    });

    await AuditService.log(organizationId, userId, 'PURCHASE_RETURN_CREATED', 'PurchaseReturn', ret.id, { returnNumber });
    return ret;
  }

  async approve(id: string, organizationId: string, userId: string) {
    const ret = await this.getById(id, organizationId);
    if (ret.status !== 'DRAFT') throw new ValidationError('Only DRAFT returns can be approved');

    const updated = await this.repo.updateStatus(id, 'APPROVED', userId);

    // Reduce inventory for returned items (items leave your warehouse)
    await Promise.all(ret.items.map(async (item) => {
      const inv = await prisma.inventory.findFirst({
        where: { productId: item.productId, variantId: item.variantId ?? null },
      });
      if (inv) {
        const newQty = Math.max(0, inv.quantity - item.quantity);
        await prisma.inventory.update({ where: { id: inv.id }, data: { quantity: newQty } });
        await prisma.inventoryTransaction.create({
          data: {
            inventoryId: inv.id,
            type: 'RETURN',
            quantity: -item.quantity,
            previousQuantity: inv.quantity,
            newQuantity: newQty,
            reason: `Purchase Return ${ret.returnNumber}`,
            performedBy: userId,
          },
        });
      }
    }));

    await AuditService.log(organizationId, userId, 'PURCHASE_RETURN_APPROVED', 'PurchaseReturn', id, {});
    await NotificationService.createForAllMembers(
      organizationId,
      'RETURN_APPROVED',
      'Purchase Return Approved',
      `Purchase return ${ret.returnNumber} has been approved.`,
      'PurchaseReturn',
      id,
    );
    return updated;
  }

  async cancel(id: string, organizationId: string, userId: string) {
    const ret = await this.getById(id, organizationId);
    if (ret.status === 'COMPLETED') throw new ValidationError('Completed returns cannot be cancelled');
    const updated = await this.repo.updateStatus(id, 'CANCELLED');
    await AuditService.log(organizationId, userId, 'PURCHASE_RETURN_CANCELLED', 'PurchaseReturn', id, {});
    return updated;
  }
}
