const mongoose = require("mongoose");

const communityPostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: "" },
    images: { type: [String], default: [] }, // /uploads/community/...
    videos: { type: [String], default: [] }, // /uploads/community/...
    likes: { type: [mongoose.Schema.Types.ObjectId], ref: "User", default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommunityPost", communityPostSchema);
