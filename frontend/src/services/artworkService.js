import api from "./api";

/**
 * UPLOAD IMAGE
 * POST /api/uploads/image
 * 
 * Returns the path like "/uploads/filename.jpg"
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  // Use the api client which handles:
  // - withCredentials for cookies
  // - CSRF token in headers
  // NOTE: Do NOT set Content-Type header - let axios handle it automatically for multipart/form-data
  const res = await api.post('/api/uploads/image', formData);

  if (!res.data?.success) {
    throw new Error(res.data?.message || 'Image upload failed');
  }

  const path = res.data?.path;
  if (!path || !path.startsWith('/uploads/')) {
    throw new Error('Invalid upload path returned from server');
  }

  return path;
}

/**
 * CREATE ARTWORK
 * POST /api/artworks
 *
 * payload MUST contain:
 * - title
 * - price
 * - imageUrl  👉 MUST be "/uploads/filename.jpg"
 */
export async function createArtwork(payload) {
  if (!payload?.imageUrl) {
    throw new Error("createArtwork called without imageUrl");
  }

  // Enforce correct format on frontend (last line of defense)
  if (
    !payload.imageUrl.startsWith("/uploads/") &&
    !payload.imageUrl.startsWith("http")
  ) {
    throw new Error("Invalid imageUrl format");
  }

  const res = await api.post("/api/artworks", payload);
  return res.data;
}

/**
 * LIST ARTWORKS
 * GET /api/artworks
 */
export async function listArtworks(params = {}) {
  const res = await api.get("/api/artworks", { params });
  return res.data;
}

/**
 * GET ARTWORK BY ID
 * GET /api/artworks/:id
 */
export async function getArtworkById(id) {
  const res = await api.get(`/api/artworks/${id}`);
  return res.data;
}

/**
 * TOGGLE LIKE ON ARTWORK
 * POST /api/artworks/:id/like
 */
export async function toggleArtworkLike(id) {
  const res = await api.post(`/api/artworks/${id}/like`);
  return res.data;
}

/**
 * INCREMENT VIEW COUNT
 * POST /api/artworks/:id/view
 */
export async function incrementArtworkView(id) {
  const res = await api.post(`/api/artworks/${id}/view`);
  return res.data;
}

/**
 * GET CATEGORY STATS
 * GET /api/artworks/stats/categories
 */
export async function getCategoryStats() {
  const res = await api.get("/api/artworks/stats/categories");
  return res.data;
}

/**
 * GET USER ARTWORK STATS
 * GET /api/artworks/stats/user/:userId
 */
export async function getUserArtworkStats(userId) {
  const res = await api.get(`/api/artworks/stats/user/${userId}`);
  return res.data;
}
