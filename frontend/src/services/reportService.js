/**
 * Report Service
 * API calls for reporting functionality
 */

import api from "./api";

// Submit a new report
export async function createReport(payload) {
    const { data } = await api.post("/api/reports", payload);
    return data;
}

// Get current user's reports
export async function getMyReports(options = {}) {
    const { page = 1, limit = 20 } = options;
    const { data } = await api.get("/api/reports/mine", {
        params: { page, limit },
    });
    return data;
}

// Admin: Get all reports
export async function getAllReports(options = {}) {
    const { page = 1, limit = 20, status } = options;
    const { data } = await api.get("/api/reports/admin/all", {
        params: { page, limit, status },
    });
    return data;
}

// Admin: Get single report
export async function getReport(reportId) {
    const { data } = await api.get(`/api/reports/admin/${reportId}`);
    return data;
}

// Admin: Update report status
export async function updateReportStatus(reportId, payload) {
    const { data } = await api.put(`/api/reports/admin/${reportId}/status`, payload);
    return data;
}

// Admin: Delete old resolved reports
export async function cleanupReports(days = 30) {
    const { data } = await api.delete("/api/reports/admin/cleanup", {
        params: { days },
    });
    return data;
}

// Report reasons
export const REPORT_REASONS = [
    { value: "spam", label: "Spam" },
    { value: "harassment", label: "Harassment" },
    { value: "hate_speech", label: "Hate Speech" },
    { value: "nudity", label: "Nudity or Explicit Content" },
    { value: "copyright", label: "Copyright Violation" },
    { value: "fraud", label: "Fraud" },
    { value: "scam", label: "Scam" },
    { value: "violence", label: "Violence" },
    { value: "inappropriate", label: "Inappropriate Content" },
    { value: "misinformation", label: "Misinformation" },
    { value: "other", label: "Other" },
];

// Target types for display
export const TARGET_TYPES = {
    user: { label: "User", icon: "User" },
    artwork: { label: "Artwork", icon: "Image" },
    community_post: { label: "Community Post", icon: "MessageSquare" },
    message: { label: "Message", icon: "Mail" },
    course: { label: "Course", icon: "BookOpen" },
    commission: { label: "Commission", icon: "Briefcase" },
};
