import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Enterprise Demo database seeding...');

  // 1. Create Organization
  const organization = await prisma.organization.upsert({
    where: { slug: 'stockflow-hq' },
    update: {},
    create: {
      name: 'StockFlow Enterprise',
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
      isActive: true,
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: admin.id,
        organizationId: organization.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      organizationId: organization.id,
      role: 'OWNER',
      status: 'ACTIVE',
    },
  });
  console.log(`Created Admin User: ${admin.email}`);

  // 3. Create 20 Warehouses
  console.log('Creating 20 Warehouses...');
  const warehouses = [];
  for (let i = 1; i <= 20; i++) {
    const warehouse = await prisma.warehouse.create({
      data: { 
        name: `Warehouse Location ${i}`, 
        address: `${i}000 Logistics Pkwy, City ${i}`,
        organizationId: organization.id 
      }
    });
    warehouses.push(warehouse);
  }

  // 4. Create Categories
  console.log('Creating Categories...');
  const categoryNames = ['Electronics', 'Apparel', 'Office Supplies', 'Home Goods', 'Tools', 'Automotive', 'Health', 'Beauty', 'Sports', 'Toys'];
  const categories = [];
  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { organizationId_name: { organizationId: organization.id, name } },
      update: {},
      create: { name, description: `Premium ${name}`, organizationId: organization.id },
    });
    categories.push(category);
  }

  // 5. Create 40 Suppliers
  console.log('Creating 40 Suppliers...');
  const suppliers = [];
  for (let i = 1; i <= 40; i++) {
    const supplier = await prisma.supplier.create({
      data: {
        companyName: `Global Supplier ${i} Inc.`,
        email: `sales@supplier${i}.com`,
        phone: `+1-555-010${i.toString().padStart(2, '0')}`,
        address: `${i}00 Supply Blvd, Trade City`,
        organizationId: organization.id,
      },
    });
    suppliers.push(supplier);
  }

  // 6. Create 50 Customers
  console.log('Creating 50 Customers...');
  const customers = [];
  for (let i = 1; i <= 50; i++) {
    const customer = await prisma.customer.create({
      data: {
        name: `Enterprise Client ${i}`,
        email: `procurement@client${i}.com`,
        phone: `+1-444-020${i.toString().padStart(2, '0')}`,
        address: `${i}50 Enterprise Ave, Business Dist`,
        organizationId: organization.id,
      },
    });
    customers.push(customer);
  }

  // 7. Create 200 Products
  console.log('Creating 200 Products...');
  const products = [];
  for (let i = 1; i <= 200; i++) {
    const category = categories[i % categories.length];
    const supplier = suppliers[i % suppliers.length];
    
    const product = await prisma.product.create({
      data: {
        name: `Premium Product ${i}`,
        sku: `PRD-${1000 + i}`,
        description: `High quality item from the ${category.name} category.`,
        categoryId: category.id,
        supplierId: supplier.id,
        costPrice: (10 + (i % 50)).toString(),
        sellingPrice: (25 + (i % 50) * 2).toString(),
        minimumStock: 20,
        maximumStock: 500,
        status: 'ACTIVE',
        organizationId: organization.id,
      },
    });
    products.push(product);
  }

  // 8. Generate some Purchase Orders
  console.log('Generating 10 Purchase Orders...');
  for (let i = 1; i <= 10; i++) {
    const supplier = suppliers[i % suppliers.length];
    const po = await prisma.purchaseOrder.create({
      data: {
        organizationId: organization.id,
        supplierId: supplier.id,
        poNumber: `PO-DEMO-${1000 + i}`,
        status: i % 2 === 0 ? 'COMPLETED' : 'DRAFT',
        totalAmount: (5000 + i * 100).toString(),
        items: {
          create: [
            {
              productId: products[i % products.length].id,
              quantity: 100,
              unitPrice: '50',
              receivedQuantity: i % 2 === 0 ? 100 : 0
            },
            {
              productId: products[(i + 1) % products.length].id,
              quantity: 50,
              unitPrice: '100',
              receivedQuantity: i % 2 === 0 ? 50 : 0
            }
          ]
        }
      }
    });

    if (po.status === 'COMPLETED') {
        const warehouse = warehouses[i % warehouses.length];
        for (const item of [
            { id: products[i % products.length].id, qty: 100 },
            { id: products[(i + 1) % products.length].id, qty: 50 }
        ]) {
            const inv = await prisma.inventory.findFirst({
                where: { productId: item.id, warehouseId: warehouse.id }
            });
            if (inv) {
                await prisma.inventory.update({
                    where: { id: inv.id },
                    data: { quantity: { increment: item.qty } }
                });
            } else {
                await prisma.inventory.create({
                    data: {
                        productId: item.id,
                        warehouseId: warehouse.id,
                        quantity: item.qty
                    }
                });
            }
            await prisma.inventoryTransaction.create({
                data: {
                    inventoryId: inv ? inv.id : (await prisma.inventory.findFirst({ where: { productId: item.id, warehouseId: warehouse.id } }))!.id,
                    type: 'PURCHASE',
                    quantity: item.qty,
                    previousQuantity: inv ? inv.quantity : 0,
                    newQuantity: (inv ? inv.quantity : 0) + item.qty,
                    reason: 'Demo goods receipt',
                    performedBy: admin.id
                }
            });
        }
    }
  }

  // 9. Generate some Sales Orders
  console.log('Generating 10 Sales Orders...');
  for (let i = 1; i <= 10; i++) {
    const customer = customers[i % customers.length];
    const so = await prisma.salesOrder.create({
      data: {
        organizationId: organization.id,
        customerId: customer.id,
        soNumber: `SO-DEMO-${1000 + i}`,
        status: i % 2 === 0 ? 'DELIVERED' : 'DRAFT',
        totalAmount: (5000 + i * 100).toString(),
        items: {
          create: [
            {
              productId: products[i % products.length].id,
              quantity: 10,
              unitPrice: '50',
              shippedQuantity: i % 2 === 0 ? 10 : 0
            },
            {
              productId: products[(i + 1) % products.length].id,
              quantity: 5,
              unitPrice: '100',
              shippedQuantity: i % 2 === 0 ? 5 : 0
            }
          ]
        }
      }
    });

    if (so.status === 'DELIVERED') {
        const warehouse = warehouses[i % warehouses.length];
        for (const item of [
            { id: products[i % products.length].id, qty: 10 },
            { id: products[(i + 1) % products.length].id, qty: 5 }
        ]) {
            const inv = await prisma.inventory.findFirst({
                where: { productId: item.id, warehouseId: warehouse.id }
            });
            if (inv) {
                await prisma.inventory.update({
                    where: { id: inv.id },
                    data: { quantity: { decrement: item.qty } }
                });
            } else {
                await prisma.inventory.create({
                    data: {
                        productId: item.id,
                        warehouseId: warehouse.id,
                        quantity: 0
                    }
                });
            }
            await prisma.inventoryTransaction.create({
                data: {
                    inventoryId: inv ? inv.id : (await prisma.inventory.findFirst({ where: { productId: item.id, warehouseId: warehouse.id } }))!.id,
                    type: 'SALE',
                    quantity: item.qty,
                    previousQuantity: inv ? inv.quantity : 0,
                    newQuantity: (inv ? inv.quantity : 0) - item.qty,
                    reason: 'Demo goods dispatch',
                    performedBy: admin.id
                }
            });
        }
    }
  }

  console.log('✅ Demo seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
