const CommunityPost = require("../models/CommunityPost");
const Notification = require("../models/Notification");

/* ----------------------------- LIST POSTS ----------------------------- */
exports.listPosts = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    CommunityPost.find()
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    CommunityPost.countDocuments(),
  ]);

  res.json({ success: true, posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

/* ----------------------------- CREATE POST ---------------------------- */
exports.createPost = async (req, res) => {
  const { text } = req.body;

  if (!text && !req.file) {
    return res.status(400).json({
      success: false,
      message: "Post is empty",
    });
  }

  const images = req.file
    ? [`/uploads/posts/${req.file.filename}`]
    : [];

  const post = await CommunityPost.create({
    user: req.user.id,
    text,
    images,
  });

  await post.populate("user", "name");

  res.status(201).json({
    success: true,
    post,
  });
};


/* ----------------------------- ADD COMMENT (Not Supported) ------------- */
exports.addComment = async (req, res) => {
  return res.status(501).json({
    success: false,
    message: "Comments are not yet supported for community posts"
  });
};

/* ----------------------------- LIKE / UNLIKE -------------------------- */
exports.toggleLike = async (req, res) => {
  const post = await CommunityPost.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  const userId = req.user.id;
  const index = post.likes.findIndex((id) => id.toString() === userId);

  let likedByMe;

  if (index === -1) {
    post.likes.push(userId);
    likedByMe = true;

    if (!post.user.equals(userId)) {
      await Notification.create({
        recipient: post.user,
        sender: userId,
        type: "like",
        post: post._id,
      });
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
};


