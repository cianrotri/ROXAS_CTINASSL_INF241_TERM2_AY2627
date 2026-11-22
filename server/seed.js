require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Delivery = require('./models/Delivery');

const PRODUCTS = [
  { slug: 'chiikawa', name: 'CHIIKAWA PLUSH', price: 1999, stock: 24 },
  { slug: 'hachiware', name: 'HACHIWARE PLUSH', price: 1999, stock: 18 },
  { slug: 'usagi', name: 'USAGI PLUSH', price: 1999, stock: 30 },
  { slug: 'momonga', name: 'MOMONGA PLUSH', price: 1999, stock: 22 },
  { slug: 'rakko', name: 'RAKKO PLUSH', price: 1999, stock: 15 },
  { slug: 'kurimanju', name: 'KURIMANJU PLUSH', price: 1999, stock: 20 },
  { slug: 'furuhonya', name: 'FURUHONYA PLUSH', price: 1999, stock: 12 },
  { slug: 'shisa', name: 'SHISA PLUSH', price: 1999, stock: 16 },
].map((p) => ({
  ...p,
  imageUrl: `/assets/plush/${p.slug}.png`,
  lastRestock: new Date('2025-11-01'),
}));

async function upsertUser({ email, password, ...profile }) {
  const hash = await bcrypt.hash(password, 10);
  let user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    user.password = hash;
    Object.assign(user, profile);
    await user.save();
  } else {
    user = await User.create({ email, password: hash, ...profile });
  }
  return user;
}

async function syncProducts() {
  const ids = {};
  for (const p of PRODUCTS) {
    const doc = await Product.findOneAndUpdate(
      { name: p.name },
      { $set: p },
      { upsert: true, returnDocument: 'after' }
    );
    ids[p.slug] = doc._id;
  }
  const extra = await Product.find({ name: { $nin: PRODUCTS.map((x) => x.name) } });
  if (extra.length) {
    await Product.deleteMany({ _id: { $in: extra.map((e) => e._id) } });
  }
  return ids;
}

async function seedDemoOrders(testUser, productIds) {
  const existing = await Order.countDocuments({ user: testUser._id });
  if (existing > 0) {
    console.log('Sample orders already exist, skipping');
    return;
  }

  const hachi = productIds.hachiware;
  const momo = productIds.momonga;
  const usagi = productIds.usagi;

  const orders = [
    {
      orderNumber: 'CW-DEMO001',
      user: testUser._id,
      items: [
        { product: hachi, name: 'HACHIWARE PLUSH', price: 1999, quantity: 2 },
        { product: momo, name: 'MOMONGA PLUSH', price: 1999, quantity: 1 },
      ],
      total: 5997,
      paymentMethod: 'gcash',
      status: 'on_delivery',
      shippedAt: new Date('2025-11-18T10:00:00'),
      customerSnapshot: {
        fullName: testUser.fullName,
        address: testUser.address,
        phone: testUser.phone,
      },
      createdAt: new Date('2025-11-17T14:30:00'),
    },
    {
      orderNumber: 'CW-DEMO002',
      user: testUser._id,
      items: [{ product: usagi, name: 'USAGI PLUSH', price: 1999, quantity: 1 }],
      total: 1999,
      paymentMethod: 'cod',
      status: 'on_delivery',
      customerSnapshot: {
        fullName: testUser.fullName,
        address: testUser.address,
        phone: testUser.phone,
      },
      createdAt: new Date('2025-11-19T09:00:00'),
    },
    {
      orderNumber: 'CW-DEMO003',
      user: testUser._id,
      items: [{ product: productIds.chiikawa, name: 'CHIIKAWA PLUSH', price: 1999, quantity: 1 }],
      total: 1999,
      paymentMethod: 'gcash',
      status: 'completed',
      shippedAt: new Date('2025-11-10T08:00:00'),
      deliveredAt: new Date('2025-11-12T16:00:00'),
      customerSnapshot: {
        fullName: testUser.fullName,
        address: testUser.address,
        phone: testUser.phone,
      },
      createdAt: new Date('2025-11-09T11:00:00'),
    },
    {
      orderNumber: 'CW-DEMO004',
      user: testUser._id,
      items: [{ product: productIds.rakko, name: 'RAKKO PLUSH', price: 1999, quantity: 2 }],
      total: 3998,
      paymentMethod: 'cod',
      status: 'cancelled',
      cancelledAt: new Date('2025-11-08T12:00:00'),
      customerSnapshot: {
        fullName: testUser.fullName,
        address: testUser.address,
        phone: testUser.phone,
      },
      createdAt: new Date('2025-11-07T18:00:00'),
    },
  ];

  for (const data of orders) {
    const order = await Order.create(data);
    if (order.status === 'on_delivery' || order.status === 'completed') {
      const delivery = await Delivery.createForOrder(order._id);
      if (order.orderNumber === 'CW-DEMO001') {
        delivery.riderName = 'Hachiware Express';
        delivery.steps = delivery.steps.map((step, i) => ({
          label: step.label,
          completed: i <= 3,
          completedAt: i <= 3 ? new Date() : undefined,
        }));
        delivery.currentStepIndex = 3;
        await delivery.save();
      }
      if (order.orderNumber === 'CW-DEMO003') {
        delivery.riderName = 'Usagi Dash';
        delivery.steps = delivery.steps.map((step) => ({
          label: step.label,
          completed: true,
          completedAt: order.deliveredAt,
        }));
        delivery.currentStepIndex = delivery.steps.length - 1;
        await delivery.save();
      }
    }
  }
  console.log('Seeded 4 sample orders + deliveries');
}

async function seed() {
  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@chiikawa.shop';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  await upsertUser({
    email: adminEmail,
    password: adminPass,
    fullName: 'Shop Admin',
    age: 25,
    birthday: new Date('2000-01-01'),
    address: 'Chiikawa Warehouse, Manila',
    phone: '09000000000',
    role: 'admin',
  });
  console.log('Admin:', adminEmail, '/', adminPass);

  const shippingEmail = process.env.SHIPPING_EMAIL || 'shipping@chiikawa.shop';
  const shippingPass = process.env.SHIPPING_PASSWORD || 'ship1234';
  await upsertUser({
    email: shippingEmail,
    password: shippingPass,
    fullName: 'Chiikawa Logistics',
    age: 28,
    birthday: new Date('1997-06-01'),
    address: 'Chiikawa Distribution Hub, Manila',
    phone: '09001112222',
    role: 'shipping',
  });
  console.log('Shipping:', shippingEmail, '/', shippingPass);

  const testEmail = process.env.TEST_USER_EMAIL || 'testuser@gmail.com';
  const testPass = process.env.TEST_USER_PASSWORD || 'test1234';
  const testUser = await upsertUser({
    email: testEmail,
    password: testPass,
    fullName: 'Kiki Amihan',
    age: 21,
    birthday: new Date('2004-03-15'),
    address: '123 Sampaguita St, Quezon City',
    phone: '09171234567',
    role: 'user',
    cart: [],
  });
  console.log('Test user:', testEmail, '/', testPass);

  const productIds = await syncProducts();
  console.log('Synced 8 plush products @ ₱1,999');

  await seedDemoOrders(testUser, productIds);

  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});