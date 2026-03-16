const router = require("express").Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const reviewController = require("../controllers/reviewController");

// Public routes
router.get("/:targetType/:targetId", reviewController.getReviews);
router.get("/my/:targetType/:targetId", protect, reviewController.getMyReview);

// Protected routes (users)
router.post("/", protect, reviewController.createReview);
router.put("/:reviewId", protect, reviewController.updateReview);
router.delete("/:reviewId", protect, reviewController.deleteReview);
router.post("/:reviewId/helpful", protect, reviewController.markHelpful);

// Admin routes
router.get("/admin/all", protect, authorize("admin"), reviewController.adminGetReviews);
router.put(
    "/admin/:reviewId/moderate",
    protect,
    authorize("admin"),
    reviewController.moderateReview
);

module.exports = router;
