const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/orderController');

router.get('/', auth, c.getCart);
router.put('/', auth, c.setCart);
router.delete('/', auth, c.clearCart);

module.exports = router;
