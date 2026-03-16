const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  title: { type: String, required: true },
  description: { type: String, default: "" },

  // Rich service features
  category: {
    type: String,
    enum: ["portrait", "landscape", "digital", "traditional", "3d", "animation", "nft", "logo", "illustration", "other"],
    default: "illustration"
  },

  // Portfolio images
  images: { type: [String], default: [] },

  // Pricing tiers
  pricing: {
    basic: { price: Number, description: String, deliveryDays: Number, revisions: Number },
    standard: { price: Number, description: String, deliveryDays: Number, revisions: Number },
    premium: { price: Number, description: String, deliveryDays: Number, revisions: Number }
  },

  // Single budget (for simple services)
  budget: { type: Number, default: 0 },
  currency: { type: String, default: "ZAR" },

  // Service details
  tags: { type: [String], default: [] },
  deliveryDays: { type: Number, default: 7 },
  revisions: { type: Number, default: 3 },
  features: { type: [String], default: [] },

  // Is this a service listing (artist offering) or a request?
  isService: { type: Boolean, default: true },

  // Featured/popular
  featured: { type: Boolean, default: false },

  // Status
  status: {
    type: String,
    enum: ["requested", "accepted", "in_progress", "delivered", "completed", "cancelled"],
    default: "requested",
  },

  referenceFiles: { type: [String], default: [] },
}, { timestamps: true });

// Index for searching
commissionSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model("Commission", commissionSchema);
