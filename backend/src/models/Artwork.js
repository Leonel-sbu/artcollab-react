const mongoose = require('mongoose');

const artworkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' },

    artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // moderation-ready
    status: { type: String, enum: ['draft', 'published', 'pending', 'rejected'], default: 'published' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Artwork', artworkSchema);
