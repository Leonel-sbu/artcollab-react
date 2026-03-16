/**
 * Conversation Model
 * Represents a conversation between users, optionally linked to a resource
 */

const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    // Participants in the conversation (2 users for 1:1)
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],

    // Conversation type - can be linked to a resource or general
    type: {
        type: String,
        enum: ['general', 'artwork', 'commission', 'order', 'course'],
        default: 'general'
    },

    // Linked resource (optional) - artwork, commission, order, course
    linkedResource: {
        resourceType: {
            type: String,
            enum: ['artwork', 'commission', 'order', 'course', null],
            default: null
        },
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        }
    },

    // Last message preview for quick display
    lastMessage: {
        text: { type: String, default: '' },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        sentAt: { type: Date, default: null }
    },

    // Unread counts per participant
    unreadCount: {
        type: Map,
        of: Number,
        default: {}
    },

    // Archive/soft delete per user
    archivedBy: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        archivedAt: { type: Date, default: null }
    }],

    // Mute notifications per user
    mutedBy: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        mutedAt: { type: Date, default: null }
    }]
}, {
    timestamps: true
});

// Indexes for efficient queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ 'linkedResource.resourceType': 1, 'linkedResource.resourceId': 1 });
conversationSchema.index({ updatedAt: -1 });
conversationSchema.index({ 'lastMessage.sentAt': -1 });

// Virtual for checking if a user is participant
conversationSchema.methods.isParticipant = function (userId) {
    return this.participants.some(p => p.toString() === userId.toString());
};

// Static method to find or create conversation
conversationSchema.statics.findOrCreate = async function (participants, type = 'general', linkedResource = null) {
    // Sort participants to ensure consistency
    const sortedParticipants = [...participants].sort();

    // Build query
    const query = {
        participants: { $all: sortedParticipants, $size: sortedParticipants.length },
        type
    };

    // Add linked resource to query if provided
    if (linkedResource && linkedResource.resourceType && linkedResource.resourceId) {
        query['linkedResource.resourceType'] = linkedResource.resourceType;
        query['linkedResource.resourceId'] = linkedResource.resourceId;
    }

    let conversation = await this.findOne(query);

    if (!conversation) {
        conversation = await this.create({
            participants: sortedParticipants,
            type,
            linkedResource: linkedResource || { resourceType: null, resourceId: null },
            unreadCount: {}
        });
    }

    return conversation;
};

// Method to update last message
conversationSchema.methods.updateLastMessage = async function (message) {
    this.lastMessage = {
        text: message.text?.substring(0, 100) || '',
        senderId: message.sender,
        sentAt: message.createdAt
    };
    await this.save();
};

// Method to increment unread count for a user
conversationSchema.methods.incrementUnread = async function (userId) {
    const key = userId.toString();
    const current = this.unreadCount.get(key) || 0;
    this.unreadCount.set(key, current + 1);
    await this.save();
};

// Method to mark as read for a user
conversationSchema.methods.markAsRead = async function (userId) {
    const key = userId.toString();
    this.unreadCount.set(key, 0);
    await this.save();
};

module.exports = mongoose.model('Conversation', conversationSchema);
