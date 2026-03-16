const router = require('express').Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const c = require('../controllers/stripeController');

router.get('/', (req, res) => {
  res.json({ success: true, module: 'payments' });
});

router.post('/create-payment-intent', protect, c.createPaymentIntent);

// confirm after client payment
router.post('/confirm', protect, c.confirmPayment);


router.post('/refund', protect, c.refund);
module.exports = router;





