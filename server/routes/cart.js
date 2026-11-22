const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

async function populateCart(user) {
  await user.populate('cart.product');
  return user.cart.map((item) => ({
    productId: item.product._id,
    name: item.product.name,
    price: item.product.price,
    stock: item.product.stock,
    quantity: item.quantity,
    lineTotal: item.product.price * item.quantity,
  }));
}

router.get('/', auth(), async (req, res) => {
  const user = await User.findById(req.user._id);
  const items = await populateCart(user);
  const total = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  res.json({ items, total, count });
});

router.post('/add', auth(), async (req, res) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product || product.stock < 1) {
    return res.status(400).json({ message: 'Product unavailable' });
  }
  const user = await User.findById(req.user._id);
  const existing = user.cart.find((c) => c.product.toString() === productId);
  if (existing) {
    if (existing.quantity >= product.stock) {
      return res.status(400).json({ message: 'Not enough stock' });
    }
    existing.quantity += 1;
  } else {
    user.cart.push({ product: productId, quantity: 1 });
  }
  await user.save();
  const items = await populateCart(user);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  res.json({ items, count });
});

router.patch('/quantity', auth(), async (req, res) => {
  const { productId, delta } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  const user = await User.findById(req.user._id);
  const idx = user.cart.findIndex((c) => c.product.toString() === productId);
  if (idx === -1) {
    return res.status(400).json({ message: 'Item not in cart' });
  }
  const next = user.cart[idx].quantity + delta;
  if (next < 1) {
    user.cart.splice(idx, 1);
  } else if (next > product.stock) {
    return res.status(400).json({ message: 'Not enough stock' });
  } else {
    user.cart[idx].quantity = next;
  }
  await user.save();
  const items = await populateCart(user);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  res.json({ items, count });
});

module.exports = router;