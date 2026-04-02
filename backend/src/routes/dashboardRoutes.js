const express = require("express");
const router = express.Router();
const { getStats } = require("../controllers/dashboardController");
const { protect } = require("../middleware/protect");

// Protected dashboard stats - authentication required
router.get("/stats", protect, getStats);

module.exports = router;
