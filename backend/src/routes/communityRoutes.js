const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const { protect } = require("../middleware/authMiddleware");
const {
  listPosts,
  createPost,
  toggleLike,
  addComment,
} = require("../controllers/communityController");

/* -------------------------- MULTER SETUP -------------------------- */
const uploadDir = path.join(process.cwd(), "uploads", "posts");

// Guarantee the directory exists before any request can hit this route
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, unique);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, png, gif, webp) are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Wraps multer so its errors produce a JSON 400 instead of crashing
function handleUpload(req, res, next) {
  upload.single("image")(req, res, (err) => {
    if (!err) return next();
    const message =
      err instanceof multer.MulterError
        ? `Upload error: ${err.message}`
        : err.message || "File upload failed";
    res.status(400).json({ success: false, message });
  });
}

/* ---------------------------- ROUTES ------------------------------- */
router.get("/", listPosts);
router.get("/posts", listPosts); // alias kept for compatibility

router.post("/", protect, handleUpload, createPost);
router.post("/:id/like", protect, toggleLike);
router.post("/:id/comments", protect, addComment);

module.exports = router;
