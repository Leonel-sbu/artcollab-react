import { api } from "./api";

export const courseService = {
  async list(params = {}) {
    // backend: GET /courses
    // params example: { limit: 4, sort: "-studentsCount" }
    const qs = new URLSearchParams(params).toString();
    return api(`/courses${qs ? `?${qs}` : ""}`);
  },

  async getById(id) {
    return api(`/courses/${id}`);
  },
};
