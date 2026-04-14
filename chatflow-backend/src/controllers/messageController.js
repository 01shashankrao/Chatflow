const Message = require("../models/Message");
const Chat = require("../models/Chat");

// GET /api/chats/:chatId/messages — paginated message history
exports.getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 40;
    const skip = (page - 1) * limit;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found." });
    }

    // Auth: must be participant for non-anon chats
    if (
      chat.type !== "anonymous" &&
      !chat.participants.map(String).includes(req.user._id.toString())
    ) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const total = await Message.countDocuments({ chat: chatId });
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      messages: messages.reverse(), // oldest first for the client
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/chats/:chatId/messages — send a message via REST (fallback; prefer Socket.io)
exports.sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { content, type = "text", disappearAfterSeconds, isAnonymous, senderAlias } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: "Message content is required." });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found." });
    }

    // Build disappearsAt date if ghost mode
    let disappearsAt = null;
    if (disappearAfterSeconds && disappearAfterSeconds > 0) {
      disappearsAt = new Date(Date.now() + disappearAfterSeconds * 1000);
    }

    const messageData = {
      chat: chatId,
      content,
      type,
      disappearsAt,
      isAnonymous: isAnonymous || chat.type === "anonymous",
      senderAlias: senderAlias || "",
    };

    // Only attach sender for authenticated (non-anon) messages
    if (!messageData.isAnonymous) {
      messageData.sender = req.user._id;
    }

    const message = await Message.create(messageData);
    await message.populate("sender", "username avatar");

    // Update chat's lastMessage + lastActivity
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      lastActivity: new Date(),
    });

    res.status(201).json({ success: true, message });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/messages/:id/read — mark a message as read
exports.markRead = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    const alreadyRead = message.readBy.some(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      message.readBy.push({ user: req.user._id, readAt: new Date() });
      await message.save();
    }

    res.status(200).json({ success: true, message });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/messages/:id — soft-delete a message
exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    const isOwner =
      message.sender && message.sender.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ success: false, message: "You can only delete your own messages." });
    }

    message.deleted = true;
    await message.save();

    res.status(200).json({ success: true, message: "Message deleted." });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/chats/:chatId/read-all — mark all unread messages in a chat as read
exports.markAllRead = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
      {
        chat: chatId,
        "readBy.user": { $ne: userId },
        sender: { $ne: userId },
      },
      {
        $push: { readBy: { user: userId, readAt: new Date() } },
      }
    );

    res.status(200).json({ success: true, message: "All messages marked as read." });
  } catch (err) {
    next(err);
  }
};
