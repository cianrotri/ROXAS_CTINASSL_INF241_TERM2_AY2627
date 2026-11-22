const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

function userResponse(user) {
  return {
    id: user._id,
    email: user.email,
    fullName: user.fullName,
    age: user.age,
    birthday: user.birthday,
    address: user.address,
    phone: user.phone,
    role: user.role,
  };
}

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid Gmail / email required'),
    body('password').isLength({ min: 6 }),
    body('fullName').notEmpty(),
    body('age').isInt({ min: 1 }),
    body('birthday').isISO8601(),
    body('address').notEmpty(),
    body('phone').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password, fullName, age, birthday, address, phone } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hash,
      fullName,
      age,
      birthday,
      address,
      phone,
    });
    res.status(201).json({ message: 'Registration successful', user: userResponse(user) });
  }
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = signToken(user);
    res.json({ token, user: userResponse(user) });
  }
);

router.get('/me', auth(), async (req, res) => {
  res.json({ user: userResponse(req.user) });
});

router.put(
  '/me',
  auth(),
  [body('fullName').optional().notEmpty(), body('age').optional().isInt({ min: 1 })],
  async (req, res) => {
    const { fullName, age, birthday, address, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (fullName) user.fullName = fullName;
    if (age) user.age = age;
    if (birthday) user.birthday = birthday;
    if (address) user.address = address;
    if (phone) user.phone = phone;
    await user.save();
    res.json({ user: userResponse(user) });
  }
);

module.exports = router;