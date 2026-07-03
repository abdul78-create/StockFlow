import prisma from '../../infra/database/prisma';
import { PurchaseOrderRepository } from '../purchase-orders/purchase-order.repository';
import { AuditService } from '../../common/services/audit.service';

export class AutomationService {
  static async checkAndTriggerReorder(organizationId: string, productId: string): Promise<void> {
    try {
      // 1. Fetch product with supplier and all inventory to compute total quantity
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { inventories: true }
      });
      
      if (!product || !product.supplierId || product.deletedAt) return;
      
      const totalQuantity = product.inventories.reduce((acc, inv) => acc + inv.quantity, 0);
      
      // 2. Check if total quantity <= minimumStock
      if (totalQuantity > product.minimumStock) return;
      
      // 3. Check if there's already a DRAFT or PENDING PurchaseOrder for this product
      const existingPoItem = await prisma.purchaseOrderItem.findFirst({
        where: {
          productId,
          purchaseOrder: {
            organizationId,
            status: { in: ['DRAFT', 'PENDING'] },
            deletedAt: null
          }
        }
      });
      
      if (existingPoItem) return; // Already being reordered
      
      // 4. Calculate reorder quantity
      let orderQuantity = product.maximumStock - totalQuantity;
      if (orderQuantity <= 0) {
        orderQuantity = product.minimumStock > 0 ? product.minimumStock : 10;
      }
      
      // 5. Create a DRAFT PurchaseOrder
      const poNumber = `PO-AUTO-${Date.now()}`;
      const unitPrice = Number(product.costPrice);
      const totalAmount = unitPrice * orderQuantity;
      
      const poRepository = new PurchaseOrderRepository();
      const po = await poRepository.create(organizationId, {
        poNumber,
        supplierId: product.supplierId,
        items: [{
          productId: product.id,
          quantity: orderQuantity,
          unitPrice,
        }]
      }, totalAmount);
      
      // 6. Log automation
      await AuditService.log(
        organizationId,
        'SYSTEM', // System generated
        'AUTO_REORDER_TRIGGERED',
        'PurchaseOrder',
        po.id,
        {
          productId,
          triggeredByQuantity: totalQuantity,
          orderQuantity
        }
      );
    } catch (error) {
      console.error(`[AutomationService] Failed to check and trigger reorder for product ${productId}:`, error);
    }
  }
}
