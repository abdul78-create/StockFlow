import prisma from '../../infra/database/prisma';
import { InventoryRepository } from './inventory.repository';
import { NotFoundError, ValidationError } from '../../common/errors/app-error';
import { AuditService } from '../../common/services/audit.service';
import {
  AdjustStockInput,
  ReceiveStockInput,
  DispatchStockInput,
  TransferStockInput,
} from './inventory.validation';
import { Inventory, InventoryTransaction, TransactionType } from '@prisma/client';
import { ParsedQuery } from '../../common/utils/query';
import { AutomationService } from '../automation/automation.service';

export class InventoryService {
  private inventoryRepository: InventoryRepository;

  constructor(inventoryRepository = new InventoryRepository()) {
    this.inventoryRepository = inventoryRepository;
  }

  async getBalances(
    organizationId: string,
    query: ParsedQuery,
    categoryId?: string,
    warehouseId?: string,
  ): Promise<{ balances: unknown[]; total: number }> {
    return this.inventoryRepository.findAllBalances(organizationId, query, categoryId, warehouseId);
  }

  async getTransactionHistory(
    organizationId: string,
    query: ParsedQuery,
    type?: TransactionType,
    warehouseId?: string,
  ): Promise<{ transactions: unknown[]; total: number }> {
    return this.inventoryRepository.findTransactionsHistory(organizationId, query, type, warehouseId);
  }

  async getHealth(organizationId: string, warehouseId?: string) {
    return this.inventoryRepository.getStockHealth(organizationId, warehouseId);
  }

  private async verifyProductAndWarehouse(
    organizationId: string,
    productId: string,
    warehouseId: string,
  ): Promise<void> {
    const product = await prisma.product.findFirst({
      where: { id: productId, organizationId, deletedAt: null },
    });
    if (!product) {
      throw new NotFoundError('Product not found or does not belong to your organization');
    }

    const warehouse = await prisma.warehouse.findFirst({
      where: { id: warehouseId, organizationId, deletedAt: null },
    });
    if (!warehouse) {
      throw new NotFoundError('Warehouse not found or does not belong to your organization');
    }
  }

  async adjustStock(
    organizationId: string,
    userId: string,
    input: AdjustStockInput,
    type: TransactionType = 'ADJUSTMENT',
  ): Promise<InventoryTransaction> {
    await this.verifyProductAndWarehouse(organizationId, input.productId, input.warehouseId);

    const result = await prisma.$transaction(async (tx) => {
      const existing = await this.inventoryRepository.findEntry(input.warehouseId, input.productId, input.variantId || null);
      const previousQuantity = existing ? existing.quantity : 0;
      const newQuantity = previousQuantity + input.quantityDelta;

      if (newQuantity < 0) {
        throw new ValidationError('Inventory quantity cannot drop below zero', [
          { field: 'quantityDelta', message: `Stock level would drop to ${newQuantity}` },
        ]);
      }

      let inventoryEntry: Inventory;

      if (!existing) {
        if (input.quantityDelta < 0) {
          throw new ValidationError(
            'Cannot perform negative adjustment on non-existent stock level',
          );
        }
        inventoryEntry = await this.inventoryRepository.createInventoryEntry(
          tx,
          input.warehouseId,
          input.productId,
          newQuantity,
          input.variantId || null
        );
      } else {
        inventoryEntry = await this.inventoryRepository.updateInventoryQuantity(
          tx,
          existing.id,
          newQuantity,
        );
      }

      const transaction = await this.inventoryRepository.createTransaction(
        tx,
        inventoryEntry.id,
        type,
        input.quantityDelta,
        previousQuantity,
        newQuantity,
        input.reason,
        userId,
      );

      // Audit Log trigger
      await AuditService.log(
        organizationId,
        userId,
        `STOCK_${type}`,
        'Inventory',
        inventoryEntry.id,
        {
          productId: input.productId,
          warehouseId: input.warehouseId,
          quantityDelta: input.quantityDelta,
          previousQuantity,
          newQuantity,
        },
      );

      return transaction;
    });

    // Asynchronously trigger reorder check
    AutomationService.checkAndTriggerReorder(organizationId, input.productId).catch((err) => {
      console.error(`[Automation] Auto-reorder failed for product ${input.productId}:`, err);
    });

    return result;
  }

