import { PrismaClient, PurchaseOrderStatus, SalesOrderStatus, TransactionType, InvoiceStatus, BillStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // ---------------------------------------------------------
  // 1. CLEANUP EXISTING DATA (IDEMPOTENCY)
  // ---------------------------------------------------------
  console.log('🧹 Cleaning up existing records...');
  
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.cycleCountItem.deleteMany({});
  await prisma.cycleCount.deleteMany({});
  
  await prisma.invoiceItem.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.billItem.deleteMany({});
  await prisma.bill.deleteMany({});
  await prisma.paymentReceived.deleteMany({});
  await prisma.paymentMade.deleteMany({});
  
  await prisma.purchaseReturnItem.deleteMany({});
  await prisma.purchaseReturn.deleteMany({});
  await prisma.salesReturnItem.deleteMany({});
  await prisma.salesReturn.deleteMany({});
  await prisma.quotationItem.deleteMany({});
  await prisma.quotation.deleteMany({});
  
  await prisma.salesOrderItem.deleteMany({});
  await prisma.salesOrder.deleteMany({});
  await prisma.purchaseOrderItem.deleteMany({});
  await prisma.purchaseOrder.deleteMany({});
  
  await prisma.inventoryTransaction.deleteMany({});
  await prisma.inventoryBatch.deleteMany({});
  await prisma.serialNumber.deleteMany({});
  await prisma.inventory.deleteMany({});
  
  await prisma.productSupplier.deleteMany({});
  await prisma.supplierPriceHistory.deleteMany({});
  await prisma.productNote.deleteMany({});
  await prisma.productAttachment.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productUnit.deleteMany({});
  await prisma.productBundleItem.deleteMany({});
  
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.warehouse.deleteMany({});
  
  await prisma.organizationMember.deleteMany({});
  await prisma.invitation.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Cleanup finished.');

  // ---------------------------------------------------------
  // 2. CREATE PERMANENT DEMO USER AND WORKSPACE
  // ---------------------------------------------------------
  console.log('👤 Seeding permanent demo account...');
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123', salt);
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', salt);

  // Create primary examiner user
  const examinerUser = await prisma.user.create({
    data: {
      email: 'viva@stockflow.com',
      firstName: 'Viva',
      lastName: 'Examiner',
      passwordHash,
      isActive: true,
    },
  });

  // Create backup admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@stockflow.com',
      firstName: 'Abdul',
      lastName: 'Admin',
      passwordHash: adminPasswordHash,
      isActive: true,
    },
  });

  console.log('🏢 Seeding demo organization...');
  const org = await prisma.organization.create({
    data: {
      name: 'StockFlow Demo Pvt Ltd',
      slug: 'stockflow-demo',
      industry: 'Retail & Wholesale Distribution',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      country: 'India',
      taxType: 'GST',
      taxNumber: '36AAAAA1234A1Z1',
      ownerId: examinerUser.id,
    },
  });

  // Attach memberships
  await prisma.organizationMember.createMany({
    data: [
      {
        userId: examinerUser.id,
        organizationId: org.id,
        role: 'OWNER',
        status: 'ACTIVE',
      },
      {
        userId: adminUser.id,
        organizationId: org.id,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    ],
  });

  // Attach subscription
  await prisma.subscription.create({
    data: {
      organizationId: org.id,
      plan: 'PRO',
      status: 'ACTIVE',
      currentPeriodEnd: new Date('2030-01-01'),
    },
  });

  // ---------------------------------------------------------
  // 3. SEED WAREHOUSES
  // ---------------------------------------------------------
  console.log('📦 Seeding 5 warehouses...');
  const warehousesData = [
    { name: 'Hyderabad Central Warehouse', address: 'Charminar Rd, Hyderabad, Telangana - 500002' },
    { name: 'Hyderabad North Warehouse', address: 'Secunderabad, Hyderabad, Telangana - 500003' },
    { name: 'Vijayawada Warehouse', address: 'Benz Circle, Vijayawada, Andhra Pradesh - 520010' },
    { name: 'Bengaluru Warehouse', address: 'Whitefield Main Rd, Bengaluru, Karnataka - 560066' },
    { name: 'Chennai Warehouse', address: 'Guindy Area, Chennai, Tamil Nadu - 600032' },
  ];

  const warehouses = [];
  for (const w of warehousesData) {
    const warehouse = await prisma.warehouse.create({
      data: {
        name: w.name,
        address: w.address,
        organizationId: org.id,
      },
    });
    warehouses.push(warehouse);
  }

  // ---------------------------------------------------------
  // 4. SEED PRODUCT CATEGORIES
  // ---------------------------------------------------------
  console.log('🏷️ Seeding 8 product categories...');
  const categoryNames = [
    'Food',
    'Electronics',
    'Household',
    'Office Supplies',
    'Personal Care',
    'Beverages',
    'Groceries',
    'Cleaning',
  ];
  const categories: Record<string, any> = {};
  for (const name of categoryNames) {
    const category = await prisma.category.create({
      data: {
        name,
        description: `${name} products and materials`,
        organizationId: org.id,
      },
    });
    categories[name] = category;
  }

  // ---------------------------------------------------------
  // 5. SEED SUPPLIERS (15 Suppliers)
  // ---------------------------------------------------------
  console.log('🏭 Seeding 15 suppliers...');
  const suppliersData = [
    { companyName: 'Reliance Retail Suppliers', email: 'sales@reliancesuppliers.in', phone: '9885501234', address: 'Gachibowli, Hyderabad, Telangana', gst: '36AAACR1029A1Z1', paymentTerms: 'Net 30' },
    { companyName: 'ITC Distribution', email: 'orders@itcdistribution.co.in', phone: '9848011223', address: 'Virginia House, Kolkata, West Bengal', gst: '19AAACI0020A1Z2', paymentTerms: 'Net 45' },
    { companyName: 'Nestle India', email: 'procure@nestle.in', phone: '9123456789', address: 'Connaught Place, New Delhi', gst: '07AAACN2901A1Z3', paymentTerms: 'Net 30' },
    { companyName: 'Parle Wholesale', email: 'wholesale@parle.in', phone: '9223344556', address: 'Vile Parle, Mumbai, Maharashtra', gst: '27AAACP0120B1Z4', paymentTerms: 'Net 15' },
    { companyName: 'Dabur India', email: 'trade@dabur.in', phone: '9334455667', address: 'Kaushambi, Ghaziabad, Uttar Pradesh', gst: '09AAACD4401C1Z5', paymentTerms: 'Net 30' },
    { companyName: 'Britannia Foods', email: 'distributors@britannia.in', phone: '9445566778', address: 'Whitefield, Bengaluru, Karnataka', gst: '29AAACB1102D1Z6', paymentTerms: 'Net 30' },
    { companyName: 'Amul Distribution', email: 'sales@amul.coop', phone: '9556677889', address: 'Anand, Gujarat', gst: '24AAACA5505E1Z7', paymentTerms: 'Due on Receipt' },
    { companyName: 'Hindustan Unilever', email: 'orders@hul.co.in', phone: '9667788990', address: 'Andheri East, Mumbai, Maharashtra', gst: '27AAACH0090F1Z8', paymentTerms: 'Net 30' },
    { companyName: 'Godrej Consumer', email: 'trade@godrejcp.com', phone: '9778899001', address: 'Vikhroli, Mumbai, Maharashtra', gst: '27AAACG0080G1Z9', paymentTerms: 'Net 45' },
    { companyName: 'Tata Consumer Products', email: 'orders@tataconsumer.com', phone: '9889900112', address: 'Kolkata, West Bengal', gst: '19AAACT0070H1ZA', paymentTerms: 'Net 30' },
    { companyName: 'Marico Limited', email: 'sales@marico.com', phone: '9990011223', address: 'Bandra West, Mumbai, Maharashtra', gst: '27AAACM0060I1ZB', paymentTerms: 'Net 30' },
    { companyName: 'Wipro Consumer Care', email: 'orders@wiproconsumer.com', phone: '9001122334', address: 'Sarjapur, Bengaluru, Karnataka', gst: '29AAACW0050J1ZC', paymentTerms: 'Net 15' },
    { companyName: 'Adani Wilmar', email: 'trade@adaniwilmar.in', phone: '9112233445', address: 'Ahmedabad, Gujarat', gst: '24AAACA0040K1ZD', paymentTerms: 'Net 30' },
    { companyName: 'PepsiCo India', email: 'orders@pepsico.in', phone: '9223344556', address: 'DLF Cyber City, Gurugram, Haryana', gst: '06AAACP0030L1ZE', paymentTerms: 'Net 45' },
    { companyName: 'Coca-Cola India', email: 'procurement@coca-cola.in', phone: '9334455667', address: 'Noida, Uttar Pradesh', gst: '09AAACC0020M1ZF', paymentTerms: 'Net 30' }
  ];

  const suppliers = [];
  for (const s of suppliersData) {
    const supplier = await prisma.supplier.create({
      data: {
        companyName: s.companyName,
        email: s.email,
        phone: s.phone,
        address: s.address,
        gst: s.gst,
        paymentTerms: s.paymentTerms,
        organizationId: org.id,
      },
    });
    suppliers.push(supplier);
  }

  // ---------------------------------------------------------
  // 6. SEED CUSTOMERS (20 Customers)
  // ---------------------------------------------------------
  console.log('👥 Seeding 20 customers...');
  const customersData = [
    { name: 'Hyderabad Retail Mart', email: 'purchasing@hydmart.in', phone: '9800011101', gst: '36AAAPH1201A1ZA', address: 'Kukatpally, Hyderabad, Telangana', creditLimit: 200000 },
    { name: 'Deccan Wholesale Dealers', email: 'info@deccanwholesale.in', phone: '9800011102', gst: '36AAAPD2302B1ZB', address: 'Begum Bazar, Hyderabad, Telangana', creditLimit: 500000 },
    { name: 'Nippon Electronics Corp', email: 'procurement@nipponcorp.com', phone: '9800011103', gst: '36AAAPN3403C1ZC', address: 'Hitec City, Hyderabad, Telangana', creditLimit: 1000000 },
    { name: 'Ratnadeep Supermarket', email: 'stores@ratnadeep.in', phone: '9800011104', gst: '36AAAPR4504D1ZD', address: 'Ameerpet, Hyderabad, Telangana', creditLimit: 400000 },
    { name: 'Apollo Medical Stores', email: 'billing@apollopharmacy.in', phone: '9800011105', gst: '36AAAPA5605E1ZE', address: 'Jubilee Hills, Hyderabad, Telangana', creditLimit: 300000 },
    { name: 'Oakridge International School', email: 'facilities@oakridge.in', phone: '9800011106', gst: '36AAAPO6706F1ZF', address: 'Gachibowli, Hyderabad, Telangana', creditLimit: 150000 },
    { name: 'Taj Krishna Hotel', email: 'stores@tajkrishna.com', phone: '9800011107', gst: '36AAAPT7807G1ZG', address: 'Banjara Hills, Hyderabad, Telangana', creditLimit: 800000 },
    { name: 'Paradise Biryani Restaurant', email: 'accounts@paradisebiryani.in', phone: '9800011108', gst: '36AAAPP8908H1ZH', address: 'Secunderabad, Telangana', creditLimit: 300000 },
    { name: 'Vijayawada Grocery Hub', email: 'orders@vjdhub.in', phone: '9800011109', gst: '37AAAPV9009I1ZI', address: 'Benz Circle, Vijayawada, Andhra Pradesh', creditLimit: 250000 },
    { name: 'Amaravati Corporate Canteen', email: 'canteen@amaravati.gov.in', phone: '9800011110', gst: '37AAAPA0110J1ZJ', address: 'Nelapadu, Amaravati, Andhra Pradesh', creditLimit: 350000 },
    { name: 'Bengaluru Provision Store', email: 'bangaloreprovisions@gmail.com', phone: '9800011111', gst: '29AAAPB1211K1ZK', address: 'Indiranagar, Bengaluru, Karnataka', creditLimit: 180000 },
    { name: 'Karnataka Wholesale Bazar', email: 'procure@karnatakabazar.in', phone: '9800011112', gst: '29AAAPK2312L1ZL', address: 'Majestic, Bengaluru, Karnataka', creditLimit: 600000 },
    { name: 'Wipro Corporate Offices', email: 'pantry.supplies@wipro.com', phone: '9800011113', gst: '29AAAPW3413M1ZM', address: 'Sarjapur, Bengaluru, Karnataka', creditLimit: 500000 },
    { name: 'Metro Super Market', email: 'inventory@metrosm.in', phone: '9800011114', gst: '29AAAPM4514N1ZN', address: 'Yeshwanthpur, Bengaluru, Karnataka', creditLimit: 750000 },
    { name: 'MedPlus Medicals', email: 'procurement@medplusindia.com', phone: '9800011115', gst: '36AAAPM5615O1ZO', address: 'Kondapur, Hyderabad, Telangana', creditLimit: 250000 },
    { name: 'DPS School Secunderabad', email: 'admin@dpssecunderabad.in', phone: '9800011116', gst: '36AAAPD6716P1ZP', address: 'Secunderabad, Telangana', creditLimit: 100000 },
    { name: 'ITC Kakatiya Hotel', email: 'stores@itckakatiya.com', phone: '9800011117', gst: '36AAAPI7817Q1ZQ', address: 'Begumpet, Hyderabad, Telangana', creditLimit: 650000 },
    { name: 'Bawarchi Restaurant', email: 'bawarchi.hyd@yahoo.com', phone: '9800011118', gst: '36AAAPB8918R1ZR', address: 'RTC X Roads, Hyderabad, Telangana', creditLimit: 200000 },
    { name: 'Chennai Super Retailers', email: 'sales@chennairesellers.in', phone: '9800011119', gst: '33AAAPC9019S1ZS', address: 'T. Nagar, Chennai, Tamil Nadu', creditLimit: 400000 },
    { name: 'Grand Chola Hotel', email: 'procurement@grandchola.in', phone: '9800011120', gst: '33AAAPG0120T1ZT', address: 'Guindy, Chennai, Tamil Nadu', creditLimit: 900000 }
  ];

  const customers = [];
  for (const c of customersData) {
    const customer = await prisma.customer.create({
      data: {
        name: c.name,
        email: c.email,
        phone: c.phone,
        gst: c.gst,
        address: c.address,
        creditLimit: c.creditLimit,
        organizationId: org.id,
      },
    });
    customers.push(customer);
  }

  // ---------------------------------------------------------
  // 7. SEED PRODUCTS (45 Products)
  // ---------------------------------------------------------
  console.log('🌾 Seeding 45 realistic products...');
  const productsData = [
    // Groceries
    { sku: 'GR-RICE-025', name: 'Basmati Rice 5kg', brand: 'India Gate', category: 'Groceries', cost: 450, sale: 600, tax: 5, min: 20, max: 200, reorder: 50, desc: 'Premium aged Basmati Rice with rich aroma and extra-long grains.' },
    { sku: 'GR-SUGR-005', name: 'Sugar 5kg', brand: 'Madhur', category: 'Groceries', cost: 200, sale: 260, tax: 5, min: 30, max: 300, reorder: 60, desc: 'Pure, sulfur-free refined white sugar.' },
    { sku: 'GR-SUNO-005', name: 'Sunflower Oil 5L', brand: 'Fortune', category: 'Groceries', cost: 600, sale: 780, tax: 5, min: 15, max: 150, reorder: 30, desc: 'Refined sunflower cooking oil packed with nutrients.' },
    { sku: 'GR-FLUR-010', name: 'Wheat Flour 10kg', brand: 'Aashirvaad', category: 'Groceries', cost: 380, sale: 490, tax: 0, min: 25, max: 250, reorder: 50, desc: '100% pure whole wheat flour (Chakki Atta).' },
    { sku: 'GR-TDAL-002', name: 'Toor Dal 2kg', brand: 'Tata Sampann', category: 'Groceries', cost: 260, sale: 340, tax: 0, min: 20, max: 200, reorder: 40, desc: 'Unpolished premium pigeon pea lentils.' },
    { sku: 'GR-SALT-001', name: 'Salt 1kg', brand: 'Tata Salt', category: 'Groceries', cost: 20, sale: 28, tax: 0, min: 50, max: 500, reorder: 100, desc: 'Iodized salt, India\'s trusted salt for generations.' },
    
    // Beverages
    { sku: 'BV-TEA-001', name: 'Assam Tea 1kg', brand: 'Tata Tea', category: 'Beverages', cost: 320, sale: 420, tax: 5, min: 15, max: 150, reorder: 30, desc: 'Strong Assam CTC leaf blend for the perfect cup of tea.' },
    { sku: 'BV-COF-500', name: 'Instant Coffee 500g', brand: 'Nescafe', category: 'Beverages', cost: 480, sale: 620, tax: 18, min: 10, max: 100, reorder: 25, desc: 'Rich and aromatic classic instant coffee granules.' },
    { sku: 'BV-MAN-001', name: 'Mango Juice 1L', brand: 'Maaza', category: 'Beverages', cost: 60, sale: 85, tax: 12, min: 30, max: 300, reorder: 60, desc: 'Sweet mango fruit drink made from real Alphonso pulp.' },
    { sku: 'BV-WTR-001', name: 'Mineral Water 1L', brand: 'Bisleri', category: 'Beverages', cost: 12, sale: 20, tax: 18, min: 100, max: 1000, reorder: 200, desc: 'Purified drinking water with added minerals.' },
    
    // Food
    { sku: 'FD-KET-001', name: 'Tomato Ketchup 1kg', brand: 'Kissan', category: 'Food', cost: 110, sale: 150, tax: 12, min: 20, max: 200, reorder: 45, desc: 'Fresh tomato ketchup made from 100% real juicy tomatoes.' },
    { sku: 'FD-MAG-012', name: 'Maggi Noodles 12-Pack', brand: 'Nestle', category: 'Food', cost: 140, sale: 180, tax: 18, min: 30, max: 300, reorder: 70, desc: '2-Minute instant masala noodles block pack.' },
    { sku: 'FD-CFL-875', name: 'Corn Flakes 875g', brand: 'Kellogg\'s', category: 'Food', cost: 270, sale: 350, tax: 18, min: 15, max: 150, reorder: 35, desc: 'Healthy breakfast cereal made from golden corn.' },
    { sku: 'FD-BIS-005', name: 'Digestive Biscuits', brand: 'McVitie\'s', category: 'Food', cost: 60, sale: 80, tax: 18, min: 40, max: 400, reorder: 80, desc: 'Wholewheat fiber-rich delicious digestive biscuits.' },
    { sku: 'FD-CHO-375', name: 'Chocos 375g', brand: 'Kellogg\'s', category: 'Food', cost: 150, sale: 210, tax: 18, min: 15, max: 150, reorder: 30, desc: 'Yummy chocolate-flavored crunchy wheat scoops.' },
    { sku: 'FD-MILK-001', name: 'Milk Powder 1kg', brand: 'Amulya', category: 'Food', cost: 380, sale: 460, tax: 5, min: 20, max: 200, reorder: 40, desc: 'Dairy whitener powder from fresh milk.' },
    { sku: 'FD-HNY-500', name: 'Honey 500g', brand: 'Dabur', category: 'Food', cost: 180, sale: 240, tax: 5, min: 15, max: 150, reorder: 30, desc: '100% pure natural squeezy honey.' },
    { sku: 'FD-DKC-080', name: 'Dark Chocolate', brand: 'Amul', category: 'Food', cost: 80, sale: 110, tax: 18, min: 25, max: 250, reorder: 50, desc: 'Rich and smooth premium dark chocolate bar.' },
    
    // Personal Care
    { sku: 'PC-SOAP-125', name: 'Bathing Soap 125g', brand: 'Dove', category: 'Personal Care', cost: 48, sale: 65, tax: 18, min: 50, max: 500, reorder: 100, desc: 'Cream beauty bathing bar with moisturizing cream.' },
    { sku: 'PC-PAST-150', name: 'Herbal Toothpaste', brand: 'Colgate', category: 'Personal Care', cost: 85, sale: 115, tax: 18, min: 40, max: 400, reorder: 80, desc: 'Herbal toothpaste containing clove, mint, and neem.' },
    { sku: 'PC-SHMP-340', name: 'Anti-Hairfall Shampoo', brand: 'Clinic Plus', category: 'Personal Care', cost: 190, sale: 260, tax: 18, min: 25, max: 250, reorder: 50, desc: 'Strong hair shampoo infused with milk protein.' },
    { sku: 'PC-HDWS-001', name: 'Hand Wash Refill 1L', brand: 'Dettol', category: 'Personal Care', cost: 160, sale: 220, tax: 18, min: 30, max: 300, reorder: 60, desc: 'Liquid handwash refill offering germ protection.' },
    { sku: 'PC-CREM-200', name: 'Moisturizing Cream', brand: 'Nivea', category: 'Personal Care', cost: 210, sale: 290, tax: 18, min: 15, max: 150, reorder: 30, desc: 'General-purpose skin softening moisturizer cream.' },
    { sku: 'PC-FWS-100', name: 'Face Wash 100g', brand: 'Himalaya', category: 'Personal Care', cost: 95, sale: 130, tax: 18, min: 20, max: 200, reorder: 40, desc: 'Purifying neem face wash for acne-free skin.' },
    { sku: 'PC-WIP-080', name: 'Baby Wipes 80-Pack', brand: 'Himalaya', category: 'Personal Care', cost: 120, sale: 180, tax: 18, min: 30, max: 300, reorder: 60, desc: 'Gentle baby wipes with aloe vera and lotus extracts.' },
    
    // Cleaning
    { sku: 'CL-DET-005', name: 'Detergent Powder 5kg', brand: 'Surf Excel', category: 'Cleaning', cost: 550, sale: 720, tax: 18, min: 20, max: 200, reorder: 40, desc: 'Easy wash detergent powder for spotless clothes.' },
    { sku: 'CL-DWSH-002', name: 'Dishwash Liquid 2L', brand: 'Vim', category: 'Cleaning', cost: 280, sale: 370, tax: 18, min: 15, max: 150, reorder: 35, desc: 'Lemon scent grease cutting dishwashing liquid.' },
    { sku: 'CL-FLC-005', name: 'Floor Cleaner 5L', brand: 'Lizol', category: 'Cleaning', cost: 390, sale: 520, tax: 18, min: 10, max: 100, reorder: 25, desc: 'Disinfectant surface and floor cleaner liquid.' },
    { sku: 'CL-TLC-001', name: 'Toilet Cleaner 1L', brand: 'Harpic', category: 'Cleaning', cost: 140, sale: 195, tax: 18, min: 25, max: 250, reorder: 50, desc: 'Power plus original toilet cleaning liquid.' },
    { sku: 'CL-GLC-500', name: 'Glass Cleaner 500ml', brand: 'Colin', category: 'Cleaning', cost: 75, sale: 105, tax: 18, min: 20, max: 200, reorder: 40, desc: 'Multi-purpose household glass cleaner spray.' },
    { sku: 'CL-SAN-500', name: 'Sanitizer 500ml', brand: 'Dettol', category: 'Cleaning', cost: 120, sale: 180, tax: 18, min: 15, max: 150, reorder: 30, desc: 'Instant hand sanitizer gel with 70% alcohol.' },
    
    // Household
    { sku: 'HH-BAG-030', name: 'Garbage Bags 30-Pack', brand: 'Presto', category: 'Household', cost: 90, sale: 130, tax: 18, min: 40, max: 400, reorder: 80, desc: 'Oxo-biodegradable medium garbage bags.' },
    { sku: 'HH-AFR-250', name: 'Air Freshener Spray', brand: 'Godrej Aer', category: 'Household', cost: 110, sale: 160, tax: 18, min: 20, max: 200, reorder: 40, desc: 'Fresh lush green home fragrance spray.' },
    { sku: 'HH-MOS-001', name: 'Mosquito Vaporizer', brand: 'Goodknight', category: 'Household', cost: 72, sale: 99, tax: 18, min: 30, max: 300, reorder: 60, desc: 'Gold flash mosquito liquid repellent refill.' },
    
    // Electronics
    { sku: 'EL-BULB-09', name: 'LED Bulb 9W', brand: 'Syska', category: 'Electronics', cost: 80, sale: 120, tax: 18, min: 30, max: 300, reorder: 60, desc: 'Cool day light energy saving LED bulb.' },
    { sku: 'EL-EXTB-04', name: 'Extension Board 4-Socket', brand: 'Anchor', category: 'Electronics', cost: 290, sale: 399, tax: 18, min: 15, max: 150, reorder: 30, desc: 'Heavy duty spike guard and extension board.' },
    { sku: 'EL-CHG-TYC', name: 'Type-C Charger', brand: 'Portronics', category: 'Electronics', cost: 180, sale: 299, tax: 18, min: 20, max: 200, reorder: 40, desc: 'Fast charging Type-C mobile adapter.' },
    { sku: 'EL-PWB-10K', name: 'Power Bank 10000mAh', brand: 'Ambrane', category: 'Electronics', cost: 650, sale: 999, tax: 18, min: 10, max: 100, reorder: 25, desc: 'Li-Polymer dual output fast charging power bank.' },
    { sku: 'EL-MOU-WRL', name: 'Wireless Mouse', brand: 'Logitech', category: 'Electronics', cost: 450, sale: 699, tax: 18, min: 15, max: 150, reorder: 30, desc: 'Ergonomic 2.4GHz silent wireless mouse.' },
    { sku: 'EL-KEY-WRD', name: 'Wired Keyboard', brand: 'Dell', category: 'Electronics', cost: 380, sale: 599, tax: 18, min: 15, max: 150, reorder: 30, desc: 'Standard business wired black keyboard.' },
    
    // Office Supplies
    { sku: 'OS-PAP-A4P', name: 'A4 Copier Paper (500 sheets)', brand: 'JK Paper', category: 'Office Supplies', cost: 220, sale: 310, tax: 12, min: 30, max: 300, reorder: 75, desc: '75GSM bright white multipurpose copier paper.' },
    { sku: 'OS-PEN-020', name: 'Gel Pens 20-Pack', brand: 'Butterflow', category: 'Office Supplies', cost: 90, sale: 150, tax: 12, min: 40, max: 400, reorder: 80, desc: 'Smooth writing blue ink gel pens pack.' },
    { sku: 'OS-NOT-005', name: 'Ruled Notebook', brand: 'Classmate', category: 'Office Supplies', cost: 45, sale: 65, tax: 12, min: 50, max: 500, reorder: 100, desc: 'Single line ruled long notebook 172 pages.' },
    { sku: 'OS-BAG-WDF', name: 'Laptop Bag', brand: 'Wildcraft', category: 'Office Supplies', cost: 750, sale: 1299, tax: 18, min: 10, max: 100, reorder: 20, desc: 'Water-resistant compartments laptop backpack.' },
    { sku: 'OS-MKR-004', name: 'Whiteboard Markers', brand: 'Camel', category: 'Office Supplies', cost: 80, sale: 120, tax: 12, min: 25, max: 250, reorder: 50, desc: 'Easy wipe dry erase whiteboard marker set.' }
  ];

  const products = [];
  for (let i = 0; i < productsData.length; i++) {
    const p = productsData[i];
    const category = categories[p.category];
    const supplier = suppliers[i % suppliers.length];
    
    const product = await prisma.product.create({
      data: {
        sku: p.sku,
        barcode: `8901030${i.toString().padStart(6, '0')}`,
        name: p.name,
        brand: p.brand,
        description: p.desc,
        costPrice: p.cost,
        sellingPrice: p.sale,
        taxRate: p.tax,
        weight: 0.5 + (i * 0.05),
        minimumStock: p.min,
        maximumStock: p.max,
        reorderLevel: p.reorder,
        imageUrl: `https://images.unsplash.com/photo-${1600000000000 + i * 100000}?w=400&auto=format&fit=crop&q=60`,
        status: 'ACTIVE',
        organizationId: org.id,
        categoryId: category.id,
        supplierId: supplier.id,
      },
    });
    products.push(product);
  }

  // ---------------------------------------------------------
  // 8. POPULATE INITIAL INVENTORY AND HISTORICAL OPENING STOCK
  // ---------------------------------------------------------
  console.log('📈 Populating initial stock and ledger transactions...');
  const inventoryList = [];
  const baseQtyByWarehouseIndex = [100, 50, 60, 70, 80];

  for (const product of products) {
    for (let w = 0; w < warehouses.length; w++) {
      const warehouse = warehouses[w];
      const initialQty = baseQtyByWarehouseIndex[w] + (Number(product.sku.length) % 5) * 5;
      
      const inv = await prisma.inventory.create({
        data: {
          productId: product.id,
          warehouseId: warehouse.id,
          quantity: initialQty,
        },
      });
      inventoryList.push(inv);

      await prisma.inventoryTransaction.create({
        data: {
          inventoryId: inv.id,
          type: TransactionType.OPENING_STOCK,
          quantity: initialQty,
          previousQuantity: 0,
          newQuantity: initialQty,
          reason: 'Initial opening stock seeding',
          performedBy: examinerUser.id,
          createdAt: new Date('2026-07-01T10:00:00Z'),
        },
      });
    }
  }

  const recordStockMovement = async (productId: string, warehouseId: string, type: TransactionType, quantity: number, reason: string, date: Date) => {
    const inv = await prisma.inventory.findFirst({
      where: { productId, warehouseId }
    });
    if (!inv) return;
    
    const prevQty = inv.quantity;
    let newQty = prevQty;
    
    if (type === TransactionType.PURCHASE || type === TransactionType.RETURN) {
      newQty += quantity;
    } else if (type === TransactionType.SALE || type === TransactionType.DAMAGE || type === TransactionType.EXPIRED) {
      newQty -= quantity;
    }
    
    await prisma.inventory.update({
      where: { id: inv.id },
      data: { quantity: newQty }
    });

    await prisma.inventoryTransaction.create({
      data: {
        inventoryId: inv.id,
        type,
        quantity,
        previousQuantity: prevQty,
        newQuantity: newQty,
        reason,
        performedBy: examinerUser.id,
        createdAt: date,
      }
    });
  };

  // ---------------------------------------------------------
  // 9. SEED PURCHASE ORDERS (20 POs) & BILLS & PAYMENTS
  // ---------------------------------------------------------
  console.log('🛒 Seeding 20 Purchase Orders...');
  
  const poStatuses = [
    PurchaseOrderStatus.COMPLETED,
    PurchaseOrderStatus.COMPLETED,
    PurchaseOrderStatus.RECEIVED,
    PurchaseOrderStatus.COMPLETED,
    PurchaseOrderStatus.APPROVED,
    PurchaseOrderStatus.PENDING,
    PurchaseOrderStatus.DRAFT,
    PurchaseOrderStatus.COMPLETED,
    PurchaseOrderStatus.RECEIVED,
    PurchaseOrderStatus.COMPLETED,
    PurchaseOrderStatus.APPROVED,
    PurchaseOrderStatus.PENDING,
    PurchaseOrderStatus.DRAFT,
    PurchaseOrderStatus.COMPLETED,
    PurchaseOrderStatus.COMPLETED,
    PurchaseOrderStatus.COMPLETED,
    PurchaseOrderStatus.APPROVED,
    PurchaseOrderStatus.PENDING,
    PurchaseOrderStatus.DRAFT,
    PurchaseOrderStatus.COMPLETED
  ];

  const baseDate = new Date('2026-07-15T12:00:00Z');
  
  for (let i = 0; i < 20; i++) {
    const status = poStatuses[i];
    const supplier = suppliers[i % suppliers.length];
    const p1 = products[(i * 2) % products.length];
    const p2 = products[(i * 2 + 1) % products.length];
    
    const qty1 = 50 + (i * 5);
    const qty2 = 30 + (i * 2);
    
    const amount1 = Number(p1.costPrice) * qty1;
    const amount2 = Number(p2.costPrice) * qty2;
    const itemsTotal = amount1 + amount2;
    
    const shipping = 250;
    const tax = itemsTotal * 0.18;
    const grandTotal = itemsTotal + shipping + tax;
    
    const poDate = new Date(baseDate);
    poDate.setDate(poDate.getDate() - (14 - (i % 14)));
    
    const poNumber = `PO-2026-${(i + 1).toString().padStart(3, '0')}`;

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber,
        status,
        supplierId: supplier.id,
        organizationId: org.id,
        totalAmount: grandTotal,
        shippingCost: shipping,
        taxAmount: tax,
        expectedDate: new Date(poDate.getTime() + 5 * 24 * 60 * 60 * 1000),
        notes: `Procurement for ${poNumber}. Reorder batch.`,
        createdAt: poDate,
        updatedAt: poDate,
        items: {
          create: [
            {
              productId: p1.id,
              quantity: qty1,
              unitPrice: p1.costPrice,
              receivedQuantity: (status === PurchaseOrderStatus.RECEIVED || status === PurchaseOrderStatus.COMPLETED) ? qty1 : 0,
            },
            {
              productId: p2.id,
              quantity: qty2,
              unitPrice: p2.costPrice,
              receivedQuantity: (status === PurchaseOrderStatus.RECEIVED || status === PurchaseOrderStatus.COMPLETED) ? qty2 : 0,
            }
          ]
        }
      }
    });

    if (status === PurchaseOrderStatus.RECEIVED || status === PurchaseOrderStatus.COMPLETED) {
      await recordStockMovement(p1.id, warehouses[0].id, TransactionType.PURCHASE, qty1, `Received PO ${poNumber}`, poDate);
      await recordStockMovement(p2.id, warehouses[0].id, TransactionType.PURCHASE, qty2, `Received PO ${poNumber}`, poDate);
      
      const billStatus = status === PurchaseOrderStatus.COMPLETED ? BillStatus.PAID : (i % 2 === 0 ? BillStatus.PARTIAL : BillStatus.OPEN);
      const paid = billStatus === BillStatus.PAID ? grandTotal : (billStatus === BillStatus.PARTIAL ? grandTotal / 2 : 0);
      const balance = grandTotal - paid;
      
      const bill = await prisma.bill.create({
        data: {
          billNumber: `BILL-${poNumber}`,
          purchaseOrderId: po.id,
          supplierId: supplier.id,
          organizationId: org.id,
          status: billStatus,
          totalAmount: grandTotal,
          balanceDue: balance,
          billDate: poDate,
          dueDate: new Date(poDate.getTime() + 15 * 24 * 60 * 60 * 1000),
          notes: `Auto-generated bill for PO ${poNumber}`,
          createdAt: poDate,
        }
      });
      
      await prisma.billItem.createMany({
        data: [
          { billId: bill.id, productId: p1.id, quantity: qty1, unitPrice: p1.costPrice, totalAmount: amount1 },
          { billId: bill.id, productId: p2.id, quantity: qty2, unitPrice: p2.costPrice, totalAmount: amount2 }
        ]
      });

      if (paid > 0) {
        await prisma.paymentMade.create({
          data: {
            billId: bill.id,
            supplierId: supplier.id,
            organizationId: org.id,
            amount: paid,
            paymentDate: poDate,
            paymentMethod: i % 2 === 0 ? 'BANK_TRANSFER' : 'CASH',
            referenceNumber: `TXN-P-999${i}`,
            notes: `Seeded payment for ${bill.billNumber}`,
            createdAt: poDate,
          }
        });
      }
    }
  }

  // ---------------------------------------------------------
  // 10. SEED SALES ORDERS (20 SOs) & INVOICES & PAYMENTS
  // ---------------------------------------------------------
  console.log('📈 Seeding 20 Sales Orders...');

  const soStatuses = [
    SalesOrderStatus.COMPLETED,
    SalesOrderStatus.COMPLETED,
    SalesOrderStatus.DISPATCHED,
    SalesOrderStatus.COMPLETED,
    SalesOrderStatus.APPROVED,
    SalesOrderStatus.PENDING,
    SalesOrderStatus.DRAFT,
    SalesOrderStatus.COMPLETED,
    SalesOrderStatus.DISPATCHED,
    SalesOrderStatus.COMPLETED,
    SalesOrderStatus.APPROVED,
    SalesOrderStatus.PENDING,
    SalesOrderStatus.DRAFT,
    SalesOrderStatus.COMPLETED,
    SalesOrderStatus.COMPLETED,
    SalesOrderStatus.COMPLETED,
    SalesOrderStatus.APPROVED,
    SalesOrderStatus.PENDING,
    SalesOrderStatus.DRAFT,
    SalesOrderStatus.COMPLETED
  ];

  for (let i = 0; i < 20; i++) {
    const status = soStatuses[i];
    const customer = customers[i % customers.length];
    const p1 = products[(i * 3) % products.length];
    const p2 = products[(i * 3 + 2) % products.length];
    
    const qty1 = 10 + (i * 2);
    const qty2 = 5 + i;
    
    const amount1 = Number(p1.sellingPrice) * qty1;
    const amount2 = Number(p2.sellingPrice) * qty2;
    const itemsTotal = amount1 + amount2;
    
    const shipping = 150;
    const tax = itemsTotal * (Number(p1.taxRate) / 100);
    const grandTotal = itemsTotal + shipping + tax;
    
    const soDate = new Date(baseDate);
    soDate.setDate(soDate.getDate() - (14 - (i % 14)));
    
    const soNumber = `SO-2026-${(i + 1).toString().padStart(3, '0')}`;

    const so = await prisma.salesOrder.create({
      data: {
        soNumber,
        status,
        customerId: customer.id,
        organizationId: org.id,
        totalAmount: grandTotal,
        shippingCost: shipping,
        taxAmount: tax,
        discountAmount: 0,
        notes: `Sales order ${soNumber}. Standard corporate dispatch.`,
        createdAt: soDate,
        updatedAt: soDate,
        items: {
          create: [
            {
              productId: p1.id,
              quantity: qty1,
              unitPrice: p1.sellingPrice,
              shippedQuantity: (status === SalesOrderStatus.DISPATCHED || status === SalesOrderStatus.COMPLETED) ? qty1 : 0,
              taxAmount: amount1 * (Number(p1.taxRate) / 100),
            },
            {
              productId: p2.id,
              quantity: qty2,
              unitPrice: p2.sellingPrice,
              shippedQuantity: (status === SalesOrderStatus.DISPATCHED || status === SalesOrderStatus.COMPLETED) ? qty2 : 0,
              taxAmount: amount2 * (Number(p2.taxRate) / 100),
            }
          ]
        }
      }
    });

    if (status === SalesOrderStatus.DISPATCHED || status === SalesOrderStatus.COMPLETED) {
      await recordStockMovement(p1.id, warehouses[0].id, TransactionType.SALE, qty1, `Shipped SO ${soNumber}`, soDate);
      await recordStockMovement(p2.id, warehouses[0].id, TransactionType.SALE, qty2, `Shipped SO ${soNumber}`, soDate);
      
      const invStatus = status === SalesOrderStatus.COMPLETED ? InvoiceStatus.PAID : (i % 2 === 0 ? InvoiceStatus.PARTIAL : InvoiceStatus.SENT);
      const paid = invStatus === InvoiceStatus.PAID ? grandTotal : (invStatus === InvoiceStatus.PARTIAL ? grandTotal / 2 : 0);
      const balance = grandTotal - paid;
      
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: `INV-${soNumber}`,
          salesOrderId: so.id,
          customerId: customer.id,
          organizationId: org.id,
          status: invStatus,
          totalAmount: grandTotal,
          balanceDue: balance,
          issuedDate: soDate,
          dueDate: new Date(soDate.getTime() + 30 * 24 * 60 * 60 * 1000),
          notes: `Auto-generated invoice for SO ${soNumber}`,
          createdAt: soDate,
        }
      });
      
      await prisma.invoiceItem.createMany({
        data: [
          { invoiceId: invoice.id, productId: p1.id, quantity: qty1, unitPrice: p1.sellingPrice, totalAmount: amount1, taxAmount: amount1 * (Number(p1.taxRate) / 100) },
          { invoiceId: invoice.id, productId: p2.id, quantity: qty2, unitPrice: p2.sellingPrice, totalAmount: amount2, taxAmount: amount2 * (Number(p2.taxRate) / 100) }
        ]
      });

      if (paid > 0) {
        await prisma.paymentReceived.create({
          data: {
            invoiceId: invoice.id,
            customerId: customer.id,
            organizationId: org.id,
            amount: paid,
            paymentDate: soDate,
            paymentMethod: i % 2 === 0 ? 'BANK_TRANSFER' : 'CARD',
            referenceNumber: `TXN-R-999${i}`,
            notes: `Seeded payment for ${invoice.invoiceNumber}`,
            createdAt: soDate,
          }
        });
      }
    }
  }

  // ---------------------------------------------------------
  // 11. EXTRA LEDGER TRANSACTIONS FOR INVENTORY HISTORY
  // ---------------------------------------------------------
  console.log('🔄 Seeding inventory transfers, adjustments, damages, and returns...');
  
  for (let t = 0; t < 5; t++) {
    const prod = products[t * 5];
    const qty = 5;
    const date = new Date(baseDate);
    date.setDate(date.getDate() - (5 - t));
    
    await recordStockMovement(prod.id, warehouses[0].id, TransactionType.SALE, qty, `Transfer Out to ${warehouses[2].name}`, date);
    await recordStockMovement(prod.id, warehouses[2].id, TransactionType.PURCHASE, qty, `Transfer In from ${warehouses[0].name}`, date);
  }

  for (let a = 0; a < 5; a++) {
    const prod = products[a * 5 + 1];
    const qty = 3;
    const date = new Date(baseDate);
    date.setDate(date.getDate() - (6 - a));
    
    await recordStockMovement(prod.id, warehouses[1].id, TransactionType.PURCHASE, qty, 'Cyclic count surplus adjustment', date);
  }

  for (let d = 0; d < 3; d++) {
    const prod = products[d * 5 + 2];
    const qty = 2;
    const date = new Date(baseDate);
    date.setDate(date.getDate() - (4 - d));
    
    await recordStockMovement(prod.id, warehouses[3].id, TransactionType.DAMAGE, qty, 'Stock damaged due to water leakage', date);
  }

  for (let r = 0; r < 3; r++) {
    const prod = products[r * 5 + 3];
    const qty = 2;
    const date = new Date(baseDate);
    date.setDate(date.getDate() - (3 - r));
    
    await recordStockMovement(prod.id, warehouses[4].id, TransactionType.RETURN, qty, 'Customer return - incorrect product size', date);
  }

  // ---------------------------------------------------------
  // 12. AUDIT LOGS AND NOTIFICATIONS
  // ---------------------------------------------------------
  console.log('🔔 Generating activity feed & notifications...');
  
  const auditLogsData = [
    { action: 'CREATE', entity: 'Product', entityId: products[0].id, metadata: { sku: products[0].sku, name: products[0].name } },
    { action: 'UPDATE', entity: 'Supplier', entityId: suppliers[0].id, metadata: { companyName: suppliers[0].companyName, field: 'paymentTerms' } },
    { action: 'CREATE', entity: 'Warehouse', entityId: warehouses[0].id, metadata: { name: warehouses[0].name } },
    { action: 'APPROVE', entity: 'PurchaseOrder', entityId: 'po-approved-id', metadata: { poNumber: 'PO-2026-005', supplier: suppliers[0].companyName } },
    { action: 'DISPATCH', entity: 'SalesOrder', entityId: 'so-dispatched-id', metadata: { soNumber: 'SO-2026-003', customer: customers[0].name } },
    { action: 'RECEIVE_PAYMENT', entity: 'Invoice', entityId: 'inv-paid-id', metadata: { invoiceNumber: 'INV-SO-2026-001', amount: 5000 } },
    { action: 'CREATE', entity: 'Customer', entityId: customers[0].id, metadata: { name: customers[0].name, email: customers[0].email } },
    { action: 'TRANSFER', entity: 'Inventory', entityId: products[0].id, metadata: { from: warehouses[0].name, to: warehouses[2].name, quantity: 5 } }
  ];

  for (let idx = 0; idx < auditLogsData.length; idx++) {
    const al = auditLogsData[idx];
    const logDate = new Date(baseDate);
    logDate.setMinutes(logDate.getMinutes() - (auditLogsData.length - idx) * 10);
    
    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        userId: examinerUser.id,
        action: al.action,
        entity: al.entity,
        entityId: al.entityId,
        metadata: JSON.stringify(al.metadata),
        createdAt: logDate,
      }
    });

    await prisma.notification.create({
      data: {
        organizationId: org.id,
        userId: examinerUser.id,
        type: 'SYSTEM_ALERT',
        title: `${al.entity} ${al.action.toLowerCase() === 'create' ? 'Created' : al.action.toLowerCase() + 'd'}`,
        message: `Entity ${al.entity} has been successfully ${al.action.toLowerCase()}d. Details: ${JSON.stringify(al.metadata)}`,
        entityType: al.entity,
        entityId: al.entityId,
        isRead: false,
        createdAt: logDate,
      }
    });
  }

  console.log('🏁 Database seeding process completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
