import prisma from '../../infra/database/prisma';
import logger from '../../infra/logger';

/**
 * Seeds realistic demo data for the given organization.
 * Idempotent — safe to run multiple times. Uses findFirst + skip-if-exists logic.
 * Only available when DEMO_MODE=true in environment.
 */
export class DemoSeedService {
  async seed(organizationId: string): Promise<{ message: string; counts: Record<string, number> }> {
    logger.info({ organizationId }, 'Starting demo seed');

    // ── 1. Categories ──────────────────────────────────────────
    const catElec = await this._upsertCategory(organizationId, 'Electronics');
    const catFurn = await this._upsertCategory(organizationId, 'Furniture');
    const catOff  = await this._upsertCategory(organizationId, 'Office Supplies');

    // ── 2. Warehouses ──────────────────────────────────────────
    const wh1 = await this._upsertWarehouse(organizationId, 'DEMO Main Warehouse', 'Dubai, UAE', 10000);
    const wh2 = await this._upsertWarehouse(organizationId, 'DEMO Secondary Store', 'Abu Dhabi, UAE', 5000);

    // ── 3. Suppliers ───────────────────────────────────────────
    const sup1 = await this._upsertSupplier(organizationId, 'DEMO TechCorp Distribution', 'tech@techcorp.ae', '+971501234567');
    const sup2 = await this._upsertSupplier(organizationId, 'DEMO Gulf Office Supplies', 'orders@gulfoffice.ae', '+971502345678');
    const sup3 = await this._upsertSupplier(organizationId, 'DEMO Premium Furniture Co.', 'sales@premiumfurn.ae', '+971503456789');

    // ── 4. Customers ───────────────────────────────────────────
    const cust1 = await this._upsertCustomer(organizationId, 'DEMO Al Fardan Group', 'purchasing@alfardan.ae', '+971504567890');
    const cust2 = await this._upsertCustomer(organizationId, 'DEMO Emirates Retail LLC', 'orders@emiratesretail.ae', '+971505678901');
    const cust3 = await this._upsertCustomer(organizationId, 'DEMO Majid Al Futtaim', 'supply@maf.ae', '+971506789012');

    // ── 5. Products ────────────────────────────────────────────
    const products = await Promise.all([
      this._upsertProduct(organizationId, catElec.id, 'DEMO Laptop Pro 15"',              'DEMO-LAP-001', 2800, 3499),
      this._upsertProduct(organizationId, catElec.id, 'DEMO Wireless Keyboard',            'DEMO-KEY-001', 45,   89),
      this._upsertProduct(organizationId, catElec.id, 'DEMO 4K Monitor 27"',              'DEMO-MON-001', 320,  599),
      this._upsertProduct(organizationId, catFurn.id, 'DEMO Ergonomic Chair',             'DEMO-CHR-001', 280,  549),
      this._upsertProduct(organizationId, catFurn.id, 'DEMO Standing Desk',               'DEMO-DSK-001', 420,  799),
      this._upsertProduct(organizationId, catOff.id,  'DEMO A4 Paper Ream (500 sheets)',  'DEMO-PAP-001', 4,    9),
      this._upsertProduct(organizationId, catOff.id,  'DEMO Ballpoint Pens (Box of 50)',  'DEMO-PEN-001', 6,    14),
      this._upsertProduct(organizationId, catOff.id,  'DEMO Stapler Heavy Duty',          'DEMO-STA-001', 12,   29),
      this._upsertProduct(organizationId, catElec.id, 'DEMO USB-C Hub 7-Port',            'DEMO-USB-001', 22,   49),
      this._upsertProduct(organizationId, catElec.id, 'DEMO Noise-Cancelling Headset',    'DEMO-HDS-001', 85,   179),
    ]);

    // ── 6. Inventory ────────────────────────────────────────────
    for (const product of products) {
      const qty = Math.floor(Math.random() * 80) + 20;
      const existingInv = await prisma.inventory.findFirst({
        where: { warehouseId: wh1.id, productId: product.id, variantId: null },
      });
      if (!existingInv) {
        await prisma.inventory.create({
          data: { warehouseId: wh1.id, productId: product.id, quantity: qty, reserved: 0 },
        });
      }
    }
    for (const product of products.slice(0, 3)) {
      const qty = Math.floor(Math.random() * 20) + 5;
      const existingInv2 = await prisma.inventory.findFirst({
        where: { warehouseId: wh2.id, productId: product.id, variantId: null },
      });
      if (!existingInv2) {
        await prisma.inventory.create({
          data: { warehouseId: wh2.id, productId: product.id, quantity: qty, reserved: 0 },
        });
      }
    }

    // ── 7. Purchase Orders (skip if demo POs already exist) ───
    const existingPO = await prisma.purchaseOrder.findFirst({
      where: { organizationId, notes: { startsWith: 'DEMO' } },
    });
    if (!existingPO) {
      await prisma.purchaseOrder.createMany({
        data: [
          {
            organizationId,
            supplierId: sup1.id,
            poNumber: `DEMO-PO-001-${Date.now()}`,
            status: 'DRAFT',
            expectedDate: new Date(Date.now() + 7 * 86400000),
            shippingCost: 50,
            taxAmount: 140,
            otherCosts: 0,
            totalAmount: 3080,
            notes: 'DEMO Electronics restock',
          },
          {
            organizationId,
            supplierId: sup2.id,
            poNumber: `DEMO-PO-002-${Date.now()}`,
            status: 'APPROVED',
            expectedDate: new Date(Date.now() + 3 * 86400000),
            shippingCost: 20,
            taxAmount: 25,
            otherCosts: 0,
            totalAmount: 535,
            notes: 'DEMO Office supplies order',
          },
          {
            organizationId,
            supplierId: sup3.id,
            poNumber: `DEMO-PO-003-${Date.now()}`,
            status: 'COMPLETED',
            expectedDate: new Date(Date.now() - 2 * 86400000),
            shippingCost: 80,
            taxAmount: 84,
            otherCosts: 0,
            totalAmount: 1764,
            notes: 'DEMO Furniture shipment',
          },
        ],
      });
    }

    // ── 8. Sales Orders (skip if demo SOs already exist) ──────
    const existingSO = await prisma.salesOrder.findFirst({
      where: { organizationId, notes: { startsWith: 'DEMO' } },
    });
    if (!existingSO) {
      await prisma.salesOrder.createMany({
        data: [
          {
            organizationId,
            customerId: cust1.id,
            soNumber: `DEMO-SO-001-${Date.now()}`,
            status: 'DRAFT',
            shippingCost: 30,
            taxAmount: 175,
            discountAmount: 50,
            totalAmount: 3654,
            notes: 'DEMO Laptop purchase order',
          },
          {
            organizationId,
            customerId: cust2.id,
            soNumber: `DEMO-SO-002-${Date.now()}`,
            status: 'APPROVED',
            shippingCost: 0,
            taxAmount: 45,
            discountAmount: 0,
            totalAmount: 715,
            notes: 'DEMO Peripherals bundle',
          },
          {
            organizationId,
            customerId: cust3.id,
            soNumber: `DEMO-SO-003-${Date.now()}`,
            status: 'DELIVERED',
            shippingCost: 50,
            taxAmount: 110,
            discountAmount: 100,
            totalAmount: 2248,
            notes: 'DEMO Office furniture setup',
          },
        ],
      });
    }

    logger.info({ organizationId }, 'Demo seed completed');

    return {
      message: 'Demo data seeded successfully. Your dashboard is now populated.',
      counts: {
        categories: 3,
        warehouses: 2,
        suppliers: 3,
        customers: 3,
        products: products.length,
        purchaseOrders: 3,
        salesOrders: 3,
      },
    };
  }

