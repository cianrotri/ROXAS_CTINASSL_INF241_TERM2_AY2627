const mongoose = require('mongoose');

const deliveryStepSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { _id: false }
);

const deliverySchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    riderName: { type: String, default: 'Pending assignment' },
    trackingNumber: { type: String },
    carrier: { type: String, default: 'Chiikawa Express (simulated)' },
    steps: [deliveryStepSchema],
    currentStepIndex: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const DEFAULT_STEPS = [
  'Order confirmed',
  'Packed at warehouse',
  'Handed to rider',
  'Out for delivery',
  'Delivered',
];

deliverySchema.statics.createForOrder = function (orderId) {
  return this.create({
    order: orderId,
    steps: DEFAULT_STEPS.map((label, i) => ({
      label,
      completed: i === 0,
      completedAt: i === 0 ? new Date() : undefined,
    })),
    currentStepIndex: 0,
    trackingNumber: `CHK-${Date.now().toString(36).toUpperCase()}`,
  });
};

module.exports = mongoose.model('Delivery', deliverySchema);