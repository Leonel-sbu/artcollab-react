const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

const { protect } = require("../middleware/authMiddleware");
const {
  listPosts,
  createPost,
  toggleLike,
  addComment,
} = require("../controllers/communityController");

/* -------------------------- MULTER -------------------------- */
const uploadDir = path.join(process.cwd(), "uploads/posts");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`),
});

const upload = multer({ storage });

/* ---------------------------- ROUTES ------------------------------- */
router.get("/", listPosts);
router.get("/posts", listPosts); // Alternative route for /api/community/posts
router.post("/", protect, upload.single("image"), createPost);
router.post("/:id/like", protect, toggleLike);
router.post("/:id/comments", protect, addComment); //  COMMENTS

module.exports = router;
