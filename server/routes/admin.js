const express = require('express');
const Product = require('../models/Product');
const InventoryHistory = require('../models/InventoryHistory');
const Order = require('../models/Order');
const Delivery = require('../models/Delivery');
const { auth } = require('../middleware/auth');

const router = express.Router();
const adminOnly = auth('admin');

const RIDERS = ['Momo Rider', 'Hachiware Express', 'Usagi Dash', 'Chiikawa Courier'];

router.get('/inventory', adminOnly, async (req, res) => {
  const products = await Product.find().sort({ name: 1 });
  res.json(products);
});

router.post('/inventory/:productId/restock', adminOnly, async (req, res) => {
  const { quantity, note } = req.body;
  const qty = parseInt(quantity, 10);
  if (!qty || qty < 1) {
    return res.status(400).json({ message: 'Quantity must be at least 1' });
  }
  const product = await Product.findById(req.params.productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  const previousStock = product.stock;
  product.stock += qty;
  product.lastRestock = new Date();
  await product.save();
  await InventoryHistory.create({
    product: product._id,
    quantityAdded: qty,
    previousStock,
    newStock: product.stock,
    note: note || '',
    addedBy: req.user._id,
  });
  res.json(product);
});

router.get('/inventory/:productId/history', adminOnly, async (req, res) => {
  const history = await InventoryHistory.find({ product: req.params.productId })
    .sort({ createdAt: -1 })
    .populate('addedBy', 'fullName email');
  res.json(history);
});

router.get('/orders', adminOnly, async (req, res) => {
  const { search, status, from, to } = req.query;
  const filter = {};
  if (status && ['on_delivery', 'completed', 'cancelled'].includes(status)) {
    filter.status = status;
  }
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }
  let query = Order.find(filter).populate('user', 'fullName email phone').sort({ createdAt: -1 });
  let orders = await query;
  const rawSearch = typeof search === 'string' ? search.trim() : '';
  if (rawSearch) {
    const s = rawSearch.toLowerCase();
    orders = orders.filter((o) => {
      const orderNumber = (o.orderNumber || '').toLowerCase();
      const fullName = (
        o.user?.fullName ||
        o.customerSnapshot?.fullName ||
        ''
      ).toLowerCase();
      const email = (o.user?.email || '').toLowerCase();
      const phone = (o.user?.phone || o.customerSnapshot?.phone || '').toLowerCase();
      return (
        orderNumber.includes(s) ||
        fullName.includes(s) ||
        email.includes(s) ||
        phone.includes(s)
      );
    });
  }
  res.json(orders);
});

router.patch('/orders/:id/ship', adminOnly, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  if (order.status !== 'on_delivery') {
    return res.status(400).json({ message: 'Order is not shippable' });
  }
  order.shippedAt = new Date();
  await order.save();

  let delivery = await Delivery.findOne({ order: order._id });
  if (delivery) {
    delivery.riderName = RIDERS[Math.floor(Math.random() * RIDERS.length)];
    delivery.steps = delivery.steps.map((step, i) => {
      const completed = i <= 2;
      return {
        label: step.label,
        completed,
        completedAt: completed ? new Date() : undefined,
      };
    });
    delivery.currentStepIndex = 2;
    await delivery.save();
  }
  res.json({ order, delivery });
});

router.patch('/orders/:id/cancel', adminOnly, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.status === 'completed') {
    return res.status(400).json({ message: 'Cannot cancel completed order' });
  }
  order.status = 'cancelled';
  order.cancelledAt = new Date();
  await order.save();
  res.json(order);
});

router.get('/deliveries', adminOnly, async (req, res) => {
  const deliveries = await Delivery.find()
    .populate({
      path: 'order',
      populate: { path: 'user', select: 'fullName email address phone' },
    })
    .sort({ updatedAt: -1 });
  res.json(deliveries);
});

router.patch('/deliveries/:id/advance', adminOnly, async (req, res) => {
  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
  const next = delivery.currentStepIndex + 1;
  if (next >= delivery.steps.length) {
    return res.status(400).json({ message: 'Already at final step' });
  }
  delivery.steps[next].completed = true;
  delivery.steps[next].completedAt = new Date();
  delivery.currentStepIndex = next;
  if (!delivery.riderName || delivery.riderName === 'Pending assignment') {
    delivery.riderName = RIDERS[Math.floor(Math.random() * RIDERS.length)];
  }
  await delivery.save();
  res.json(delivery);
});

module.exports = router;