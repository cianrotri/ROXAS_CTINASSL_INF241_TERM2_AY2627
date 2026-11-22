const express = require('express');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth(), async (req, res) => {
  const products = await Product.find().sort({ name: 1 });
  res.json(products);
});

router.get('/public-list', auth(), async (req, res) => {
  const products = await Product.find({ stock: { $gt: 0 } }).select('name price stock imageUrl');
  res.json(products);
});

module.exports = router;