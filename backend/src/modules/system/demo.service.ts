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
    const wh1 = await this._upsertWarehouse(organizationId, 'Main Distribution Center', 'Mumbai, India', 10000);
    const wh2 = await this._upsertWarehouse(organizationId, 'Secondary Retail Store', 'Delhi, India', 5000);

    // ── 3. Suppliers ───────────────────────────────────────────
    const sup1 = await this._upsertSupplier(organizationId, 'TechCorp Distribution', 'tech@techcorp.in', '+919876543210');
    const sup2 = await this._upsertSupplier(organizationId, 'Global Office Supplies', 'orders@globaloffice.in', '+919876543211');
    const sup3 = await this._upsertSupplier(organizationId, 'Premium Furniture Co.', 'sales@premiumfurn.in', '+919876543212');

    // ── 4. Customers ───────────────────────────────────────────
    const cust1 = await this._upsertCustomer(organizationId, 'Reliance Retail', 'purchasing@reliance.in', '+919876543220');
    const cust2 = await this._upsertCustomer(organizationId, 'Tata Enterprises', 'orders@tata.in', '+919876543221');
    const cust3 = await this._upsertCustomer(organizationId, 'Future Group', 'supply@future.in', '+919876543222');

    // ── 5. Products ────────────────────────────────────────────
    const products = await Promise.all([
      this._upsertProduct(organizationId, catElec.id, 'MacBook Pro 16" M3 Max',           'MBP-16-M3', 250000, 319900),
      this._upsertProduct(organizationId, catElec.id, 'Logitech MX Master 3S',            'LOG-MX3S', 6500,   8999),
      this._upsertProduct(organizationId, catElec.id, 'Dell UltraSharp 27" 4K',           'DELL-U27', 35000,  45900),
      this._upsertProduct(organizationId, catFurn.id, 'Herman Miller Aeron Chair',        'HM-AERON', 95000,  125000),
      this._upsertProduct(organizationId, catFurn.id, 'Ergo Desk Motorized Standing',     'ERGO-DSK', 28000,  35500),
      this._upsertProduct(organizationId, catOff.id,  'JK Copier A4 Paper (500 sheets)',  'JK-A4',    280,    350),
      this._upsertProduct(organizationId, catOff.id,  'Parker Vector Pen (Box of 10)',    'PKR-PEN',  1500,   2500),
      this._upsertProduct(organizationId, catOff.id,  'Kangaro Heavy Duty Stapler',       'KAN-STA',  800,    1200),
      this._upsertProduct(organizationId, catElec.id, 'Anker USB-C 7-in-1 Hub',           'ANK-HUB',  3500,   5499),
      this._upsertProduct(organizationId, catElec.id, 'Sony WH-1000XM5 Headphones',       'SNY-XM5',  24000,  29990),
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
      where: { organizationId, notes: { startsWith: 'TechCorp' } },
    });
    if (!existingPO) {
      await prisma.purchaseOrder.createMany({
        data: [
          {
            organizationId,
            supplierId: sup1.id,
            poNumber: `PO-${Date.now()}-1`,
            status: 'DRAFT',
            expectedDate: new Date(Date.now() + 7 * 86400000),
            shippingCost: 500,
            taxAmount: 14000,
            otherCosts: 0,
            totalAmount: 308000,
            notes: 'TechCorp Electronics restock',
          },
          {
            organizationId,
            supplierId: sup2.id,
            poNumber: `PO-${Date.now()}-2`,
            status: 'APPROVED',
            expectedDate: new Date(Date.now() + 3 * 86400000),
            shippingCost: 200,
            taxAmount: 2500,
            otherCosts: 0,
            totalAmount: 53500,
            notes: 'Office supplies order',
          },
          {
            organizationId,
            supplierId: sup3.id,
            poNumber: `PO-${Date.now()}-3`,
            status: 'COMPLETED',
            expectedDate: new Date(Date.now() - 2 * 86400000),
            shippingCost: 800,
            taxAmount: 8400,
            otherCosts: 0,
            totalAmount: 176400,
            notes: 'Furniture shipment',
          },
        ],
      });
    }

    // ── 8. Sales Orders (skip if demo SOs already exist) ──────
    const existingSO = await prisma.salesOrder.findFirst({
      where: { organizationId, notes: { startsWith: 'Reliance' } },
    });
    if (!existingSO) {
      await prisma.salesOrder.createMany({
        data: [
          {
            organizationId,
            customerId: cust1.id,
            soNumber: `SO-${Date.now()}-1`,
            status: 'DRAFT',
            shippingCost: 300,
            taxAmount: 17500,
            discountAmount: 5000,
            totalAmount: 365400,
            notes: 'Reliance Laptop purchase order',
          },
          {
            organizationId,
            customerId: cust2.id,
            soNumber: `SO-${Date.now()}-2`,
            status: 'APPROVED',
            shippingCost: 0,
            taxAmount: 4500,
            discountAmount: 0,
            totalAmount: 71500,
            notes: 'Tata Peripherals bundle',
          },
          {
            organizationId,
            customerId: cust3.id,
            soNumber: `SO-${Date.now()}-3`,
            status: 'DELIVERED',
            shippingCost: 500,
            taxAmount: 11000,
            discountAmount: 10000,
            totalAmount: 224800,
            notes: 'Future Group Office furniture setup',
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
