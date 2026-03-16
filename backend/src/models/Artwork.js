const mongoose = require("mongoose");

const artworkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    // Marketplace fields
    category: { type: String, default: "Other", trim: true, index: true },
    tags: { type: [String], default: [], index: true },

    // Pricing
    price: { type: Number, default: 0, index: true }, // ZAR
    currency: { type: String, default: "ZAR" },

    // Image
    imageUrl: { type: String, default: "" },

    // Rights
    royalty: { type: Number, default: 10 }, // %
    licenseType: { type: String, default: "personal" },
    isExclusive: { type: Boolean, default: false },

    // Owner
    artist: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // moderation-ready
    status: {
      type: String,
      enum: ["draft", "published", "pending", "rejected"],
      default: "pending",  // Changed from "published" - requires admin approval
      index: true,
    },
  },
  { timestamps: true }
);

// Add compound indexes for common queries
artworkSchema.index({ category: 1, status: 1 });
artworkSchema.index({ artist: 1, status: 1 });
artworkSchema.index({ createdAt: -1 });

// Text index for search functionality
artworkSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model("Artwork", artworkSchema);
