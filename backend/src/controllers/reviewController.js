const Review = require("../models/Review");
const User = require("../models/User");
const Artwork = require("../models/Artwork");
const Course = require("../models/Course");
const Commission = require("../models/Commission");

// Helper to validate target exists
async function validateTarget(targetType, targetId) {
    let Model;
    switch (targetType) {
        case "artwork":
            Model = Artwork;
            break;
        case "course":
            Model = Course;
            break;
        case "artist":
            Model = User;
            break;
        case "commission":
            Model = Commission;
            break;
        default:
            return null;
    }
    return await Model.findById(targetId);
}

// Create a new review
exports.createReview = async (req, res) => {
    try {
        const { targetType, targetId, rating, title, comment, images } = req.body;
        const userId = req.user.id;

        // Validate target type
        if (!["artwork", "course", "artist", "commission"].includes(targetType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid target type. Must be artwork, course, artist, or commission",
            });
        }

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5",
            });
        }

        // Check if target exists
        const target = await validateTarget(targetType, targetId);
        if (!target) {
            return res.status(404).json({
                success: false,
                message: `${targetType} not found`,
            });
        }

        // Check if user already reviewed
        const existingReview = await Review.hasUserReviewed(userId, targetType, targetId);
        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this item",
            });
        }

        // Check if verified purchase (if artwork/course)
        let isVerifiedPurchase = false;
        if (targetType === "artwork" || targetType === "course") {
            const Order = require("../models/Order");
            const orders = await Order.find({
                user: userId,
                status: "completed",
            });
            const itemIds = orders.flatMap((o) => o.items?.map((i) => i.refId?.toString()) || []);
            isVerifiedPurchase = itemIds.includes(targetId.toString());
        }

        // For commissions, check if user has a completed commission
        if (targetType === "commission") {
            const Commission = require("../models/Commission");
            const commission = await Commission.findOne({
                _id: targetId,
                client: userId,
                status: 'completed'
            });
            isVerifiedPurchase = !!commission;
        }

        // Create review
        const review = await Review.create({
            targetType,
            targetId,
            user: userId,
            rating,
            title: title || "",
            comment: comment || "",
            images: images || [],
            isVerifiedPurchase,
            status: "pending", // Requires moderation
        });

        res.status(201).json({
            success: true,
            message: "Review submitted successfully. It will be visible after moderation.",
            review,
        });
    } catch (error) {
        console.error("Create review error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create review",
            error: error.message,
        });
    }
};

// Get reviews for a target
exports.getReviews = async (req, res) => {
    try {
        const { targetType, targetId } = req.params;
        const { page = 1, limit = 10, sort = "recent" } = req.query;

        if (!["artwork", "course", "artist", "commission"].includes(targetType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid target type",
            });
        }

        // Build sort query
        let sortQuery = { createdAt: -1 };
        if (sort === "rating") sortQuery = { rating: -1 };
        if (sort === "helpful") sortQuery = { helpful: -1 };

        const reviews = await Review.find({
            targetType,
            targetId,
            status: "approved",
        })
            .populate("user", "name email avatar")
            .sort(sortQuery)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Review.countDocuments({
            targetType,
            targetId,
            status: "approved",
        });

        // Get average rating
        const stats = await Review.getAverageRating(targetType, targetId);

        res.json({
            success: true,
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
            stats,
        });
    } catch (error) {
        console.error("Get reviews error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch reviews",
            error: error.message,
        });
    }
};

// Get user's review for a target
exports.getMyReview = async (req, res) => {
    try {
        const { targetType, targetId } = req.params;
        const userId = req.user.id;

        const review = await Review.findOne({
            user: userId,
            targetType,
            targetId,
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        res.json({
            success: true,
            review,
        });
    } catch (error) {
        console.error("Get my review error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch review",
            error: error.message,
        });
    }
};

// Update own review
exports.updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, title, comment, images } = req.body;
        const userId = req.user.id;

        const review = await Review.findOne({
            _id: reviewId,
            user: userId,
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        // Update fields
        if (rating) review.rating = rating;
        if (title !== undefined) review.title = title;
        if (comment !== undefined) review.comment = comment;
        if (images) review.images = images;

        // Reset to pending for re-moderation
        review.status = "pending";

        await review.save();

        res.json({
            success: true,
            message: "Review updated successfully",
            review,
        });
    } catch (error) {
        console.error("Update review error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update review",
            error: error.message,
        });
    }
};

// Delete own review
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user.id;

        const review = await Review.findOneAndDelete({
            _id: reviewId,
            user: userId,
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        res.json({
            success: true,
            message: "Review deleted successfully",
        });
    } catch (error) {
        console.error("Delete review error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete review",
            error: error.message,
        });
    }
};

// Mark review as helpful
exports.markHelpful = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findByIdAndUpdate(
            reviewId,
            { $inc: { helpful: 1 } },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        res.json({
            success: true,
            helpful: review.helpful,
        });
    } catch (error) {
        console.error("Mark helpful error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to mark review as helpful",
            error: error.message,
        });
    }
};

// Admin: Get all reviews (pending moderation)
exports.adminGetReviews = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) query.status = status;

        const reviews = await Review.find(query)
            .populate("user", "name email avatar")
            .populate("targetId")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Review.countDocuments(query);

        res.json({
            success: true,
            reviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Admin get reviews error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch reviews",
            error: error.message,
        });
    }
};

// Admin: Moderate review
exports.moderateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { status, adminResponse } = req.body;

        if (!["approved", "rejected", "flagged"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status",
            });
        }

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        review.status = status;

        if (adminResponse) {
            review.adminResponse = {
                message: adminResponse,
                respondedAt: new Date(),
                responder: req.user.id,
            };
        }

        await review.save();

        res.json({
            success: true,
            message: `Review ${status} successfully`,
            review,
        });
    } catch (error) {
        console.error("Moderate review error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to moderate review",
            error: error.message,
        });
    }
};
