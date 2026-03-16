const Artwork = require("../models/Artwork");

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

// GET /api/artworks?status=published&category=Abstract
exports.list = async (req, res) => {
  const { status, category, artist } = req.query || {};

  const filter = {};
  if (status) filter.status = String(status);
  if (category) filter.category = String(category);
  if (artist) filter.artist = String(artist);

  const items = await Artwork.find(filter)
    .populate("artist", "name role")
    .sort({ createdAt: -1 });

  res.json({ success: true, items });
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
