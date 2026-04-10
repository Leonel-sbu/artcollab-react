const VRVideo = require("../models/VRVideo");

// GET /api/vr-videos – list all (public)
exports.list = async (req, res) => {
  try {
    const videos = await VRVideo.find()
      .populate("addedBy", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, videos });
  } catch (err) {
    console.error("VR list error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/vr-videos – add video (admin only)
exports.create = async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnail } = req.body;

    if (!title?.trim() || !videoUrl?.trim()) {
      return res.status(400).json({ success: false, message: "title and videoUrl are required" });
    }

    const video = await VRVideo.create({
      title:       title.trim(),
      description: description?.trim() || "",
      videoUrl:    videoUrl.trim(),
      thumbnail:   thumbnail?.trim() || "",
      addedBy:     req.user.id,
    });

    await video.populate("addedBy", "name");

    res.status(201).json({ success: true, video });
  } catch (err) {
    console.error("VR create error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/vr-videos/:id – delete video (admin only)
exports.remove = async (req, res) => {
  try {
    const video = await VRVideo.findByIdAndDelete(req.params.id);

    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }

    res.json({ success: true, message: "Video deleted" });
  } catch (err) {
    console.error("VR delete error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
