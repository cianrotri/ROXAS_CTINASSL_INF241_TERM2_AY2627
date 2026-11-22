const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['gcash', 'maya', 'cod', 'card'],
      required: true,
    },
    status: {
      type: String,
      enum: ['on_delivery', 'completed', 'cancelled'],
      default: 'on_delivery',
    },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    customerSnapshot: {
      fullName: String,
      address: String,
      phone: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);