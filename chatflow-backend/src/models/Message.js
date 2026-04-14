const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    // null for anonymous messages
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Alias used in anonymous / group display ("Anon#4821")
    senderAlias: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      required: [true, "Message content cannot be empty"],
      trim: true,
      maxlength: [4000, "Message too long"],
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
    // Disappearing / ghost messages: TTL handled by MongoDB index
    disappearsAt: {
      type: Date,
      default: null,
      index: { expireAfterSeconds: 0 }, // TTL index — MongoDB auto-deletes when date passes
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        readAt: { type: Date, default: Date.now },
      },
    ],
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

// Never return deleted message content
messageSchema.pre(/^find/, function (next) {
  this.where({ deleted: false });
  next();
});

module.exports = mongoose.model("Message", messageSchema);