  // ── Private helpers ─────────────────────────────────────────

  private async _upsertCategory(organizationId: string, name: string) {
    const existing = await prisma.category.findFirst({ where: { organizationId, name } });
    if (existing) return existing;
    return prisma.category.create({ data: { organizationId, name } });
  }

  private async _upsertWarehouse(organizationId: string, name: string, address: string, capacity: number) {
    const existing = await prisma.warehouse.findFirst({ where: { organizationId, name } });
    if (existing) return existing;
    // Warehouse schema only has: id, organizationId, name, address, createdAt, updatedAt, deletedAt
    // capacity is not in schema, skip it
    void capacity;
    return prisma.warehouse.create({ data: { organizationId, name, address } });
  }

  private async _upsertSupplier(organizationId: string, companyName: string, email: string, phone: string) {
    const existing = await prisma.supplier.findFirst({ where: { organizationId, companyName } });
    if (existing) return existing;
    return prisma.supplier.create({ data: { organizationId, companyName, email, phone } });
  }

  private async _upsertCustomer(organizationId: string, name: string, email: string, phone: string) {
    const existing = await prisma.customer.findFirst({ where: { organizationId, name } });
    if (existing) return existing;
    return prisma.customer.create({ data: { organizationId, name, email, phone } });
  }

  private async _upsertProduct(
    organizationId: string,
    categoryId: string,
    name: string,
    sku: string,
    costPrice: number,
    sellingPrice: number,
  ) {
    // Use the actual unique constraint: organizationId + sku
    const existing = await prisma.product.findUnique({
      where: { organizationId_sku: { organizationId, sku } },
    });
    if (existing) return existing;
    return prisma.product.create({
      data: {
        organizationId,
        categoryId,
        name,
        sku,
        costPrice,
        sellingPrice,
        minimumStock: 5,
        maximumStock: 200,
        status: 'ACTIVE',
      },
    });
  }
}
