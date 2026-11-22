const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 1 },
    birthday: { type: Date, required: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, enum: ['user', 'admin', 'shipping'], default: 'user' },
    cart: [cartItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);