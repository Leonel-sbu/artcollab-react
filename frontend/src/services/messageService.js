import { api } from './api';

export const messageService = {
  // List chats (sidebar)
  async listChats() {
    return api('/messages/chats');
  },

  // Get thread with a specific user
  async getThread(userId) {
    return api(/messages/thread/);
  },

  // Send message to a user
  async send(toUserId, text) {
    return api('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ toUserId, text })
    });
  }
};
