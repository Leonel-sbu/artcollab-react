/**
 * Review Service
 * API calls for reviews and ratings
 */

import api from "./api";

// Create a new review
export async function createReview(payload) {
    const { data } = await api.post("/api/reviews", payload);
    return data;
}

// Get reviews for a target
export async function getReviews(targetType, targetId, options = {}) {
    const { page = 1, limit = 10, sort = "recent" } = options;
    const { data } = await api.get(`/api/reviews/${targetType}/${targetId}`, {
        params: { page, limit, sort },
    });
    return data;
}

// Get current user's review for a target
export async function getMyReview(targetType, targetId) {
    const { data } = await api.get(`/api/reviews/my/${targetType}/${targetId}`);
    return data;
}

// Update own review
export async function updateReview(reviewId, payload) {
    const { data } = await api.put(`/api/reviews/${reviewId}`, payload);
    return data;
}

// Delete own review
export async function deleteReview(reviewId) {
    const { data } = await api.delete(`/api/reviews/${reviewId}`);
    return data;
}

// Mark review as helpful
export async function markHelpful(reviewId) {
    const { data } = await api.post(`/api/reviews/${reviewId}/helpful`);
    return data;
}

// Admin: Get all reviews
export async function adminGetReviews(options = {}) {
    const { page = 1, limit = 20, status } = options;
    const { data } = await api.get("/api/reviews/admin/all", {
        params: { page, limit, status },
    });
    return data;
}

// Admin: Moderate review
export async function moderateReview(reviewId, payload) {
    const { data } = await api.put(`/api/reviews/admin/${reviewId}/moderate`, payload);
    return data;
}

// Review target types
export const REVIEW_TARGET_TYPES = [
    { value: "artwork", label: "Artwork" },
    { value: "course", label: "Course" },
    { value: "commission", label: "Commission" },
];

// Sort options
export const REVIEW_SORT_OPTIONS = [
    { value: "recent", label: "Most Recent" },
    { value: "rating", label: "Highest Rated" },
    { value: "helpful", label: "Most Helpful" },
];
