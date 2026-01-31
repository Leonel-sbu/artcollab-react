const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    kind: { type: String, required: true },
    refId: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    price: { type: Number, default: 0 },
    qty: { type: Number, default: 1 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], default: [] },
    currency: { type: String, default: 'ZAR' },
    subtotal: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refund_pending', 'refunded'],
      default: 'pending'
    },
    paymentProvider: { type: String, default: 'manual' },
    paymentRef: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);