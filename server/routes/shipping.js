const express = require('express');
const Order = require('../models/Order');
const Delivery = require('../models/Delivery');
const { auth } = require('../middleware/auth');

const router = express.Router();
const shippingOnly = auth('shipping');

async function completeOrderDelivery(orderId) {
  const order = await Order.findById(orderId);
  if (!order) return { error: { status: 404, message: 'Order not found' } };
  if (order.status !== 'on_delivery') {
    return { error: { status: 400, message: 'Order is not out for delivery' } };
  }
  if (!order.shippedAt) {
    return { error: { status: 400, message: 'Order has not been shipped yet' } };
  }

  order.status = 'completed';
  order.deliveredAt = new Date();
  await order.save();

  const delivery = await Delivery.findOne({ order: order._id });
  if (delivery) {
    delivery.steps = delivery.steps.map((step) => ({
      label: step.label,
      completed: true,
      completedAt: new Date(),
    }));
    delivery.currentStepIndex = delivery.steps.length - 1;
    await delivery.save();
  }

  return { order, delivery };
}

router.get('/deliveries', shippingOnly, async (req, res) => {
  const deliveries = await Delivery.find()
    .populate({
      path: 'order',
      populate: { path: 'user', select: 'fullName email address phone' },
    })
    .sort({ updatedAt: -1 });
  res.json(deliveries);
});

router.patch('/orders/:id/complete', shippingOnly, async (req, res) => {
  const result = await completeOrderDelivery(req.params.id);
  if (result.error) {
    return res.status(result.error.status).json({ message: result.error.message });
  }
  res.json(result);
});

module.exports = router;