import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Create Organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'stockflow-hq' },
    update: {},
    create: {
      name: 'StockFlow HQ',
      slug: 'stockflow-hq',
    },
  });
  console.log(`Created Organization: ${organization.name} (${organization.id})`);

  // 2. Create Administrator
  const adminEmail = 'admin@stockflow.com';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('AdminPassword123!', salt);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      firstName: 'Abdul',
      lastName: 'Admin',
      passwordHash,
      role: 'ADMIN',
      organizationId: organization.id,
      isActive: true,
    },
  });
  console.log(`Created Admin User: ${admin.email}`);

  // 3. Create 3 Warehouses
  const warehousesData = [
    { name: 'Main Distribution Center', address: '100 Central Ave, Chicago, IL' },
    { name: 'East Coast Fulfillment', address: '200 Eastern Pkwy, Newark, NJ' },
    { name: 'West Coast Hub', address: '300 Pacific Hwy, San Diego, CA' }
  ];
  const warehouses = [];
  for (const w of warehousesData) {
    const warehouse = await prisma.warehouse.create({
      data: { ...w, organizationId: organization.id }
    });
    warehouses.push(warehouse);
  }
  console.log(`Created 3 Warehouses`);

  // 4. Create 5 Categories
  const categoryNames = ['Electronics', 'Apparel', 'Office Supplies', 'Home Goods', 'Tools'];
  const categories = [];
  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { organizationId_name: { organizationId: organization.id, name } },
      update: {},
      create: { name, description: `Premium ${name}`, organizationId: organization.id },
    });
    categories.push(category);
  }
  console.log(`Created 5 Categories`);

  // 5. Create 10 Suppliers
  const suppliers = [];
  for (let i = 1; i <= 10; i++) {
    const supplier = await prisma.supplier.create({
      data: {
        companyName: `Global Supplier ${i} Inc.`,
        email: `sales@supplier${i}.com`,
        phone: `+1-555-010${i}`,
        address: `${i}00 Supply Blvd, Trade City`,
        organizationId: organization.id,
      },
    });
    suppliers.push(supplier);
  }
  console.log(`Created 10 Suppliers`);

  // 6. Create 25 Products
  const products = [];
  for (let i = 1; i <= 25; i++) {
    const category = categories[i % categories.length];
    const supplier = suppliers[i % suppliers.length];
    
    const product = await prisma.product.create({
      data: {
        sku: `PROD-${category.name.substring(0, 3).toUpperCase()}-00${i}`,
        barcode: `190199268${i.toString().padStart(3, '0')}`,
        name: `${category.name} Item ${i}`,
        description: `High-quality ${category.name} item description ${i}`,
        costPrice: 20.00 + (i * 5),
        sellingPrice: 40.00 + (i * 10),
        taxRate: 8.00,
        weight: 1.0 + (i * 0.1),
        minimumStock: 10 + i,
        maximumStock: 100 + i,
        categoryId: category.id,
        supplierId: supplier.id,
        organizationId: organization.id,
        status: 'ACTIVE',
      },
    });
    products.push(product);

    // Initial Stock spread across the 3 warehouses
    for (let w = 0; w < warehouses.length; w++) {
      const warehouse = warehouses[w];
      const initialStock = 50 + (i * 2);
      
      const inventory = await prisma.inventory.create({
        data: {
          warehouseId: warehouse.id,
          productId: product.id,
          quantity: initialStock,
        },
      });

      await prisma.inventoryTransaction.create({
        data: {
          inventoryId: inventory.id,
          type: 'OPENING_STOCK',
          quantity: initialStock,
          previousQuantity: 0,
          newQuantity: initialStock,
          reason: 'Initial opening stock seeding',
          performedBy: admin.id,
        },
      });
    }
  }
  console.log(`Created 25 Products with initial Inventory across all warehouses`);

  // 7. Create 5 Customers
  const customers = [];
  for (let i = 1; i <= 5; i++) {
    const customer = await prisma.customer.create({
      data: {
        name: `Retail Partner ${i}`,
        email: `procurement${i}@partner.com`,
        phone: `+1-555-090${i}`,
        gst: `GSTIN${i}XYZ`,
        address: `${i}04 Enterprise Blvd, New York, NY`,
        organizationId: organization.id,
      },
    });
    customers.push(customer);
  }
  console.log(`Created 5 Customers`);

  // 8. Create 5 Purchase Orders
  for (let i = 1; i <= 5; i++) {
    const p1 = products[i];
    const p2 = products[i + 5];
    const supplier = suppliers[i];

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber: `PO-2026-00${i}`,
        supplierId: supplier.id,
        organizationId: organization.id,
        status: i % 2 === 0 ? 'APPROVED' : 'COMPLETED',
        totalAmount: Number(p1.costPrice) * 10 + Number(p2.costPrice) * 15,
        items: {
          create: [
            { productId: p1.id, quantity: 10, unitPrice: p1.costPrice, receivedQuantity: i % 2 === 0 ? 0 : 10 },
            { productId: p2.id, quantity: 15, unitPrice: p2.costPrice, receivedQuantity: i % 2 === 0 ? 0 : 15 }
          ],
        },
      },
    });

    if (po.status === 'COMPLETED') {
      // Create ledger transactions for the received stock in Main Warehouse
      const warehouse = warehouses[0];
      for (const item of [p1, p2]) {
        const qty = item === p1 ? 10 : 15;
        const inv = await prisma.inventory.findFirst({ where: { warehouseId: warehouse.id, productId: item.id }});
        if (inv) {
          const newQty = inv.quantity + qty;
          await prisma.inventory.update({ where: { id: inv.id }, data: { quantity: newQty }});
          await prisma.inventoryTransaction.create({
            data: {
              inventoryId: inv.id,
              type: 'PURCHASE',
              quantity: qty,
              previousQuantity: inv.quantity,
              newQuantity: newQty,
              reason: `Received PO ${po.poNumber}`,
              performedBy: admin.id,
            }
          });
        }
      }
    }
  }
  console.log(`Created 5 Purchase Orders`);

  // 9. Create 5 Sales Orders
  for (let i = 1; i <= 5; i++) {
    const customer = customers[i-1];
    const p1 = products[i + 10];
    
    await prisma.salesOrder.create({
      data: {
        soNumber: `SO-2026-00${i}`,
        customerId: customer.id,
        organizationId: organization.id,
        status: i === 1 ? 'PENDING' : i === 2 ? 'SHIPPED' : 'DELIVERED',
        totalAmount: Number(p1.sellingPrice) * 5,
        items: {
          create: [
            { productId: p1.id, quantity: 5, unitPrice: p1.sellingPrice, shippedQuantity: i === 1 ? 5 : 0 }
          ],
        },
      },
    });
  }
  console.log(`Created 5 Sales Orders`);

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
