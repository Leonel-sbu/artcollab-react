const path = require("path");
const multer = require("multer");

// Correct path: __dirname is middleware/, so go up 2 levels to backend/, then into uploads/
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext || ".jpg";
    const name = `art_${Date.now()}_${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, name);
  },
});

function fileFilter(req, file, cb) {
  const ok = ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.mimetype);
  if (!ok) return cb(new Error("Only JPG, PNG, GIF, WEBP images are allowed"), false);
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = { upload };
