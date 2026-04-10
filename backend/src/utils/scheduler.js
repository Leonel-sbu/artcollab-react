const CommunityPost = require("../models/CommunityPost");

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
// Run cleanup every 24 hours
const INTERVAL_MS = 24 * 60 * 60 * 1000;

async function deleteOldPosts() {
  try {
    const cutoff = new Date(Date.now() - THIRTY_DAYS_MS);
    const result = await CommunityPost.deleteMany({ createdAt: { $lt: cutoff } });
    if (result.deletedCount > 0) {
      console.log(`[scheduler] Deleted ${result.deletedCount} community post(s) older than 30 days`);
    }
  } catch (err) {
    console.error("[scheduler] deleteOldPosts error:", err.message);
  }
}

function startScheduler() {
  // Run once on startup, then every 24 hours
  deleteOldPosts();
  setInterval(deleteOldPosts, INTERVAL_MS);
  console.log("[scheduler] Community post cleanup scheduled (every 24h)");
}

module.exports = { startScheduler };
