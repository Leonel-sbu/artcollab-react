import api from "./api";

/**
 * GET /api/dashboard/stats
 * Backend returns:
 * { success: true, data: { totalArtworks, totalSalesZAR, totalOrders, followers } }
 */
export async function getDashboardStats() {
  const res = await api.get("/api/dashboard/stats", {
    headers: { "Cache-Control": "no-cache" },
  });
  return res.data;
}
