const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "comment", "message", "commission", "follow", "booking", "system"],
      required: true,
    },
    // Generic message text for commission / system / follow notifications
    message: {
      type: String,
      default: "",
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommunityPost",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
