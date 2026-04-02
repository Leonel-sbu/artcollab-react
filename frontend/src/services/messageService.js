/**
 * Message Service
 * API calls for messaging functionality
 * Uses AbortController for request cancellation and error handling
 */

import api from "./api";

// Conversation endpoints
export async function getConversations() {
    const { data } = await api.get("/api/messages/conversations");
    return data;
}

export async function createConversation(participantId, type = "general", linkedResource = null) {
    const { data } = await api.post("/api/messages/conversations", {
        participantId,
        type,
        linkedResource,
    });
    return data;
}

export async function getConversation(conversationId) {
    const { data } = await api.get(`/api/messages/conversations/${conversationId}`);
    return data;
}

export async function deleteConversation(conversationId) {
    const { data } = await api.delete(`/api/messages/conversations/${conversationId}`);
    return data;
}

// Message endpoints
export async function getMessages(conversationId, options = {}) {
    const { limit = 50, before } = options;
    const params = new URLSearchParams();
    params.append("limit", limit);
    if (before) params.append("before", before);

    const { data } = await api.get(
        `/api/messages/conversations/${conversationId}/messages?${params}`
    );
    return data;
}

export async function sendMessage(conversationId, text, attachment = null) {
    const { data } = await api.post(
        `/api/messages/conversations/${conversationId}/messages`,
        { text, attachment }
    );
    return data;
}

export async function markAsRead(messageId) {
    const { data } = await api.put(`/api/messages/${messageId}/read`);
    return data;
}

export async function deleteMessage(messageId) {
    const { data } = await api.delete(`/api/messages/${messageId}`);
    return data;
}

// Unread count - with AbortController support and proper response handling
// Backend returns: { success: true, totalUnread: number }
export async function getUnreadCount(abortSignal = null) {
    try {
        const config = abortSignal ? { signal: abortSignal } : {};
        const { data } = await api.get("/api/messages/unread-count", config);

        // Return proper response format like backend sends
        if (data?.success) {
            return { success: true, totalUnread: data.totalUnread || 0 };
        }
        // Handle direct number response or missing success
        return { success: true, totalUnread: data?.count ?? data ?? 0 };
    } catch (error) {
        // Aborted requests are normal (cleanup), return 0 for other errors
        if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
            return { success: true, totalUnread: 0 };
        }
        console.warn("Failed to get unread count:", error.message);
        return { success: false, totalUnread: 0, message: error.message };
    }
}

// Legacy endpoints (for backward compatibility)
export async function getChats() {
    const { data } = await api.get("/api/messages/chats");
    return data;
}

export async function getThread(userId) {
    const { data } = await api.get(`/api/messages/thread/${userId}`);
    return data;
}

export async function send(toUserId, text) {
    const { data } = await api.post("/api/messages/send", { toUserId, text });
    return data;
}
