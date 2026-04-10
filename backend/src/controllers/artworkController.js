const mongoose = require("mongoose");
const Artwork = require("../models/Artwork");
const User = require("../models/User");

/**
 * Validate and sanitize a URL - prevents SSRF and XSS attacks
 * Only allows relative paths (/uploads/...) or whitelisted domains
 */
function sanitizeImageUrl(raw) {
  const u = String(raw || "").trim();
  if (!u) return "";

  // Allow relative paths for local uploads
  if (u.startsWith("/uploads/") || u.startsWith("uploads/")) {
    // Sanitize to prevent path traversal
    const sanitized = u.replace(/\.\./g, "").replace(/\/+/g, "/");
    if (sanitized.startsWith("/uploads/")) return sanitized;
    return "/" + sanitized;
  }

  // Allow data URLs (base64 images) - only for small images
  if (u.startsWith("data:image/")) {
    const maxDataUrlLength = 100000; // ~100KB limit for data URLs
    if (u.length > maxDataUrlLength) {
      console.warn("Data URL too large, rejecting");
      return "";
    }
    // Only allow safe image types
    const allowedDataUrl = /^data:image\/(jpeg|png|gif|webp);base64,/i;
    if (!allowedDataUrl.test(u)) {
      console.warn("Invalid data URL format, rejecting");
      return "";
    }
    return u;
  }

  // Block all external URLs to prevent SSRF
  console.warn("External URL blocked in artwork imageUrl:", u.substring(0, 50));
  return "";
}

