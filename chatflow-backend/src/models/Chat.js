const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group", "anonymous"],
      required: true,
    },
    // Direct & group chats have named participants
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Group / anonymous extras
    name: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      default: "",
      maxlength: 300,
    },
    avatar: {
      type: String,
      default: "",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Anonymous session token (UUID) — no user IDs stored
    anonSessionToken: {
      type: String,
      default: null,
      select: false, // hidden from API responses by default
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast participant lookups
chatSchema.index({ participants: 1 });
chatSchema.index({ type: 1 });
chatSchema.index({ lastActivity: -1 });

module.exports = mongoose.model("Chat", chatSchema);
