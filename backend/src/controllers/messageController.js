/**
 * Message Controller
 * Handles conversation and message operations
 */

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// ============================================
// CONVERSATION ENDPOINTS
// ============================================

// Get all conversations for the current user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get conversations where user is participant, not archived
    const conversations = await Conversation.find({
      participants: userId,
      $or: [
        { 'archivedBy.userId': { $ne: userId } },
        { archivedBy: { $size: 0 } }
      ]
    })
      .sort({ updatedAt: -1 })
      .populate('participants', 'name email avatar role')
      .populate('lastMessage.senderId', 'name')
      .lean();

    // Get other participant info and format response
    const formatted = conversations.map(conv => {
      const otherParticipants = conv.participants.filter(
        p => p._id.toString() !== userId
      );

      const unreadKey = userId.toString();
      const unreadCount = conv.unreadCount?.get(unreadKey) || 0;

      return {
        _id: conv._id,
        type: conv.type,
        linkedResource: conv.linkedResource,
        participants: otherParticipants,
        lastMessage: conv.lastMessage,
        unreadCount,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt
      };
    });

    res.json({
      success: true,
      conversations: formatted
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
};

// Create a new conversation
exports.createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { participantId, type, linkedResource } = req.body;

    // Validate participant
    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    // Can't start conversation with self
    if (participantId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot start a conversation with yourself'
      });
    }

    // Check if participant exists
    const participant = await User.findById(participantId).select('_id name email role');
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build linked resource object if provided
    let linkedResourceObj = null;
    if (linkedResource && linkedResource.resourceType && linkedResource.resourceId) {
      linkedResourceObj = {
        resourceType: linkedResource.resourceType,
        resourceId: linkedResource.resourceId
      };
    }

    // Find or create conversation
    const conversation = await Conversation.findOrCreate(
      [userId, participantId],
      type || 'general',
      linkedResourceObj
    );

    // Populate and return
    await conversation.populate('participants', 'name email avatar role');

    const unreadKey = userId.toString();
    const unreadCount = conversation.unreadCount?.get(unreadKey) || 0;

    res.status(201).json({
      success: true,
      conversation: {
        _id: conversation._id,
        type: conversation.type,
        linkedResource: conversation.linkedResource,
        participants: conversation.participants,
        lastMessage: conversation.lastMessage,
        unreadCount,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      }
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation'
    });
  }
};

// Get a single conversation
exports.getConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId)
      .populate('participants', 'name email avatar role')
      .populate('lastMessage.senderId', 'name');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      p => p._id.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Mark as read
    await conversation.markAsRead(userId);

    const unreadKey = userId.toString();
    const unreadCount = 0; // Reset after marking as read

    res.json({
      success: true,
      conversation: {
        _id: conversation._id,
        type: conversation.type,
        linkedResource: conversation.linkedResource,
        participants: conversation.participants,
        lastMessage: conversation.lastMessage,
        unreadCount,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation'
    });
  }
};

// Delete/archive a conversation
exports.deleteConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Check if user is participant
    const isParticipant = conversation.participants.some(
      p => p.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Archive for this user
    const existingArchive = conversation.archivedBy.find(
      a => a.userId.toString() === userId
    );

    if (!existingArchive) {
      conversation.archivedBy.push({
        userId,
        archivedAt: new Date()
      });
      await conversation.save();
    }

    res.json({
      success: true,
      message: 'Conversation archived'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete conversation'
    });
  }
};

// ============================================
// MESSAGE ENDPOINTS
// ============================================

// Get messages in a conversation
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get messages
    const query = { conversationId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('sender', 'name email avatar role')
      .lean();

    // Mark conversation as read
    await conversation.markAsRead(userId);

    // Mark messages as delivered
    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId },
        status: { $ne: 'delivered' }
      },
      {
        status: 'delivered',
        deliveredAt: new Date()
      }
    );

    res.json({
      success: true,
      messages: messages.reverse() // Return oldest first
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Send a message in a conversation
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { text, attachment } = req.body;

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const isParticipant = conversation.participants.some(
      p => p.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Validate message content
    if (!text?.trim() && !attachment?.hasAttachment) {
      return res.status(400).json({
        success: false,
        message: 'Message must have text or attachment'
      });
    }

    // Create message
    const message = await Message.create({
      conversationId,
      sender: userId,
      text: text?.trim() || '',
      attachment: {
        hasAttachment: attachment?.hasAttachment || false,
        type: attachment?.type || null,
        url: attachment?.url || '',
        filename: attachment?.filename || '',
        size: attachment?.size || 0,
        mimeType: attachment?.mimeType || ''
      },
      status: 'sent'
    });

    // Populate sender
    await message.populate('sender', 'name email avatar role');

    // Update conversation last message and increment unread for other participants
    await conversation.updateLastMessage(message);

    for (const participantId of conversation.participants) {
      if (participantId.toString() !== userId) {
        await conversation.incrementUnread(participantId);
      }
    }

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Verify user is participant in the conversation
    const conversation = await Conversation.findById(message.conversationId);
    const isParticipant = conversation?.participants.some(
      p => p.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await message.markAsRead(userId);

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark message as read'
    });
  }
};

// Delete a message (soft delete)
exports.deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only sender can delete their message
    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the sender can delete this message'
      });
    }

    // Soft delete
    const existingDelete = message.deletedBy.find(
      d => d.userId.toString() === userId
    );

    if (!existingDelete) {
      message.deletedBy.push({
        userId,
        deletedAt: new Date()
      });
      message.text = '[message deleted]';
      await message.save();
    }

    res.json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

// ============================================
// UNREAD COUNT ENDPOINT
// ============================================

// Get total unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all conversations where user is participant
    const conversations = await Conversation.find({
      participants: userId
    }).lean();

    let totalUnread = 0;
    const unreadByConversation = {};

    for (const conv of conversations) {
      const unreadKey = userId.toString();
      const unread = conv.unreadCount?.get(unreadKey) || 0;
      if (unread > 0) {
        totalUnread += unread;
        unreadByConversation[conv._id] = unread;
      }
    }

    res.json({
      success: true,
      totalUnread,
      unreadByConversation
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
};

// Legacy endpoints for backward compatibility
exports.listChats = exports.getConversations;
exports.getThread = async (req, res) => {
  const { userId } = req.params;
  // Find or create conversation with user
  const conversation = await Conversation.findOrCreate([req.user.id, userId], 'general');
  return exports.getMessages(req, res);
};
exports.send = async (req, res) => {
  const { toUserId, text } = req.body;
  // Find or create conversation
  const conversation = await Conversation.findOrCreate([req.user.id, toUserId], 'general');
  // Create message directly (not in a conversation route)
  const message = await Message.create({
    conversationId: conversation._id,
    sender: req.user.id,
    text: text?.trim() || '',
    status: 'sent'
  });
  await message.populate('sender', 'name email avatar role');
  res.status(201).json({ success: true, item: message });
};
