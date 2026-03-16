const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const c = require('../controllers/orderController');

// All cart endpoints require authentication
router.use(protect);

router.get('/', c.getCart);
router.put('/', c.setCart);
router.delete('/', c.clearCart);

module.exports = router;

