/**
 * Report Routes
 * API endpoints for report submission and moderation
 */

const router = require('express').Router();
const { protect } = require('../middleware/protect');
const { authorize } = require('../middleware/authorize');
const c = require('../controllers/reportController');

// ============================================
// USER ROUTES (logged in users)
// ============================================

// Submit a new report
router.post('/', protect, c.createReport);

// Get my reports
router.get('/mine', protect, c.getMyReports);

// ============================================
// ADMIN ROUTES
// ============================================

// Get all reports (admin only)
router.get('/admin/all', protect, authorize('admin'), c.adminGetReports);

// Get single report (admin only)
router.get('/admin/:reportId', protect, authorize('admin'), c.adminGetReport);

// Update report status (admin only)
router.put('/admin/:reportId/status', protect, authorize('admin'), c.adminUpdateReportStatus);

// Delete old resolved reports (admin only)
router.delete('/admin/cleanup', protect, authorize('admin'), c.adminDeleteResolved);

module.exports = router;
