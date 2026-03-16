const Post = require("../models/Post");
const Notification = require("../models/Notification");

/* ----------------------------- LIST POSTS ----------------------------- */
exports.listPosts = async (req, res) => {
  const posts = await Post.find()
    .populate("author", "name")
    .populate({ path: "comments.user", select: "name" })
    .sort({ createdAt: -1 });

  res.json({ success: true, posts });
};

/* ----------------------------- CREATE POST ---------------------------- */
exports.createPost = async (req, res) => {
  console.log("=== CREATE POST DEBUG ===");
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);
  console.log("=========================");

  const { content } = req.body;

  if (!content && !req.file) {
    return res.status(400).json({
      success: false,
      message: "Post is empty",
    });
  }

  const media = req.file
    ? [`/uploads/posts/${req.file.filename}`]
    : [];

  const post = await Post.create({
    author: req.user.id,
    content,
    media,
  });

  await post.populate("author", "name");

  res.status(201).json({
    success: true,
    post,
  });
};


/* ----------------------------- ADD COMMENT --------------------------- */
exports.addComment = async (req, res) => {
  const { text } = req.body;
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  if (!text?.trim()) {
    return res.status(400).json({ success: false, message: "Comment required" });
  }

  post.comments.push({
    user: req.user.id,
    text,
  });

  post.commentsCount = post.comments.length;
  await post.save();

  if (!post.author.equals(req.user.id)) {
    console.log(' Creating notification...');
    await Notification.create({
      recipient: post.author,
      sender: req.user.id,
      type: "comment",
      post: post._id,
    });
  }

  await post.populate("comments.user", "name");

  res.json({
    success: true,
    comments: post.comments,
    commentsCount: post.commentsCount,
  });
};

/* ----------------------------- LIKE / UNLIKE -------------------------- */
exports.toggleLike = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  const userId = req.user.id;
  const index = post.likes.findIndex((id) => id.toString() === userId);

  let likedByMe;

  if (index === -1) {
    post.likes.push(userId);
    likedByMe = true;

    if (!post.author.equals(userId)) {
      console.log(' Creating notification...');
      await Notification.create({
        recipient: post.author,
        sender: userId,
        type: "like",
        post: post._id,
      });
    }

  } else {
    post.likes.splice(index, 1);
    likedByMe = false;
  }

  post.likesCount = post.likes.length;
  await post.save();

  res.json({
    success: true,
    likesCount: post.likesCount,
    likedByMe,
  });
};