// GET /api/artworks?status=published&category=Abstract&page=1&limit=20
exports.list = async (req, res) => {
  const { status, category, artist } = req.query || {};

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter = {};
  if (status) filter.status = String(status);
  if (category) filter.category = String(category);
  if (artist) filter.artist = String(artist);

  const [items, total] = await Promise.all([
    Artwork.find(filter)
      .populate("artist", "name role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Artwork.countDocuments(filter),
  ]);

  // Check if current user has liked each artwork
  const userId = req.user?.id;
  const itemsWithLikeStatus = items.map(item => {
    const itemObj = item.toObject();
    itemObj.likedByMe = userId ? item.likedBy?.includes(userId) : false;
    return itemObj;
  });

  res.json({
    success: true,
    items: itemsWithLikeStatus,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

// GET /api/artworks/:id
exports.getById = async (req, res) => {
  const item = await Artwork.findById(req.params.id).populate("artist", "name role");
  if (!item) return res.status(404).json({ success: false, message: "Artwork not found" });
  res.json({ success: true, item });
};

// POST /api/artworks (protected)
exports.create = async (req, res) => {
  const {
    title,
    description,
    price,
    currency,
    imageUrl,
    category,
    tags,
    royalty,
    licenseType,
    isExclusive,
    status,
  } = req.body || {};

  if (!title || !String(title).trim()) {
    return res.status(400).json({ success: false, message: "title is required" });
  }

  const item = await Artwork.create({
    title: String(title).trim(),
    description: description ? String(description) : "",

    price: typeof price === "number" ? price : Number(price || 0),
    currency: currency ? String(currency) : "ZAR",

    imageUrl: sanitizeImageUrl(imageUrl),

    category: category ? String(category).trim() : "Other",
    tags: Array.isArray(tags)
      ? tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
      : [],

    royalty: royalty !== undefined ? Number(royalty) : 10,
    licenseType: licenseType ? String(licenseType) : "personal",
    isExclusive: Boolean(isExclusive),

    status: status ? String(status) : "pending",  // Changed from "published" - requires admin approval
    artist: req.user.id,
  });

  res.status(201).json({ success: true, item });
};

// PUT /api/artworks/:id (protected)
exports.update = async (req, res) => {
  const item = await Artwork.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: "Artwork not found" });

  if (item.artist.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const {
    title,
    description,
    price,
    currency,
    imageUrl,
    category,
    tags,
    royalty,
    licenseType,
    isExclusive,
    status,
  } = req.body || {};

  if (title !== undefined) item.title = String(title).trim();
  if (description !== undefined) item.description = String(description);

  if (price !== undefined) item.price = typeof price === "number" ? price : Number(price || 0);
  if (currency !== undefined) item.currency = String(currency || "ZAR");

  if (imageUrl !== undefined) item.imageUrl = sanitizeImageUrl(imageUrl);

  if (category !== undefined) item.category = String(category || "Other").trim() || "Other";
  if (tags !== undefined) {
    item.tags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
      : [];
  }

  if (royalty !== undefined) item.royalty = Number(royalty);
  if (licenseType !== undefined) item.licenseType = String(licenseType);
  if (isExclusive !== undefined) item.isExclusive = Boolean(isExclusive);

  if (status !== undefined) item.status = String(status);

  await item.save();
  res.json({ success: true, item });
};

// DELETE /api/artworks/:id (protected)
exports.remove = async (req, res) => {
  const item = await Artwork.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: "Artwork not found" });

  if (item.artist.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  await item.deleteOne();
  res.json({ success: true, message: "Artwork deleted" });
};

// ADMIN: Approve artwork - publish to marketplace
exports.approve = async (req, res) => {
  try {
    const item = await Artwork.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Artwork not found" });
    }

    item.status = "published";
    await item.save();

    res.json({ success: true, message: "Artwork approved and published", item });
  } catch (err) {
    console.error("Approve artwork error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ADMIN: Reject artwork
exports.reject = async (req, res) => {
  try {
    const item = await Artwork.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Artwork not found" });
    }

    item.status = "rejected";
    await item.save();

    res.json({ success: true, message: "Artwork rejected", item });
  } catch (err) {
    console.error("Reject artwork error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ADMIN: Get pending artworks
exports.getPending = async (req, res) => {
  try {
    const items = await Artwork.find({ status: "pending" })
      .populate("artist", "name email role")
      .sort({ createdAt: -1 });

    res.json({ success: true, items });
  } catch (err) {
    console.error("Get pending artworks error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/artworks/:id/like - Toggle like on artwork
exports.toggleLike = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ success: false, message: "Artwork not found" });
    }

    const userId = req.user.id;
    const likedIndex = artwork.likedBy.indexOf(userId);

    if (likedIndex > -1) {
      // User already liked - unlike
      artwork.likedBy.splice(likedIndex, 1);
      artwork.likes = Math.max(0, artwork.likes - 1);
    } else {
      // User hasn't liked - like
      artwork.likedBy.push(userId);
      artwork.likes = (artwork.likes || 0) + 1;
    }

    await artwork.save();

    res.json({
      success: true,
      liked: likedIndex === -1,
      likes: artwork.likes
    });
  } catch (err) {
    console.error("Toggle like error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/artworks/:id/view - Increment view count
exports.incrementView = async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ success: false, message: "Artwork not found" });
    }

    artwork.views = (artwork.views || 0) + 1;
    await artwork.save();

    res.json({ success: true, views: artwork.views });
  } catch (err) {
    console.error("Increment view error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/artworks/stats/categories - Get artwork count by category
exports.getCategoryStats = async (req, res) => {
  try {
    const stats = await Artwork.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const categoryCounts = {};
    stats.forEach(s => {
      categoryCounts[s._id || "Other"] = s.count;
    });

    res.json({ success: true, stats: categoryCounts, total: stats.reduce((sum, s) => sum + s.count, 0) });
  } catch (err) {
    console.error("Get category stats error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/artworks/stats/user/:userId - Get artwork count for specific user
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.params.userId;
    let userObjId;
    try { userObjId = new mongoose.Types.ObjectId(userId); }
    catch { return res.status(400).json({ success: false, message: "Invalid user ID" }); }

    const total = await Artwork.countDocuments({ artist: userObjId, status: "published" });
    const pending = await Artwork.countDocuments({ artist: userObjId, status: "pending" });

    const categoryStats = await Artwork.aggregate([
      { $match: { artist: userObjId, status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const categoryCounts = {};
    categoryStats.forEach(s => {
      categoryCounts[s._id || "Other"] = s.count;
    });

    res.json({ success: true, total, pending, categories: categoryCounts });
  } catch (err) {
    console.error("Get user stats error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/artworks/feed - Artworks from artists the current user follows
exports.getFeed = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select("following");
    const followingIds = currentUser?.following || [];

    if (followingIds.length === 0) {
      return res.json({
        success: true,
        items: [],
        message: "Follow some artists to see their latest work here",
      });
    }

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Artwork.find({ artist: { $in: followingIds }, status: "published" })
        .populate("artist", "name avatar role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Artwork.countDocuments({ artist: { $in: followingIds }, status: "published" }),
    ]);

    res.json({
      success: true,
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Feed error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
