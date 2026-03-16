const mongoose = require("mongoose");

/* -------------------------------------------------------------------------- */
/*                                   POST                                     */
/* -------------------------------------------------------------------------- */

const postSchema = new mongoose.Schema(
  {
    /* ------------------------------- AUTHOR -------------------------------- */
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ------------------------------- CONTENT ------------------------------- */
    // Text is OPTIONAL (image-only posts allowed)
    content: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    /* ------------------------------- MEDIA --------------------------------- */
    // Always store relative paths: "/uploads/posts/xxx.jpg"
    media: {
      type: [String],
      default: [],
    },

    /* ------------------------------- LIKES --------------------------------- */
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    likesCount: {
      type: Number,
      default: 0,
    },

    /* ------------------------------ COMMENTS -------------------------------- */
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    commentsCount: {
      type: Number,
      default: 0,
    },

    /* ------------------------------- TAGS ---------------------------------- */
    tags: {
      type: [String],
      default: [],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/* -------------------------------------------------------------------------- */
/*                              MODEL EXPORT                                  */
/* -------------------------------------------------------------------------- */

module.exports = mongoose.model("Post", postSchema);
