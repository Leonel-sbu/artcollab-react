/**
 * Message Model
 * Represents individual messages within conversations
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  // Conversation this message belongs to
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },

  // Sender of the message
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Message content
  text: {
    type: String,
    trim: true,
    default: ''
  },

  // Message status
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },

  // Read tracking
  readBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],

  // When the message was delivered
  deliveredAt: {
    type: Date,
    default: null
  },

  // When the message was read
  readAt: {
    type: Date,
    default: null
  },

  // Attachment (optional)
  attachment: {
    hasAttachment: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ['image', 'file', null],
      default: null
    },
    url: { type: String, default: '' },
    filename: { type: String, default: '' },
    size: { type: Number, default: 0 },
    mimeType: { type: String, default: '' }
  },

  // Delete tracking (soft delete per user)
  deletedBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: null }
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ 'readBy.userId': 1 });

// Pre-save middleware to set deliveredAt
messageSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'delivered' && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  if (this.isModified('status') && this.status === 'read' && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Method to mark message as read by a user
messageSchema.methods.markAsRead = async function (userId) {
  const alreadyRead = this.readBy.some(r => r.userId.toString() === userId.toString());

  if (!alreadyRead) {
    this.readBy.push({ userId, readAt: new Date() });
    this.status = 'read';
    this.readAt = new Date();
    await this.save();
  }
};

// Static method to get messages for a conversation
messageSchema.statics.getConversationMessages = async function (conversationId, options = {}) {
  const { limit = 50, before = null } = options;

  const query = { conversationId };
  if (before) {
    query.createdAt = { $lt: before };
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('sender', 'name email avatar role')
    .lean();
};

module.exports = mongoose.model('Message', messageSchema);
