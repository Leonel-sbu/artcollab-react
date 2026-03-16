/**
 * Report Model
 * Represents user reports for moderation
 */

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Reporter (user who submitted the report)
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Target type - what kind of thing is being reported
  targetType: {
    type: String,
    enum: ['user', 'artwork', 'community_post', 'message', 'course', 'commission'],
    required: true
  },

  // Target ID - the ID of the thing being reported
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },

  // Reason for reporting
  reason: {
    type: String,
    enum: [
      'spam',
      'harassment',
      'hate_speech',
      'nudity',
      'copyright',
      'fraud',
      'scam',
      'violence',
      'inappropriate',
      'misinformation',
      'other'
    ],
    required: true
  },

  // Additional details from reporter
  details: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  },

  // Current status of the report
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'resolved', 'rejected'],
    default: 'pending'
  },

  // Admin notes (internal)
  adminNotes: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: ''
  },

  // Who reviewed this report
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // When the report was reviewed
  reviewedAt: {
    type: Date,
    default: null
  },

  // Resolution notes
  resolution: {
    type: String,
    enum: ['action_taken', 'warning_issued', 'user_banned', 'content_removed', 'no_violation', 'duplicate'],
    default: null
  },

  // Evidence URLs (screenshots, etc.)
  evidenceUrls: [{
    type: String
  }]
}, {
  timestamps: true
});

// Compound indexes for efficient queries
reportSchema.index({ reporter: 1, targetType: 1, targetId: 1 }, { unique: true });
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1 });
reportSchema.index({ reviewedBy: 1 });

// Static method to check if user already reported
reportSchema.statics.hasUserReported = async function (reporterId, targetType, targetId) {
  const report = await this.findOne({
    reporter: reporterId,
    targetType,
    targetId,
    status: { $ne: 'rejected' }
  });
  return !!report;
};

// Static method to get reports by status
reportSchema.statics.getByStatus = async function (status, options = {}) {
  const { page = 1, limit = 20 } = options;

  const query = {};
  if (status) query.status = status;

  return this.find(query)
    .populate('reporter', 'name email')
    .populate('reviewedBy', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
};

// Static method to get report counts by status
reportSchema.statics.getStatusCounts = async function () {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Report', reportSchema);
