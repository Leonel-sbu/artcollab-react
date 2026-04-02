const router = require('express').Router();
const { protect } = require('../middleware/protect');
const { authorize } = require('../middleware/authorize');
const { adminLimiter } = require('../config/rateLimits');
const c = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Apply rate limiting to state-changing admin actions
router.put('/users/:id/role', adminLimiter, c.updateUserRole);
router.delete('/users/:id', adminLimiter, c.deleteUser);
router.put('/artworks/:id/status', adminLimiter, c.setArtworkStatus);
router.put('/reports/:id/status', adminLimiter, c.setReportStatus);

router.get('/stats', c.stats);
router.get('/users', c.listUsers);
router.get('/artworks/pending', c.pendingArtworks);
router.get('/reports', c.listReports);

// Course management
router.get('/courses', c.listAllCourses);
router.put('/courses/:id/status', adminLimiter, c.setCourseStatus);

// Order management
router.get('/orders', c.listAllOrders);

// Enrollment / student management
router.get('/enrollments', c.listEnrollments);
router.delete('/enrollments/:id', adminLimiter, c.removeEnrollment);

module.exports = router;

