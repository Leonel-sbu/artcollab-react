const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const c = require('../controllers/courseController');

// public
router.get('/', c.list);
router.get('/:id', c.getById);

// creator (we'll restrict by role later)
router.post('/', auth, c.create);

// enrolled learner actions
router.post('/:id/enroll', auth, c.enroll);
router.get('/:id/progress', auth, c.getMyProgress);
router.post('/:id/progress/complete', auth, c.completeLesson);

module.exports = router;
