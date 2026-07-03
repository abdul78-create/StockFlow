import prisma from '../../infra/database/prisma';
import { PurchaseOrderRepository } from './purchase-order.repository';
import { InventoryRepository } from '../inventory/inventory.repository';
import { ConflictError, NotFoundError, ValidationError } from '../../common/errors/app-error';
import { AuditService } from '../../common/services/audit.service';
import { CreatePOInput, ReceiveGoodsInput } from './purchase-order.validation';
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderItem, Product } from '@prisma/client';
import { ParsedQuery } from '../../common/utils/query';

type PurchaseOrderWithItems = PurchaseOrder & {
  items: (PurchaseOrderItem & {
    product: Product;
  })[];
};

export class PurchaseOrderService {
  private purchaseOrderRepository: PurchaseOrderRepository;
  private inventoryRepository: InventoryRepository;

  constructor(
    purchaseOrderRepository = new PurchaseOrderRepository(),
    inventoryRepository = new InventoryRepository(),
  ) {
    this.purchaseOrderRepository = purchaseOrderRepository;
    this.inventoryRepository = inventoryRepository;
  }

  async getPurchaseOrders(
    organizationId: string,
    query: ParsedQuery,
    status?: PurchaseOrderStatus,
    supplierId?: string,
  ): Promise<{ orders: PurchaseOrder[]; total: number }> {
    return this.purchaseOrderRepository.findAll(organizationId, query, status, supplierId);
  }

  async getPurchaseOrderById(organizationId: string, id: string): Promise<PurchaseOrder> {
    const order = await this.purchaseOrderRepository.findById(organizationId, id);
    if (!order) {
      throw new NotFoundError('Purchase Order not found');
    }
    return order;
  }

