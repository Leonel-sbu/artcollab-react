const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/orderController');

router.post('/checkout', auth, c.checkout);
router.get('/mine', auth, c.myOrders);
router.get('/:id', auth, c.getOrder);



module.exports = router;

