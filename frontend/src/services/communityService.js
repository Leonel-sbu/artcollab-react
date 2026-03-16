import api from "./api";

// GET /api/community
export async function listPosts() {
  const res = await api.get("/api/community");
  return res.data;
}

// POST /api/community
export async function createPost(formData) {
  const res = await api.post("/api/community", formData);
  return res.data;
}

// POST /api/community/:id/like
export async function toggleLike(postId) {
  const res = await api.post(`/api/community/${postId}/like`);
  return res.data;
}

// POST /api/community/:id/comments
export async function addComment(postId, text) {
  const res = await api.post(`/api/community/${postId}/comments`, { text });
  return res.data;
}
