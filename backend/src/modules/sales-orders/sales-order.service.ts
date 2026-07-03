import prisma from '../../infra/database/prisma';
import { SalesOrderRepository } from './sales-order.repository';
import { InventoryRepository } from '../inventory/inventory.repository';
import { ConflictError, NotFoundError, ValidationError } from '../../common/errors/app-error';
import { AuditService } from '../../common/services/audit.service';
import { CreateSOInput } from './sales-order.validation';
import { SalesOrder, SalesOrderStatus, SalesOrderItem, Product } from '@prisma/client';
import { ParsedQuery } from '../../common/utils/query';

type SalesOrderWithItems = SalesOrder & {
  items: (SalesOrderItem & {
    product: Product;
  })[];
};

export class SalesOrderService {
  private salesOrderRepository: SalesOrderRepository;
  private inventoryRepository: InventoryRepository;

  constructor(
    salesOrderRepository = new SalesOrderRepository(),
    inventoryRepository = new InventoryRepository(),
  ) {
    this.salesOrderRepository = salesOrderRepository;
    this.inventoryRepository = inventoryRepository;
  }

  async getSalesOrders(
    organizationId: string,
    query: ParsedQuery,
    status?: SalesOrderStatus,
    customerId?: string,
  ): Promise<{ orders: SalesOrder[]; total: number }> {
    return this.salesOrderRepository.findAll(organizationId, query, status, customerId);
  }

  async getSalesOrderById(organizationId: string, id: string): Promise<SalesOrder> {
    const order = await this.salesOrderRepository.findById(organizationId, id);
    if (!order) {
      throw new NotFoundError('Sales Order not found');
    }
    return order;
  }

  async createSalesOrder(
    organizationId: string,
    userId: string,
    input: CreateSOInput,
  ): Promise<SalesOrder> {
    // 1. Verify SO number uniqueness
    const existing = await this.salesOrderRepository.findBySoNumber(organizationId, input.soNumber);
    if (existing) {
      throw new ConflictError(`Sales Order number '${input.soNumber}' is already in use`);
    }

    // 2. Verify Customer exists
    const customer = await prisma.customer.findFirst({
      where: { id: input.customerId, organizationId, deletedAt: null },
    });
    if (!customer) {
      throw new NotFoundError('Customer not found or does not belong to your organization');
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
      
      totalAmount += item.quantity * Number(item.unitPrice);
    }

    // 4. Create SO
    const so = await this.salesOrderRepository.create(organizationId, input, totalAmount);

    // 5. Log audit trail
    await AuditService.log(organizationId, userId, 'SALES_ORDER_CREATED', 'SalesOrder', so.id, {
      soNumber: so.soNumber,
      totalAmount,
    });

    return so;
  }

  async updateSOStatus(
    organizationId: string,
    id: string,
    userId: string,
    status: SalesOrderStatus,
    warehouseId?: string,
  ): Promise<SalesOrder> {
    const so = (await this.salesOrderRepository.findById(
      organizationId,
      id,
    )) as unknown as SalesOrderWithItems;
    if (!so) {
      throw new NotFoundError('Sales Order not found');
    }

    // State machine check
    if (status === 'CANCELLED' && (so.status === 'SHIPPED' || so.status === 'DELIVERED')) {
      throw new ValidationError(`Cannot cancel a sales order in '${so.status}' status`);
    }

    // Verify status path
    if (status === 'APPROVED' && so.status !== 'PENDING' && so.status !== 'DRAFT') {
      throw new ValidationError(`Cannot approve order from status '${so.status}'`);
    }

    // 1. Reserve Stock if transitioning to PENDING or APPROVED
    if (
      (status === 'PENDING' || status === 'APPROVED') &&
      (so.status === 'DRAFT' || so.status === 'PENDING')
    ) {
      if (!warehouseId) {
        throw new ValidationError('Warehouse ID is required to allocate and reserve stock');
      }

      // Verify warehouse
      const warehouse = await prisma.warehouse.findFirst({
        where: { id: warehouseId, organizationId, deletedAt: null },
      });
      if (!warehouse) {
        throw new NotFoundError('Allocation warehouse not found');
      }

      await prisma.$transaction(async (tx) => {
        for (const item of so.items) {
          const stock = await this.inventoryRepository.findEntry(
            warehouseId,
            item.productId,
            item.variantId || null,
          );
          const physicalQty = stock ? stock.quantity : 0;
          const reservedQty = stock ? stock.reserved : 0;
          const available = physicalQty - reservedQty;

          if (available < item.quantity) {
            throw new ValidationError(
              `Insufficient stock allocation for product '${item.product.name}' with variant '${item.variantId || 'none'}' in warehouse. Available: ${available}, required: ${item.quantity}`,
            );
          }

          // Increment reserved count
          const newReserved = reservedQty + item.quantity;
          if (!stock) {
            await tx.inventory.create({
              data: {
                warehouseId,
                productId: item.productId,
                variantId: item.variantId || null,
                quantity: 0,
                reserved: newReserved,
              },
            });
          } else {
            await tx.inventory.update({
              where: { id: stock.id },
              data: { reserved: newReserved },
            });
          }
        }
      });
    }

    // 2. Release Stock Reservation if order is CANCELLED from APPROVED/PENDING/PACKED
    if (
      status === 'CANCELLED' &&
      (so.status === 'PENDING' || so.status === 'APPROVED' || so.status === 'PACKED')
    ) {
      if (!warehouseId) {
        throw new ValidationError('Warehouse ID is required to release stock reservations');
      }

      await prisma.$transaction(async (tx) => {
        for (const item of so.items) {
          const stock = await this.inventoryRepository.findEntry(
            warehouseId,
            item.productId,
            item.variantId || null,
          );
          if (stock) {
            const newReserved = Math.max(0, stock.reserved - item.quantity);
            await tx.inventory.update({
              where: { id: stock.id },
              data: { reserved: newReserved },
            });
          }
        }
      });
    }

    const updated = await this.salesOrderRepository.updateStatus(organizationId, id, status);

    // Log audit trail
    await AuditService.log(organizationId, userId, `SALES_ORDER_${status}`, 'SalesOrder', so.id, {
      warehouseId,
    });

    return updated;
  }

