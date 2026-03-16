const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        // Review target
        targetType: {
            type: String,
            enum: ["artwork", "course", "artist", "commission"],
            required: true,
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "targetType",
        },
        // Reviewer
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Rating (1-5 stars)
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        // Review content
        title: {
            type: String,
            trim: true,
            maxlength: 100,
            default: "",
        },
        comment: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },
        // Media attachments (optional)
        images: {
            type: [String],
            default: [],
        },
        // Review status
        isVerifiedPurchase: {
            type: Boolean,
            default: false,
        },
        // Helpful votes
        helpful: {
            type: Number,
            default: 0,
        },
        // Moderation
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "flagged"],
            default: "pending",
        },
        // Admin response
        adminResponse: {
            message: { type: String, default: "" },
            respondedAt: { type: Date },
            responder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
reviewSchema.index({ targetType: 1, targetId: 1 });
reviewSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ status: 1 });

// Virtual for average rating calculation (can be used in aggregation)
reviewSchema.virtual("formattedRating").get(function () {
    return `${this.rating}/5`;
});

// Method to check if user already reviewed
reviewSchema.statics.hasUserReviewed = async function (userId, targetType, targetId) {
    const review = await this.findOne({
        user: userId,
        targetType,
        targetId,
        status: { $ne: "rejected" },
    });
    return !!review;
};

// Method to get average rating for a target
reviewSchema.statics.getAverageRating = async function (targetType, targetId) {
    const result = await this.aggregate([
        {
            $match: {
                targetType,
                targetId: new mongoose.Types.ObjectId(targetId),
                status: "approved",
            },
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 },
            },
        },
    ]);
    return result[0] || { averageRating: 0, totalReviews: 0 };
};

module.exports = mongoose.model("Review", reviewSchema);
