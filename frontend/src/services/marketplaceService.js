import api from "./api";

/**
 * GET /api/artworks?status=published
 * Returns: { success: true, items: [...] }
 */
export async function getPublishedArtworks() {
  const res = await api.get("/api/artworks?status=published", {
    headers: { "Cache-Control": "no-cache" },
  });
  return res.data;
}

/**
 * GET /api/artworks/feed — artworks from followed artists (auth required)
 * Returns: { success: true, items: [...], pagination: {...} }
 */
export async function getFeedArtworks(page = 1, limit = 20) {
  const { data } = await api.get("/api/artworks/feed", { params: { page, limit } });
  return data;
}
