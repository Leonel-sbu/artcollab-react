const router = require("express").Router();
const { protect }   = require("../middleware/protect");
const { authorize } = require("../middleware/authorize");
const c = require("../controllers/vrVideoController");

// GET /api/vr-videos – public (anyone can watch)
router.get("/", c.list);

// POST /api/vr-videos – admin adds a video
router.post("/", protect, authorize("admin"), c.create);

// DELETE /api/vr-videos/:id – admin removes a video
router.delete("/:id", protect, authorize("admin"), c.remove);

module.exports = router;
