const router = require('express').Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/protect');
const { authorize } = require('../middleware/authorize');
const c = require('../controllers/artworkController');
const validateRequest = require('../middleware/validateRequest');

// Validation rules
const createArtworkValidation = [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('description').trim().isLength({ max: 5000 }),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('medium').trim().isLength({ max: 100 }),
    body('dimensions').optional().trim().isLength({ max: 100 }),
];

const updateArtworkValidation = [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 200 }),
    body('description').optional().trim().isLength({ max: 5000 }),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
];

router.get('/stats/categories', c.getCategoryStats);
router.get('/stats/user/:userId', c.getUserStats);
router.get('/', c.list);
router.get('/pending', protect, c.getPending);
router.get('/:id', c.getById);

router.post('/', protect, createArtworkValidation, validateRequest, c.create);
router.put('/:id', protect, updateArtworkValidation, validateRequest, c.update);
router.delete('/:id', protect, c.remove);

// Admin routes - require admin role
router.post('/:id/approve', protect, authorize('admin'), c.approve);
router.post('/:id/reject', protect, authorize('admin'), c.reject);

// Like and view routes
router.post('/:id/like', protect, c.toggleLike);
router.post('/:id/view', c.incrementView);

module.exports = router;
