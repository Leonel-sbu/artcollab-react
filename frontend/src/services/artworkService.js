import { api } from "./api";

export const artworkService = {
  async list(params = {}) {
    // backend: GET /artworks
    // params example: { featured: true, available: true, limit: 4, sort: "-createdAt" }
    const qs = new URLSearchParams(params).toString();
    return api(`/artworks${qs ? `?${qs}` : ""}`);
  },

  async getById(id) {
    return api(`/artworks/${id}`);
  },
};
