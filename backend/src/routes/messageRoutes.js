const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/messageController');

// base route (public ping)
router.get('/', (req, res) => {
  res.json({ success: true, module: 'messages' });
});

// protected routes
router.get('/chats', auth, c.listChats);
router.get('/thread/:userId', auth, c.getThread);
router.post('/send', auth, c.send);

module.exports = router;
