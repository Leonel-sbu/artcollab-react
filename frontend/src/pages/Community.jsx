import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Image as ImageIcon, Send, Flag } from "lucide-react";
import toast from "react-hot-toast";
import InlineLoader from "../components/shared/InlineLoader";
import ReportModal from "../components/moderation/ReportModal";

import { resolveImageUrl } from "../utils/resolveImage";
import {
  listPosts,
  createPost,
  toggleLike,
  addComment,
} from "../services/communityService";

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [reportTarget, setReportTarget] = useState(null); // { id, name }

  /* LOAD POSTS */
  useEffect(() => {
    (async () => {
      try {
        const res = await listPosts();
        if (res?.success) setPosts(res.posts || []);
      } catch (error) {
        console.error('Failed to load posts:', error);
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          toast.error("Unable to connect to server. Please check your connection.");
        } else {
          toast.error("Failed to load posts");
        }
      }
    })();
  }, []);

  /* CREATE POST */
  const handleCreatePost = async () => {
    if (!newPost.trim() && !image) {
      return toast.error("Write something or add an image");
    }

    const fd = new FormData();
    fd.append("text", newPost);
    if (image) fd.append("image", image);

    try {
      const res = await createPost(fd);
      if (res?.success) {
        setPosts((p) => [res.post, ...p]);
        setNewPost("");
        setImage(null);
        setPreview(null);
      }
    } catch {
      toast.error("Post failed");
    }
  };

  /* TOGGLE LIKE */
  const handleLike = async (postId) => {
    try {
      const res = await toggleLike(postId);
      if (!res?.success) throw new Error();

      setPosts((posts) =>
        posts.map((p) =>
          p._id === postId
            ? { ...p, likesCount: res.likesCount, likedByMe: res.likedByMe }
            : p
        )
      );
    } catch {
      toast.error("Like failed");
    }
  };

  /* ADD COMMENT (OPTIMISTIC) */
  const handleAddComment = async (postId) => {
    const text = commentText[postId]?.trim();
    if (!text) return;

    const optimisticComment = {
      _id: `temp-${Date.now()}`,
      text,
      user: { name: "You" },
      optimistic: true,
    };

    setPosts((posts) =>
      posts.map((p) =>
        p._id === postId
          ? {
            ...p,
            comments: [...(p.comments || []), optimisticComment],
            commentsCount: (p.commentsCount || 0) + 1,
          }
          : p
      )
    );

    setCommentText((c) => ({ ...c, [postId]: "" }));

    try {
      const res = await addComment(postId, text);
      if (!res?.success) throw new Error();

      setPosts((posts) =>
        posts.map((p) =>
          p._id === postId
            ? {
              ...p,
              comments: res.comments,
              commentsCount: res.commentsCount,
            }
            : p
        )
      );
    } catch {
      toast.error("Comment failed");
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* CREATE POST */}
        <section className="bg-gray-800 p-4 rounded-xl">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full bg-gray-900 rounded p-3 mb-3"
          />

          {preview && (
            <img src={preview} alt="Preview" className="rounded mb-3 max-h-64" />
          )}

          <div className="flex gap-3 items-center">
            <label className="cursor-pointer flex items-center gap-2 text-gray-300">
              <ImageIcon />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setImage(f);
                  setPreview(URL.createObjectURL(f));
                }}
              />
            </label>

            <button
              onClick={handleCreatePost}
              className="ml-auto bg-blue-600 px-4 py-2 rounded"
            >
              Post
            </button>
          </div>
        </section>

        {/* POSTS */}
        {posts.map((post) => (
          <motion.article
            key={post._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 p-4 rounded-xl"
          >
            {post.text && <p className="mb-2">{post.text}</p>}

            {post.images?.[0] && (
              <img
                src={resolveImageUrl(post.images[0])}
                alt="Post"
                className="rounded mb-3 max-h-96"
              />
            )}

            <div className="flex items-center gap-4">
              <button
                onClick={() => handleLike(post._id)}
                className={`flex items-center gap-2 ${post.likedByMe ? "text-red-500" : "text-gray-400"}`}
              >
                <Heart
                  className="w-5 h-5"
                  fill={post.likedByMe ? "currentColor" : "none"}
                />
                {post.likesCount || 0}
              </button>

              <button
                onClick={() => setReportTarget({ id: post._id, name: `post by ${post.user?.name || 'user'}` })}
                className="flex items-center gap-1 text-gray-500 hover:text-red-400 text-sm transition-colors"
                title="Report post"
              >
                <Flag className="w-4 h-4" />
                Report
              </button>
            </div>

            {/* COMMENTS - Disabled (not yet supported) */}
            {/* Comments feature coming soon */}
            {false && post.comments?.map((c) => (
              <div
                key={c._id}
                className={`text-sm p-2 rounded ${c.optimistic
                  ? "bg-gray-800 opacity-70"
                  : "bg-gray-900"
                  }`}
              >
                <span className="font-semibold text-blue-400">
                  {c.user?.name}
                </span>{" "}
                {c.text}
              </div>
            ))}

            {false && (
              <div className="flex gap-2">
                <input
                  value={commentText[post._id] || ""}
                  onChange={(e) =>
                    setCommentText((c) => ({
                      ...c,
                      [post._id]: e.target.value,
                    }))
                  }
                  placeholder="Write a comment..."
                  className="flex-1 bg-gray-900 rounded px-3 py-2 text-sm"
                />
                <button onClick={() => handleAddComment(post._id)}>
                  <Send size={16} />
                </button>
              </div>
            )}
          </motion.article>
        ))}
      </div>

      <ReportModal
        isOpen={!!reportTarget}
        onClose={() => setReportTarget(null)}
        targetType="community_post"
        targetId={reportTarget?.id}
        targetName={reportTarget?.name}
      />
    </main>
  );
}
