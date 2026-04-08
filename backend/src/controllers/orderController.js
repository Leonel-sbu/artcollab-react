const Cart = require('../models/Cart');
const Order = require('../models/Order');

function calcSubtotal(items) {
  return (items || []).reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.qty || 1)), 0);
}

// PUBLIC - Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, items: orders, pagination: { page: 1, limit: 50, total: orders.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CART
exports.getCart = async (req, res) => {
  // Return empty cart for unauthenticated users
  if (!req.user) {
    return res.json({ success: true, cart: { items: [] }, subtotal: 0 });
  }
  // Use findOneAndUpdate with upsert to avoid race condition/duplicate key error
  const cart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    { $setOnInsert: { items: [] } },
    { upsert: true, new: true }
  );
  res.json({ success: true, cart, subtotal: calcSubtotal(cart.items) });
};

exports.setCart = async (req, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items)) return res.status(400).json({ success: false, message: 'items must be an array' });

  const cart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    { $set: { items } },
    { upsert: true, new: true }
  );

  res.json({ success: true, cart, subtotal: calcSubtotal(cart.items) });
};

exports.clearCart = async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    { $set: { items: [] } },
    { upsert: true, new: true }
  );
  res.json({ success: true, cart, subtotal: 0 });
};

// ORDERS
exports.checkout = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart || !cart.items || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  // Prevent duplicate pending orders
  const existingPending = await Order.findOne({
    user: req.user.id,
    status: 'pending'
  });

  if (existingPending) {
    return res.status(400).json({
      success: false,
      message: 'You already have a pending order. Complete or abandon it first.'
    });
  }

  const subtotal = calcSubtotal(cart.items);

  const order = await Order.create({
    user: req.user.id,
    items: cart.items,
    subtotal,
    status: 'pending',
    paymentProvider: 'manual'
  });

  // Do NOT clear cart here.
  // Cart must only be cleared after successful payment.

  res.status(201).json({ success: true, order });
};

exports.myOrders = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter = { user: req.user.id };

  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({ success: true, items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

exports.getOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
};