  async receiveStock(
    organizationId: string,
    userId: string,
    input: ReceiveStockInput,
  ): Promise<InventoryTransaction> {
    return this.adjustStock(
      organizationId,
      userId,
      {
        productId: input.productId,
        variantId: input.variantId,
        warehouseId: input.warehouseId,
        quantityDelta: input.quantity,
        reason: input.reason || 'Purchase order receipt',
      },
      'PURCHASE',
    );
  }

  async dispatchStock(
    organizationId: string,
    userId: string,
    input: DispatchStockInput,
  ): Promise<InventoryTransaction> {
    return this.adjustStock(
      organizationId,
      userId,
      {
        productId: input.productId,
        variantId: input.variantId,
        warehouseId: input.warehouseId,
        quantityDelta: -input.quantity,
        reason: input.reason || 'Sales dispatch order',
      },
      'SALE',
    );
  }

  async transferStock(
    organizationId: string,
    userId: string,
    input: TransferStockInput,
  ): Promise<{ sourceTransaction: InventoryTransaction; destTransaction: InventoryTransaction }> {
    // 1. Verify product and source warehouse
    await this.verifyProductAndWarehouse(organizationId, input.productId, input.fromWarehouseId);

    // 2. Verify destination warehouse
    const destWarehouse = await prisma.warehouse.findFirst({
      where: { id: input.toWarehouseId, organizationId, deletedAt: null },
    });
    if (!destWarehouse) {
      throw new NotFoundError(
        'Destination warehouse not found or does not belong to your organization',
      );
    }

    return prisma.$transaction(async (tx) => {
      // 3. Check source stock balance
      const sourceEntry = await this.inventoryRepository.findEntry(
        input.fromWarehouseId,
        input.productId,
        input.variantId || null
      );
      if (!sourceEntry || sourceEntry.quantity < input.quantity) {
        throw new ValidationError('Insufficient stock level in source warehouse', [
          {
            field: 'quantity',
            message: `Available stock: ${sourceEntry ? sourceEntry.quantity : 0}, required: ${input.quantity}`,
          },
        ]);
      }

      // 4. Update source stock balance
      const sourcePrevQty = sourceEntry.quantity;
      const sourceNewQty = sourcePrevQty - input.quantity;
      await this.inventoryRepository.updateInventoryQuantity(tx, sourceEntry.id, sourceNewQty);

      // Log outbound transfer transaction
      const sourceTransaction = await this.inventoryRepository.createTransaction(
        tx,
        sourceEntry.id,
        'TRANSFER',
        -input.quantity,
        sourcePrevQty,
        sourceNewQty,
        input.reason || `Transfer to ${destWarehouse.name}`,
        userId,
      );

      // 5. Update/create destination stock balance
      const destEntry = await this.inventoryRepository.findEntry(
        input.toWarehouseId,
        input.productId,
        input.variantId || null
      );
      const destPrevQty = destEntry ? destEntry.quantity : 0;
      const destNewQty = destPrevQty + input.quantity;

      let updatedDestEntry: Inventory;
      if (!destEntry) {
        updatedDestEntry = await this.inventoryRepository.createInventoryEntry(
          tx,
          input.toWarehouseId,
          input.productId,
          destNewQty,
          input.variantId || null
        );
      } else {
        updatedDestEntry = await this.inventoryRepository.updateInventoryQuantity(
          tx,
          destEntry.id,
          destNewQty,
        );
      }

      // Log inbound transfer transaction
      const destTransaction = await this.inventoryRepository.createTransaction(
        tx,
        updatedDestEntry.id,
        'TRANSFER',
        input.quantity,
        destPrevQty,
        destNewQty,
        input.reason || `Transfer from ${sourceEntry.id}`,
        userId,
      );

      // Audit Log trigger
      await AuditService.log(
        organizationId,
        userId,
        'STOCK_TRANSFER',
        'Inventory',
        sourceEntry.id,
        {
          productId: input.productId,
          fromWarehouseId: input.fromWarehouseId,
          toWarehouseId: input.toWarehouseId,
          quantity: input.quantity,
        },
      );

      return { sourceTransaction, destTransaction };
    });
  }
}
