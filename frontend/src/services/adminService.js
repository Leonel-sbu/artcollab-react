import { api } from "./api";

export const adminService = {
  async stats() {
    return api("/admin/stats");
  },

  async users() {
    return api("/admin/users");
  },

  async pendingArtworks() {
    return api("/admin/artworks/pending");
  },

  async setArtworkStatus(id, status) {
    return api(`/admin/artworks/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  async reports() {
    return api("/admin/reports");
  },

  async setReportStatus(id, status) {
    return api(`/admin/reports/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },
};
