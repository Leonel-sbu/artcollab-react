const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const c = require('../controllers/adminController');

router.get('/stats', auth, requireRole('admin'), c.stats);
router.get('/users', auth, requireRole('admin'), c.listUsers);

router.get('/artworks/pending', auth, requireRole('admin'), c.pendingArtworks);
router.put('/artworks/:id/status', auth, requireRole('admin'), c.setArtworkStatus);

router.get('/reports', auth, requireRole('admin'), c.listReports);
router.put('/reports/:id/status', auth, requireRole('admin'), c.setReportStatus);

module.exports = router;
