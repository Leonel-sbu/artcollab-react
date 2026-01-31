const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['artwork', 'course'], required: true },
    refId: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    price: { type: Number, default: 0 },
    qty: { type: Number, default: 1 }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    items: { type: [cartItemSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
