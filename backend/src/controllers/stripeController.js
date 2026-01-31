const Stripe = require('stripe');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const { sendReceiptEmail } = require('../utils/mailer');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  const { orderId } = req.body || {};
  if (!orderId) return res.status(400).json({ success: false, message: 'orderId is required' });

  const order = await Order.findOne({ _id: orderId, user: req.user.id });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.status !== 'pending') return res.status(400).json({ success: false, message: 'Order is not pending' });

  if (order.paymentProvider === 'stripe' && order.paymentRef) {
    const existing = await stripe.paymentIntents.retrieve(order.paymentRef);
    return res.json({
      success: true,
      clientSecret: existing.client_secret,
      paymentIntentId: existing.id,
      reused: true
    });
  }

  const amount = Math.max(0, Math.round(Number(order.subtotal || 0) * 100));

  const pi = await stripe.paymentIntents.create({
    amount,
    currency: (order.currency || 'ZAR').toLowerCase(),
    metadata: { orderId: String(order._id), userId: String(req.user.id) }
  });

  order.paymentProvider = 'stripe';
  order.paymentRef = pi.id;
  await order.save();

  res.json({ success: true, clientSecret: pi.client_secret, paymentIntentId: pi.id, reused: false });
};

exports.confirmPayment = async (req, res) => {
  const { orderId, paymentIntentId } = req.body || {};
  if (!orderId) return res.status(400).json({ success: false, message: 'orderId is required' });

  const order = await Order.findOne({ _id: orderId, user: req.user.id });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const piId = paymentIntentId || order.paymentRef;
  if (!piId) return res.status(400).json({ success: false, message: 'paymentIntentId is required' });

  const pi = await stripe.paymentIntents.retrieve(piId);
  if (pi.status !== 'succeeded') {
    return res.status(400).json({
      success: false,
      message: `Payment not completed (status: ${pi.status})`,
      status: pi.status
    });
  }

  if (order.status !== 'paid') {
    order.status = 'paid';
    order.paymentProvider = 'stripe';
    order.paymentRef = pi.id;
    await order.save();
  }

  const courseItems = (order.items || []).filter(i => i.kind === 'course');
  for (const it of courseItems) {
    await Enrollment.findOneAndUpdate(
      { user: order.user, course: it.refId },
      { $setOnInsert: { user: order.user, course: it.refId } },
      { upsert: true, new: true }
    );
  }

  await Cart.findOneAndUpdate(
    { user: order.user },
    { $set: { items: [], subtotal: 0 } },
    { new: true }
  );

  res.json({ success: true, orderId: String(order._id), paymentIntentId: pi.id });
};

exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const orderId = pi.metadata?.orderId;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.status !== 'paid') {
        order.status = 'paid';
        order.paymentProvider = 'stripe';
        order.paymentRef = pi.id;
        await order.save();

        const courseItems = (order.items || []).filter(i => i.kind === 'course');
        for (const it of courseItems) {
          await Enrollment.findOneAndUpdate(
            { user: order.user, course: it.refId },
            { $setOnInsert: { user: order.user, course: it.refId } },
            { upsert: true, new: true }
          );
        }

        await Cart.findOneAndUpdate(
          { user: order.user },
          { $set: { items: [], subtotal: 0 } },
          { new: true }
        );
      }
    }
  }

  res.json({ received: true });
};

exports.refund = async (req, res) => {
  const { orderId } = req.body || {};
  if (!orderId) return res.status(400).json({ success: false, message: "orderId is required" });

  const order = await Order.findOne({ _id: orderId, user: req.user.id });
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  // If we already marked it refunded locally, return OK (idempotent)
  if (order.status === "refunded") {
    return res.json({ success: true, alreadyRefunded: true, orderId: String(order._id) });
  }

  if (order.status !== "paid") {
    return res.status(400).json({ success: false, message: "Only paid orders can be refunded" });
  }
  if (!order.paymentRef) {
    return res.status(400).json({ success: false, message: "No paymentRef on order" });
  }

  try {
    const refund = await stripe.refunds.create({ payment_intent: order.paymentRef });

    order.status = "refunded";
    await order.save();

    return res.json({ success: true, refundId: refund.id, status: refund.status, orderId: String(order._id) });
  } catch (e) {
    // Stripe already refunded -> treat as success + update DB
    if (e?.message?.toLowerCase().includes("already been refunded")) {
      order.status = "refunded";
      await order.save();
      return res.json({ success: true, alreadyRefunded: true, orderId: String(order._id) });
    }
    throw e;
  }
};