  async createPurchaseOrder(
    organizationId: string,
    userId: string,
    input: CreatePOInput,
  ): Promise<PurchaseOrder> {
    // 1. Verify PO number uniqueness
    const existing = await this.purchaseOrderRepository.findByPoNumber(
      organizationId,
      input.poNumber,
    );
    if (existing) {
      throw new ConflictError(`Purchase Order number '${input.poNumber}' is already in use`);
    }

    // 2. Verify Supplier exists
    const supplier = await prisma.supplier.findFirst({
      where: { id: input.supplierId, organizationId, deletedAt: null },
    });
    if (!supplier) {
      throw new NotFoundError('Supplier not found or does not belong to your organization');
    }

    // 3. Verify all products and variants exist and calculate total Amount
    let totalAmount = 0;
    for (const item of input.items) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, organizationId, deletedAt: null },
      });
      if (!product) {
        throw new NotFoundError(`Product with ID '${item.productId}' not found`);
      }
      
      if (item.variantId) {
        const variant = await prisma.productVariant.findFirst({
          where: { id: item.variantId, productId: item.productId, deletedAt: null },
        });
        if (!variant) {
          throw new NotFoundError(`Variant with ID '${item.variantId}' not found for product '${product.name}'`);
        }
      }
      
      totalAmount += item.quantity * item.unitPrice;
    }

    // 4. Create PO
    const po = await this.purchaseOrderRepository.create(organizationId, input, totalAmount);

    // 5. Log audit trail
    await AuditService.log(
      organizationId,
      userId,
      'PURCHASE_ORDER_CREATED',
      'PurchaseOrder',
      po.id,
      { poNumber: po.poNumber, totalAmount },
    );

    return po;
  }

  async updatePOStatus(
    organizationId: string,
    id: string,
    userId: string,
    status: PurchaseOrderStatus,
  ): Promise<PurchaseOrder> {
    const po = await this.purchaseOrderRepository.findById(organizationId, id);
    if (!po) {
      throw new NotFoundError('Purchase Order not found');
    }

    // State machine check
    if (status === 'CANCELLED' && po.status !== 'DRAFT' && po.status !== 'PENDING') {
      throw new ValidationError(`Cannot cancel a purchase order in '${po.status}' status`);
    }

    if (status === 'APPROVED' && po.status !== 'PENDING' && po.status !== 'DRAFT') {
      throw new ValidationError(`Cannot approve a purchase order in '${po.status}' status`);
    }

    const updated = await this.purchaseOrderRepository.updateStatus(organizationId, id, status);

    // Log audit trail
    await AuditService.log(
      organizationId,
      userId,
      `PURCHASE_ORDER_${status}`,
      'PurchaseOrder',
      po.id,
    );

    return updated;
  }

  async receiveGoods(
    organizationId: string,
    id: string,
    userId: string,
    input: ReceiveGoodsInput,
  ): Promise<PurchaseOrder> {
    const po = (await this.purchaseOrderRepository.findById(
      organizationId,
      id,
    )) as unknown as PurchaseOrderWithItems;
    if (!po) {
      throw new NotFoundError('Purchase Order not found');
    }

    // 1. Verify status is APPROVED
    if (po.status !== 'APPROVED') {
      throw new ValidationError(
        `Cannot receive goods against a purchase order in '${po.status}' status. Order must be APPROVED.`,
      );
    }

    // 2. Verify warehouse exists
    const warehouse = await prisma.warehouse.findFirst({
      where: { id: input.warehouseId, organizationId, deletedAt: null },
    });
    if (!warehouse) {
      throw new NotFoundError('Warehouse not found or does not belong to your organization');
    }

    return prisma.$transaction(async (tx) => {
      // 3. Process goods receipt
      for (const receiveItem of input.items) {
        // Match product on PO
        const poItem = po.items.find((item) => item.productId === receiveItem.productId && item.variantId === (receiveItem.variantId || null));
        if (!poItem) {
          throw new ValidationError(
            `Product '${receiveItem.productId}' with variant '${receiveItem.variantId || 'none'}' is not part of this purchase order`,
          );
        }

        const totalReceived = poItem.receivedQuantity + receiveItem.quantity;
        if (totalReceived > poItem.quantity) {
          throw new ValidationError(
            `Cannot receive ${receiveItem.quantity} units for product '${poItem.product.name}'. Total received (${totalReceived}) would exceed ordered amount (${poItem.quantity})`,
          );
        }

        // Adjust warehouse stock quantity
        const existingStock = await this.inventoryRepository.findEntry(
          input.warehouseId,
          receiveItem.productId,
          receiveItem.variantId || null,
        );
        const previousQty = existingStock ? existingStock.quantity : 0;
        const newQty = previousQty + receiveItem.quantity;

        let inventoryEntry;
        if (!existingStock) {
          inventoryEntry = await this.inventoryRepository.createInventoryEntry(
            tx,
            input.warehouseId,
            receiveItem.productId,
            newQty,
            receiveItem.variantId || null,
          );
        } else {
          inventoryEntry = await this.inventoryRepository.updateInventoryQuantity(
            tx,
            existingStock.id,
            newQty,
          );
        }

        // Log transaction history line
        await this.inventoryRepository.createTransaction(
          tx,
          inventoryEntry.id,
          'PURCHASE',
          receiveItem.quantity,
          previousQty,
          newQty,
          `Received against PO: ${po.poNumber}`,
          userId,
        );

        // Save new receivedQuantity on PO item
        await this.purchaseOrderRepository.updateItemReceivedQuantity(tx, poItem.id, totalReceived);
      }

      // Check if all PO items are fully received
      const updatedPo = await tx.purchaseOrder.findUnique({
        where: { id },
        include: { items: true },
      });

      const allReceived = updatedPo?.items.every((item) => item.receivedQuantity >= item.quantity);
      let finalStatus: PurchaseOrderStatus = 'APPROVED';

      if (allReceived) {
        finalStatus = 'COMPLETED';
        await this.purchaseOrderRepository.updateStatus(organizationId, id, 'COMPLETED', tx);
      }

      // Log audit trail
      await AuditService.log(organizationId, userId, 'GOODS_RECEIVED', 'PurchaseOrder', id, {
        warehouseId: input.warehouseId,
        itemsReceived: input.items,
        finalStatus,
      });

      // Return refreshed PO details
      const finalPO = await tx.purchaseOrder.findUnique({
        where: { id },
        include: {
          supplier: true,
          items: {
            include: { product: true },
          },
        },
      });

      if (!finalPO) {
        throw new NotFoundError('Refreshed PO not found');
      }

      return finalPO;
    });
  }
}
