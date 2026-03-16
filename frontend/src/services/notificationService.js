// src/services/notificationService.js
import api from "./api";

// GET /api/notifications - Get user notifications
export async function getNotifications() {
    const res = await api.get("/api/notifications");
    return res.data;
}

// PUT /api/notifications/:id/read - Mark notification as read
export async function markAsRead(id) {
    const res = await api.put(`/api/notifications/${id}/read`);
    return res.data;
}

// Mark all as read
export async function markAllAsRead() {
    const res = await api.put("/api/notifications/read-all");
    return res.data;
}
