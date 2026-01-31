const Cart = require('../models/Cart');
const Order = require('../models/Order');

function calcSubtotal(items) {
  return (items || []).reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.qty || 1)), 0);
}

// CART
exports.getCart = async (req, res) => {
  const cart = (await Cart.findOne({ user: req.user.id })) || (await Cart.create({ user: req.user.id, items: [] }));
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

  const subtotal = calcSubtotal(cart.items);

  const order = await Order.create({
    user: req.user.id,
    items: cart.items,
    subtotal,
    status: 'pending',
    paymentProvider: 'manual'
  });

  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, order });
};

exports.myOrders = async (req, res) => {
  const items = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, items });
};

exports.getOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
};
exports.getOrderById = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  res.json({ success: true, order });
};
