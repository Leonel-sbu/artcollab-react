const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const { uploadLimiter } = require("../config/rateLimits");

const router = express.Router();

// Always save to backend/uploads
const uploadDir = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname || "") || ".jpg").toLowerCase();
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1000000);
    const filename = `upload_${timestamp}_${random}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Upload endpoint (requires auth)
router.post("/image", protect, uploadLimiter, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const filename = req.file.filename;
  const publicPath = `/uploads/${filename}`; // relative path for DB
  const absoluteUrl = `${req.protocol}://${req.get("host")}${publicPath}`; // full URL for preview

  res.status(201).json({
    success: true,
    imageUrl: publicPath,   // <-- store this in MongoDB
    previewUrl: absoluteUrl, // <-- use this for immediate frontend preview
    path: publicPath        // <-- for frontend compatibility
  });
});

module.exports = router;
