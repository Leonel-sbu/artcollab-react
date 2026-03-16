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
