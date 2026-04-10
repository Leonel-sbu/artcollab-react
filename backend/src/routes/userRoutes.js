const router = require("express").Router();
const { protect } = require("../middleware/protect");
const c = require("../controllers/userController");

/* Public */
router.get("/:id/artworks", c.getUserArtworks);
router.get("/:id",          c.getProfile);

/* Protected — must be logged in */

// Avatar upload – wrap multer so errors return JSON instead of crashing
router.post("/avatar", protect, (req, res, next) => {
  c.avatarUploadMiddleware(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, c.uploadAvatar);

router.post("/:id/follow",   protect, c.follow);
router.delete("/:id/follow", protect, c.unfollow);

module.exports = router;
