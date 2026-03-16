const router = require('express').Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const c = require('../controllers/courseController');

// Public routes - SPECIFIC routes first, then wildcard
router.get('/', c.list);
router.get('/categories', c.getCategories);
router.get('/stats', c.getStats);

// Protected routes - SPECIFIC routes first, then wildcard
router.get('/my-courses', protect, c.myCourses);
router.get('/my-enrollments', protect, c.myEnrollments);
router.get('/instructor/earnings', protect, c.getEarnings);
router.get('/my-level', protect, c.getMyLevel);

router.post('/', protect, c.create);

// Enrollment routes
router.post('/:id/enroll', protect, c.enroll);
router.get('/:id/progress', protect, c.getMyProgress);
router.post('/:id/progress/complete', protect, c.completeLesson);

// Assignment routes
router.post('/:courseId/assignments', protect, c.submitAssignment);
router.get('/:courseId/submissions', protect, c.getStudentSubmissions);
router.patch('/:courseId/enrollments/:enrollmentId/grade', protect, c.gradeAssignment);

// Course CRUD - MUST come after specific routes
router.get('/:id', c.getById);
router.patch('/:id', protect, c.update);
router.delete('/:id', protect, c.remove);

module.exports = router;
