const express = require("express");
const router = express.Router();
const { getStats } = require("../controllers/dashboardController");

// Public dashboard stats - no authentication required
router.get("/stats", getStats);

module.exports = router;
