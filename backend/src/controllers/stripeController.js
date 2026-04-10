const Stripe = require('stripe');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Enrollment = require('../models/Enrollment');
const { sendReceiptEmail } = require('../utils/mailer');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function isStripeError(err) {
  return err && err.type && (
    err.type.startsWith('Stripe') ||
    err.raw?.type !== undefined
  );
}

/* ─────────────────────── CREATE PAYMENT INTENT ─────────────────────── */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body || {};

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Order is not pending (current: ${order.status})` });
    }

    // Reuse existing payment intent if available
    if (order.paymentProvider === 'stripe' && order.paymentRef) {
      try {
        const existing = await stripe.paymentIntents.retrieve(order.paymentRef);
        if (['requires_payment_method', 'requires_confirmation', 'requires_action'].includes(existing.status)) {
          return res.json({
            success: true,
            clientSecret: existing.client_secret,
            paymentIntentId: existing.id,
            reused: true,
          });
        }
      } catch (e) {
        // If retrieve fails, create a new one below
        console.warn('Could not retrieve existing payment intent:', e.message);
      }
    }

    // Stripe requires amounts in smallest currency unit (cents/pence)
    // Minimum is 50 cents. Enforce a sane minimum to avoid Stripe rejection.
    const amount = Math.max(50, Math.round(Number(order.subtotal || 0) * 100));

    const pi = await stripe.paymentIntents.create({
      amount,
      currency: (order.currency || 'ZAR').toLowerCase(),
      metadata: {
        orderId: String(order._id),
        userId: String(req.user.id),
      },
    });

    order.paymentProvider = 'stripe';
    order.paymentRef = pi.id;
    await order.save();

    res.json({
      success: true,
      clientSecret: pi.client_secret,
      paymentIntentId: pi.id,
      reused: false,
    });
  } catch (error) {
    console.error('createPaymentIntent error:', error.message);
    if (isStripeError(error)) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Payment processing failed' });
  }
};

/* ─────────────────────── CONFIRM PAYMENT ─────────────────────────── */
exports.confirmPayment = async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body || {};

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    const order = await Order.findOne({ _id: orderId, user: req.user.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const piId = paymentIntentId || order.paymentRef;
    if (!piId) {
      return res.status(400).json({ success: false, message: 'paymentIntentId is required' });
    }

    const pi = await stripe.paymentIntents.retrieve(piId);
    if (pi.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: `Payment not completed (status: ${pi.status})`,
        status: pi.status,
      });
    }

    if (order.status !== 'paid') {
      order.status = 'paid';
      order.paymentProvider = 'stripe';
      order.paymentRef = pi.id;
      await order.save();

      // Enroll users in courses they purchased
      const courseItems = (order.items || []).filter(i => i.kind === 'course');
      for (const it of courseItems) {
        await Enrollment.findOneAndUpdate(
          { user: order.user, course: it.refId },
          { $setOnInsert: { user: order.user, course: it.refId } },
          { upsert: true, new: true }
        ).catch(e => console.error('Enrollment upsert error:', e.message));
      }

      // Clear cart after successful payment
      await Cart.findOneAndUpdate(
        { user: order.user },
        { $set: { items: [], subtotal: 0 } },
        { new: true }
      ).catch(e => console.error('Cart clear error:', e.message));

      // Send receipt (non-blocking)
      if (req.user.email) {
        sendReceiptEmail({
          to: req.user.email,
          orderId: String(order._id),
          items: order.items,
          subtotal: order.subtotal,
          currency: order.currency,
        }).catch(e => console.warn('Receipt email failed:', e.message));
      }
    }

    res.json({
      success: true,
      orderId: String(order._id),
      paymentIntentId: pi.id,
    });
  } catch (error) {
    console.error('confirmPayment error:', error.message);
    if (isStripeError(error)) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Payment confirmation failed' });
  }
};

/* ─────────────────────── REFUND ───────────────────────────────────── */
exports.refund = async (req, res) => {
  const { orderId } = req.body || {};

  if (!orderId) {
    return res.status(400).json({ success: false, message: 'orderId is required' });
  }
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ success: false, message: 'Invalid order ID format' });
  }

  const order = await Order.findOne({ _id: orderId, user: req.user.id });
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  if (order.status !== 'paid') {
    return res.status(400).json({ success: false, message: 'Only paid orders can be refunded' });
  }
  if (!order.paymentRef) {
    return res.status(400).json({ success: false, message: 'No payment reference on this order' });
  }

  // Mark as pending refund first
  order.status = 'refund_pending';
  await order.save();

  try {
    const refund = await stripe.refunds.create({ payment_intent: order.paymentRef });
    order.status = 'refunded';
    await order.save();
    return res.json({ success: true, refundId: refund.id, status: refund.status });
  } catch (error) {
    // Roll back status on failure
    order.status = 'paid';
    await order.save().catch(e => console.error('Rollback save error:', e.message));

    console.error('Refund error:', error.message);
    if (isStripeError(error)) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Refund processing failed' });
  }
};
