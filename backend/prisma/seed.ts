import { PrismaClient, UserRole, CustomerType, CustomerStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create users
  const password = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fundsroom.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@fundsroom.com',
      password,
      role: UserRole.ADMIN,
    },
  });

  const sales = await prisma.user.upsert({
    where: { email: 'sales@fundsroom.com' },
    update: {},
    create: {
      name: 'Sales User',
      email: 'sales@fundsroom.com',
      password,
      role: UserRole.SALES,
    },
  });

  const warehouse = await prisma.user.upsert({
    where: { email: 'warehouse@fundsroom.com' },
    update: {},
    create: {
      name: 'Warehouse User',
      email: 'warehouse@fundsroom.com',
      password,
      role: UserRole.WAREHOUSE,
    },
  });

  const accounts = await prisma.user.upsert({
    where: { email: 'accounts@fundsroom.com' },
    update: {},
    create: {
      name: 'Accounts User',
      email: 'accounts@fundsroom.com',
      password,
      role: UserRole.ACCOUNTS,
    },
  });

  console.log('✅ Users created:', { admin: admin.email, sales: sales.email, warehouse: warehouse.email, accounts: accounts.email });

  // Create customers
  const customers = [
    {
      name: 'Rajesh Kumar',
      mobile: '9876543210',
      email: 'rajesh@sharmatraders.com',
      businessName: 'Sharma Traders',
      gstNumber: '29ABCDE1234F1Z5',
      customerType: CustomerType.WHOLESALE,
      address: '123, MG Road, Bengaluru, Karnataka - 560001',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(),
    },
    {
      name: 'Meena Sharma',
      mobile: '9123456780',
      email: 'meena@guptaenterprises.com',
      businessName: 'Gupta Enterprises',
      gstNumber: '27GHIJK5678L1M2',
      customerType: CustomerType.DISTRIBUTOR,
      address: '45, Ring Road, Mumbai, Maharashtra - 400001',
      status: CustomerStatus.ACTIVE,
      followUpDate: null,
    },
    {
      name: 'Arjun Patel',
      mobile: '9988776655',
      email: 'arjun@patelretail.com',
      businessName: 'Patel Retail Store',
      gstNumber: null,
      customerType: CustomerType.RETAIL,
      address: '89, Main Bazaar, Ahmedabad, Gujarat - 380001',
      status: CustomerStatus.LEAD,
      followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Priya Venkat',
      mobile: '8765432190',
      email: 'priya@venkatsales.com',
      businessName: 'Venkat Sales & Distribution',
      gstNumber: '33MNOPQ9012R3S4',
      customerType: CustomerType.WHOLESALE,
      address: '15, Anna Salai, Chennai, Tamil Nadu - 600002',
      status: CustomerStatus.INACTIVE,
      followUpDate: null,
    },
    {
      name: 'Suresh Reddy',
      mobile: '9090909090',
      email: 'suresh@reddyfoods.com',
      businessName: 'Reddy Food Suppliers',
      gstNumber: '36TUVWX3456Y7Z8',
      customerType: CustomerType.DISTRIBUTOR,
      address: '67, Banjara Hills, Hyderabad, Telangana - 500034',
      status: CustomerStatus.ACTIVE,
      followUpDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ];

  let createdCustomers = [];
  for (const c of customers) {
    const existing = await prisma.customer.findFirst({
      where: { OR: [{ email: c.email }, { mobile: c.mobile }] },
    });
    if (!existing) {
      const customer = await prisma.customer.create({
        data: { ...c, createdBy: sales.id },
      });
      createdCustomers.push(customer);
    }
  }

  // Add follow-ups
  if (createdCustomers.length > 0) {
    const customerWithFollowUp = createdCustomers.find((c) => c.name === 'Suresh Reddy');
    if (customerWithFollowUp) {
      await prisma.followUp.create({
        data: {
          note: 'Discussed bulk order for next month. Customer interested in 500 units.',
          customerId: customerWithFollowUp.id,
          createdBy: sales.id,
        },
      });
      await prisma.followUp.create({
        data: {
          note: 'Called to check delivery status. Always satisfied with service.',
          customerId: customerWithFollowUp.id,
          createdBy: sales.id,
        },
      });
    }
  }

  console.log('✅ Customers created:', createdCustomers.length);

  // Create products
  const products = [
    { name: 'Premium Basmati Rice', sku: 'RICE-BSM-001', category: 'Grains', unitPrice: 750, currentStock: 500, minStockAlert: 100, location: 'Warehouse A - Rack 1' },
    { name: 'Toor Dal', sku: 'DAL-TOO-001', category: 'Pulses', unitPrice: 140, currentStock: 300, minStockAlert: 50, location: 'Warehouse A - Rack 2' },
    { name: 'Sunflower Oil 1L', sku: 'OIL-SUN-001', category: 'Oils', unitPrice: 120, currentStock: 80, minStockAlert: 100, location: 'Warehouse B - Rack 1' },
    { name: 'Sugar 5kg', sku: 'SUG-5KG-001', category: 'Essentials', unitPrice: 220, currentStock: 200, minStockAlert: 40, location: 'Warehouse B - Rack 2' },
    { name: 'Wheat Atta 10kg', sku: 'ATTA-WHT-001', category: 'Flour', unitPrice: 450, currentStock: 150, minStockAlert: 30, location: 'Warehouse A - Rack 3' },
    { name: 'Elaichi Tea 250g', sku: 'TEA-ELA-001', category: 'Beverages', unitPrice: 95, currentStock: 25, minStockAlert: 50, location: 'Warehouse C - Rack 1' },
    { name: 'Garam Masala 100g', sku: 'MAS-GAR-001', category: 'Spices', unitPrice: 60, currentStock: 400, minStockAlert: 80, location: 'Warehouse C - Rack 2' },
    { name: 'Coconut Oil 500ml', sku: 'OIL-COC-001', category: 'Oils', unitPrice: 180, currentStock: 60, minStockAlert: 25, location: 'Warehouse B - Rack 3' },
    { name: 'Mixed Nuts 200g', sku: 'NUT-MIX-001', category: 'Snacks', unitPrice: 260, currentStock: 10, minStockAlert: 15, location: 'Warehouse C - Rack 3' },
    { name: 'Organic Honey 500g', sku: 'HON-ORG-001', category: 'Essentials', unitPrice: 320, currentStock: 90, minStockAlert: 20, location: 'Warehouse A - Rack 4' },
  ];

  let createdProducts = [];
  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
    if (!existing) {
      const product = await prisma.product.create({
        data: { ...p, createdBy: warehouse.id },
      });
      createdProducts.push(product);

      // Initial stock movement
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          quantityChanged: p.currentStock,
          movementType: 'IN',
          reason: 'Initial stock setup during seeding',
          createdBy: warehouse.id,
        },
      });
    }
  }

  console.log('✅ Products created:', createdProducts.length);

  // Create a sample challan
  if (createdCustomers.length > 0 && createdProducts.length > 0) {
    const existingChallans = await prisma.challan.count();
    if (existingChallans === 0) {
      const customer = createdCustomers[0] || await prisma.customer.findFirst();
      const productsList = createdProducts.slice(0, 3);
      const totalQuantity = productsList.reduce((sum, p) => sum + (p.sku.includes('001') ? 10 : 5), 0);

      const challanData: any = {
        challanNumber: `CH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`,
        totalQuantity,
        status: 'CONFIRMED',
        customerId: customer!.id,
        createdBy: sales.id,
        items: {
          create: productsList.map((p, idx) => ({
            productId: p.id,
            productName: p.name,
            productSku: p.sku,
            unitPrice: p.unitPrice,
            quantity: idx === 0 ? 10 : 5,
          })),
        },
      };

      await prisma.challan.create({ data: challanData });

      // Reduce stock for confirmed challan
      for (let i = 0; i < productsList.length; i++) {
        const p = productsList[i];
        const qty = i === 0 ? 10 : 5;
        await prisma.product.update({
          where: { id: p.id },
          data: { currentStock: p.currentStock - qty },
        });
        await prisma.stockMovement.create({
          data: {
            productId: p.id,
            quantityChanged: qty,
            movementType: 'OUT',
            reason: `Challan ${challanData.challanNumber}`,
            createdBy: sales.id,
          },
        });
      }

      console.log('✅ Sample challan created');
    }
  }

  console.log('✅ Seed completed successfully!');
  console.log('\n📋 Test credentials:');
  console.log('   Admin:     admin@fundsroom.com / password123');
  console.log('   Sales:     sales@fundsroom.com / password123');
  console.log('   Warehouse: warehouse@fundsroom.com / password123');
  console.log('   Accounts:  accounts@fundsroom.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });