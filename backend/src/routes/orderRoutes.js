const router = require('express').Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const c = require('../controllers/orderController');

router.post('/checkout', protect, c.checkout);
router.get('/mine', protect, c.myOrders);
router.get('/:id', protect, c.getOrder);



module.exports = router;


