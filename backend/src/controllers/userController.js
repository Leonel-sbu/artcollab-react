const path = require("path");
const fs = require("fs");
const multer = require("multer");
const User = require("../models/User");
const Artwork = require("../models/Artwork");
const Notification = require("../models/Notification");

/* ──────────────────────────── AVATAR UPLOAD ───────────────────────────── */

const avatarDir = path.join(process.cwd(), "uploads", "avatars");
fs.mkdirSync(avatarDir, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    cb(null, `avatar-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Only JPEG, PNG, WebP and GIF images are allowed"));
  },
});

// Export the multer middleware so the route can wrap it for error handling
exports.avatarUploadMiddleware = avatarUpload.single("avatar");

/* ─────────────────────────── ROUTE HANDLERS ───────────────────────────── */

// GET /api/users/:id  – public profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-passwordHash -resetPasswordToken -resetPasswordExpires")
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/:id/artworks – public list of a user's published artworks
exports.getUserArtworks = async (req, res) => {
  try {
    const items = await Artwork.find({ artist: req.params.id, status: "published" })
      .populate("artist", "name avatar")
      .sort({ createdAt: -1 });

    res.json({ success: true, items });
  } catch (err) {
    console.error("getUserArtworks error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/users/:id/follow  – follow a user (protected)
exports.follow = async (req, res) => {
  try {
    const targetId  = req.params.id;
    const currentId = req.user.id;

    if (targetId === currentId) {
      return res.status(400).json({ success: false, message: "You cannot follow yourself" });
    }

    const [target, current] = await Promise.all([
      User.findById(targetId),
      User.findById(currentId),
    ]);

    if (!target) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const already = current.following.some((id) => id.toString() === targetId);
    if (already) {
      return res.status(400).json({ success: false, message: "Already following this user" });
    }

    await Promise.all([
      User.findByIdAndUpdate(currentId, { $addToSet: { following: targetId } }),
      User.findByIdAndUpdate(targetId,  { $addToSet: { followers: currentId } }),
    ]);

    // Fire-and-forget notification
    Notification.create({
      recipient: targetId,
      sender:    currentId,
      type:      "follow",
      message:   `${current.name} started following you`,
    }).catch((e) => console.warn("Follow notification error:", e.message));

    res.json({
      success:   true,
      message:   `Now following ${target.name}`,
      following: true,
      followersCount: (target.followers?.length || 0) + 1,
    });
  } catch (err) {
    console.error("follow error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/users/:id/follow  – unfollow a user (protected)
exports.unfollow = async (req, res) => {
  try {
    const targetId  = req.params.id;
    const currentId = req.user.id;

    await Promise.all([
      User.findByIdAndUpdate(currentId, { $pull: { following: targetId } }),
      User.findByIdAndUpdate(targetId,  { $pull: { followers: currentId } }),
    ]);

    res.json({ success: true, message: "Unfollowed successfully", following: false });
  } catch (err) {
    console.error("unfollow error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/users/avatar  – upload / replace current user's avatar (protected)
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    // Delete the old file if it was a local upload (not a placeholder URL)
    const existing = await User.findById(req.user.id).select("avatar");
    if (existing?.avatar?.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(process.cwd(), existing.avatar);
      fs.unlink(oldPath, () => {});
    }

    await User.findByIdAndUpdate(req.user.id, { avatar: avatarPath });

    res.json({ success: true, avatar: avatarPath });
  } catch (err) {
    console.error("uploadAvatar error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
