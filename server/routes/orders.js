const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Delivery = require('../models/Delivery');
const { auth } = require('../middleware/auth');

const router = express.Router();

function generateOrderNumber() {
  return `CW-${Date.now().toString(36).toUpperCase()}`;
}

router.post('/checkout', auth(), async (req, res) => {
  const { paymentMethod } = req.body;
  if (!['gcash', 'maya', 'cod', 'card'].includes(paymentMethod)) {
    return res.status(400).json({ message: 'Invalid payment method' });
  }
  const user = await User.findById(req.user._id).populate('cart.product');
  if (!user.cart.length) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const orderItems = [];
  let total = 0;

  for (const item of user.cart) {
    const product = await Product.findById(item.product._id);
    if (!product || product.stock < item.quantity) {
      return res.status(400).json({
        message: `Insufficient stock for ${item.product.name}`,
      });
    }
    product.stock -= item.quantity;
    await product.save();
    const line = {
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    };
    orderItems.push(line);
    total += product.price * item.quantity;
  }

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: user._id,
    items: orderItems,
    total,
    paymentMethod,
    status: 'on_delivery',
    customerSnapshot: {
      fullName: user.fullName,
      address: user.address,
      phone: user.phone,
    },
  });

  await Delivery.createForOrder(order._id);

  user.cart = [];
  await user.save();

  res.status(201).json({ order });
});

router.get('/my', auth(), async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

module.exports = router;