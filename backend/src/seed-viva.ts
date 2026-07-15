import { PrismaClient } from '@prisma/client';
import { AuthService } from './modules/auth/auth.service';
import { DemoSeedService } from './modules/system/demo.service';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const authService = new AuthService();
const demoService = new DemoSeedService();

async function main() {
  const email = 'viva@stockflow.com';
  const password = 'Password123';

  console.log('Seeding Viva Presentation Data...');

  // 1. Create User
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const res = await authService.signup({
      email,
      password,
      firstName: 'Viva',
      lastName: 'Examiner',
    });
    user = res.user as any;
    console.log('Created user:', email);
  } else {
    console.log('User already exists:', email);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, firstName: 'Viva', lastName: 'Examiner' },
    });
    console.log('Updated user password to ' + password);
  }

  // 2. Create Organization
  let org = await prisma.organization.findFirst({
    where: { name: 'Viva Presentation Demo' }
  });
  if (org) {
    console.log('Deleting old Viva org to clear DEMO data...');
    // We can just use cascade delete if configured, or just change the name of the new org
    // Actually, let's just create a new org so we don't have to deal with cascading deletes manually
  }

  const newOrgName = 'Viva Final Presentation ' + Date.now();
  org = await prisma.organization.create({
    data: {
      name: 'Viva Presentation', // Display name
      slug: 'viva-presentation-' + Date.now(),
    }
  });
  console.log('Created Organization:', org.name);

  // 3. Link user to org
  const member = await prisma.organizationMember.findUnique({
    where: { userId_organizationId: { userId: user!.id, organizationId: org.id } }
  });
  if (!member) {
    await prisma.organizationMember.create({
      data: {
        userId: user!.id,
        organizationId: org.id,
        role: 'OWNER',
      }
    });
    console.log('Linked user to organization as OWNER');
  }

  // 4. Run Demo Seed for standard entities
  console.log('Running standard demo seed...');
  await demoService.seed(org.id);

  // 5. Seed Finance Data (Invoices & Bills)
  const customer = await prisma.customer.findFirst({ where: { organizationId: org.id } });
  const supplier = await prisma.supplier.findFirst({ where: { organizationId: org.id } });
  const product = await prisma.product.findFirst({ where: { organizationId: org.id } });

  if (customer && product) {
    const existingInvoice = await prisma.invoice.findFirst({ where: { organizationId: org.id } });
    if (!existingInvoice) {
      await prisma.invoice.create({
        data: {
          organizationId: org.id,
          customerId: customer.id,
          invoiceNumber: `INV-${Date.now()}`,
          status: 'SENT',
          totalAmount: 1500,
          balanceDue: 1500,
          items: {
            create: [
              {
                productId: product.id,
                quantity: 2,
                unitPrice: 750,
                totalAmount: 1500
              }
            ]
          }
        }
      });
      console.log('Seeded sample Invoice (Accounts Receivable)');
    }
  }

  if (supplier && product) {
    const existingBill = await prisma.bill.findFirst({ where: { organizationId: org.id } });
    if (!existingBill) {
      await prisma.bill.create({
        data: {
          organizationId: org.id,
          supplierId: supplier.id,
          billNumber: `BILL-${Date.now()}`,
          status: 'OPEN',
          totalAmount: 800,
          balanceDue: 800,
          items: {
            create: [
              {
                productId: product.id,
                quantity: 5,
                unitPrice: 160,
                totalAmount: 800
              }
            ]
          }
        }
      });
      console.log('Seeded sample Bill (Accounts Payable)');
    }
  }

  console.log('\n======================================');
  console.log('✅ VIVA DEMO DATA SEEDED SUCCESSFULLY!');
  console.log('======================================');
  console.log('Use these credentials to log in:');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log('======================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
