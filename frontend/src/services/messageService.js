/**
 * Message Service
 * API calls for messaging functionality
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

// Unread count
export async function getUnreadCount() {
    const { data } = await api.get("/api/messages/unread-count");
    return data;
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
