const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/authController');

router.get('/', (req, res) => res.json({ success: true, module: 'auth' }));

router.post('/register', c.register);
router.post('/login', c.login);
router.get('/me', auth, c.me);

module.exports = router;
