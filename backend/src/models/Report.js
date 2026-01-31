const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // what is being reported (for now artwork or user)
    kind: { type: String, enum: ['artwork', 'user'], required: true },
    refId: { type: mongoose.Schema.Types.ObjectId, required: true },

    reason: { type: String, required: true, trim: true },
    details: { type: String, default: '' },

    status: { type: String, enum: ['open', 'reviewing', 'resolved', 'dismissed'], default: 'open' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
