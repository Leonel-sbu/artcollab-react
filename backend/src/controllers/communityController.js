const mongoose = require("mongoose");
const CommunityPost = require("../models/CommunityPost");
const Notification = require("../models/Notification");

/* ----------------------------- LIST POSTS ----------------------------- */
exports.listPosts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      CommunityPost.find()
        .populate("user", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .maxTimeMS(15000),
      CommunityPost.countDocuments().maxTimeMS(15000),
    ]);

    res.json({
      success: true,
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("listPosts error:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch posts" });
  }
};

/* ----------------------------- CREATE POST ---------------------------- */
exports.createPost = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim() && !req.file) {
      return res.status(400).json({ success: false, message: "Post is empty" });
    }

    const images = req.file ? [`/uploads/posts/${req.file.filename}`] : [];

    const post = await CommunityPost.create({
      user: req.user._id,
      text: (text || "").trim(),
      images,
    });

    await post.populate("user", "name");

    res.status(201).json({ success: true, post });
  } catch (error) {
    console.error("createPost error:", error.message);
    res.status(500).json({ success: false, message: "Failed to create post" });
  }
};

/* ----------------------------- LIKE / UNLIKE -------------------------- */
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid post ID" });
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const userId = req.user._id.toString();
    const index = post.likes.findIndex((lid) => lid.toString() === userId);
    let likedByMe;

    if (index === -1) {
      post.likes.push(req.user._id);
      likedByMe = true;

      // Fire-and-forget notification — don't let this fail the response
      if (!post.user.equals(req.user._id)) {
        Notification.create({
          recipient: post.user,
          sender: req.user._id,
          type: "like",
          post: post._id,
        }).catch((e) => console.warn("Notification error:", e.message));
      }
    } else {
      post.likes.splice(index, 1);
      likedByMe = false;
    }

    await post.save();

    res.json({
      success: true,
      likesCount: post.likes.length,
      likedByMe,
    });
  } catch (error) {
    console.error("toggleLike error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update like" });
  }
};

/* ----------------------------- ADD COMMENT (stub) --------------------- */
exports.addComment = async (req, res) => {
  return res.status(501).json({
    success: false,
    message: "Comments are not yet supported",
  });
};