  async dispatchOrder(
    organizationId: string,
    id: string,
    userId: string,
    warehouseId: string,
  ): Promise<SalesOrder> {
    const so = (await this.salesOrderRepository.findById(
      organizationId,
      id,
    )) as unknown as SalesOrderWithItems;
    if (!so) {
      throw new NotFoundError('Sales Order not found');
    }

    // Verify order is APPROVED or PACKED before dispatching
    if (so.status !== 'APPROVED' && so.status !== 'PACKED') {
      throw new ValidationError(
        `Order must be in APPROVED or PACKED status to dispatch. Current: '${so.status}'`,
      );
    }

    // Verify warehouse
    const warehouse = await prisma.warehouse.findFirst({
      where: { id: warehouseId, organizationId, deletedAt: null },
    });
    if (!warehouse) {
      throw new NotFoundError('Dispatch warehouse not found');
    }

    return prisma.$transaction(async (tx) => {
      for (const item of so.items) {
        const stock = await this.inventoryRepository.findEntry(
          warehouseId,
          item.productId,
          item.variantId || null,
        );
        if (!stock || stock.quantity < item.quantity) {
          throw new ValidationError(
            `Insufficient stock to dispatch product '${item.product.name}' with variant '${item.variantId || 'none'}'. Physical stock: ${stock ? stock.quantity : 0}`,
          );
        }

        const prevQty = stock.quantity;
        const prevReserved = stock.reserved;

        // Deduct from physical stock and allocation
        const newQty = prevQty - item.quantity;
        const newReserved = Math.max(0, prevReserved - item.quantity);

        await tx.inventory.update({
          where: { id: stock.id },
          data: {
            quantity: newQty,
            reserved: newReserved,
          },
        });

        // Log ledger transaction
        await this.inventoryRepository.createTransaction(
          tx,
          stock.id,
          'SALE',
          -item.quantity,
          prevQty,
          newQty,
          `Sales Order Dispatch: ${so.soNumber}`,
          userId,
        );

        // Update item shipped count
        await this.salesOrderRepository.updateItemShippedQuantity(tx, item.id, item.quantity);
      }

      // Update order status to DISPATCHED
      await this.salesOrderRepository.updateStatus(organizationId, id, 'SHIPPED', tx);

      // Log audit trail
      await AuditService.log(organizationId, userId, 'SALES_ORDER_DISPATCHED', 'SalesOrder', id, {
        warehouseId,
      });

      // Return refreshed order details
      const finalSO = await tx.salesOrder.findUnique({
        where: { id },
        include: {
          customer: true,
          items: {
            include: { product: true },
          },
        },
      });

      if (!finalSO) {
        throw new NotFoundError('Refreshed SO not found');
      }

      return finalSO;
    });
  }
}
