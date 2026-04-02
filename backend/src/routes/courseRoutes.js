const router = require('express').Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const c = require('../controllers/courseController');

// Public routes - SPECIFIC routes first, then wildcard
router.get('/', c.list);
router.get('/categories', c.getCategories);
router.get('/stats', c.getStats);

// Student routes
router.get('/my-enrollments', protect, c.myEnrollments);
router.get('/my-level', protect, c.getMyLevel);

// Admin-only: course authoring
router.get('/my-courses', protect, authorize('admin'), c.myCourses);
router.get('/instructor/earnings', protect, authorize('admin'), c.getEarnings);
router.post('/', protect, authorize('admin'), c.create);

// Enrollment routes (any authenticated user)
router.post('/:id/checkout', protect, c.checkout);
router.post('/:id/enroll', protect, c.enroll);
router.get('/:id/progress', protect, c.getMyProgress);
router.post('/:id/progress/complete', protect, c.completeLesson);

// Assignment routes
router.post('/:courseId/assignments', protect, c.submitAssignment);
router.get('/:courseId/submissions', protect, authorize('admin'), c.getStudentSubmissions);
router.patch('/:courseId/enrollments/:enrollmentId/grade', protect, authorize('admin'), c.gradeAssignment);

// Course CRUD - MUST come after specific routes
router.get('/:id', c.getById);
router.patch('/:id', protect, authorize('admin'), c.update);
router.delete('/:id', protect, authorize('admin'), c.remove);

module.exports = router;
