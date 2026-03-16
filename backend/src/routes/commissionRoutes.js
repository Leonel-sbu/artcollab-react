const router = require("express").Router();
const path = require("path");
const multer = require("multer");

const { protect, authorize } = require('../middleware/authMiddleware');
const c = require("../controllers/commissionController");

// uploads/services/*
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(process.cwd(), "uploads", "services")),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`),
});

const upload = multer({ storage });

// Public routes
router.get("/", c.list);
router.get("/categories", c.getCategories);
router.get("/my-services", protect, c.myServices);
router.get("/my-bookings", protect, c.myBookings);
router.get("/:id", c.getById);

// Protected routes
router.post("/", protect, upload.array("images", 6), c.createService);
router.post("/:id/book", protect, c.book);
router.patch("/:id", protect, c.updateService);
router.patch("/:id/status", protect, c.updateStatus);
router.delete("/:id", protect, c.remove);

module.exports = router;
