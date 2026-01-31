const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/stripeController');

router.get('/', (req, res) => {
  res.json({ success: true, module: 'payments' });
});

router.post('/create-payment-intent', auth, c.createPaymentIntent);

// confirm after client payment
router.post('/confirm', auth, c.confirmPayment);


router.post('/refund', auth, c.refund);
module.exports = router;




