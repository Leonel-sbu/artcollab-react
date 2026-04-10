/**
 * Message Routes
 * API endpoints for messaging functionality
 */

const router = require('express').Router();
const { protect } = require('../middleware/protect');
const { messageLimiter } = require('../config/rateLimits');
const c = require('../controllers/messageController');

// POST /api/messages/upload — upload image for message attachment
router.post('/upload', protect, (req, res, next) => {
  c.attachmentUploadMiddleware(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    next();
  });
}, c.uploadAttachment);

// Base route
router.get('/', (req, res) => {
  res.json({ success: true, module: 'messages' });
});

// ============================================
// CONVERSATION ROUTES
// ============================================

// Get all conversations for current user
router.get('/conversations', protect, c.getConversations);

// Create a new conversation
router.post('/conversations', protect, c.createConversation);

// Get a single conversation
router.get('/conversations/:conversationId', protect, c.getConversation);

// Delete/archive a conversation
router.delete('/conversations/:conversationId', protect, c.deleteConversation);

// ============================================
// MESSAGE ROUTES
// ============================================

// Get messages in a conversation
router.get('/conversations/:conversationId/messages', protect, c.getMessages);

// Send a message in a conversation
router.post('/conversations/:conversationId/messages', protect, messageLimiter, c.sendMessage);

// Mark a message as read
router.put('/:messageId/read', protect, c.markAsRead);

// Delete a message
router.delete('/:messageId', protect, c.deleteMessage);

// ============================================
// UNREAD COUNT
// ============================================

// Get total unread message count
router.get('/unread-count', protect, c.getUnreadCount);

// ============================================
// LEGACY ROUTES (backward compatibility)
// ============================================

// List chats (grouped by user)
router.get('/chats', protect, c.listChats);

// Get thread with a user
router.get('/thread/:userId', protect, c.getThread);

// Send message to a user
router.post('/send', protect, messageLimiter, c.send);

module.exports = router;
