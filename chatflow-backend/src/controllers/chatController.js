const { v4: uuidv4 } = require("uuid");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");

// ─── DIRECT CHATS ──────────────────────────────────────────────────────────

// GET /api/chats — all chats for the logged-in user
exports.getMyChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
      type: { $in: ["direct", "group"] },
    })
      .populate("participants", "username avatar isOnline lastSeen")
      .populate("lastMessage")
      .sort({ lastActivity: -1 });

    res.status(200).json({ success: true, count: chats.length, chats });
  } catch (err) {
    next(err);
  }
};

// POST /api/chats/direct — get or create a direct chat with another user
exports.getOrCreateDirect = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required." });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Check if direct chat already exists between both users
    let chat = await Chat.findOne({
      type: "direct",
      participants: { $all: [req.user._id, userId], $size: 2 },
    })
      .populate("participants", "username avatar isOnline lastSeen")
      .populate("lastMessage");

    if (!chat) {
      chat = await Chat.create({
        type: "direct",
        participants: [req.user._id, userId],
      });
      chat = await chat.populate("participants", "username avatar isOnline lastSeen");
    }

    res.status(200).json({ success: true, chat });
  } catch (err) {
    next(err);
  }
};

// ─── GROUP CHATS ───────────────────────────────────────────────────────────

// POST /api/chats/group — create a group chat
exports.createGroup = async (req, res, next) => {
  try {
    const { name, description, participantIds } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Group name is required." });
    }

    const ids = [...new Set([...(participantIds || []), req.user._id.toString()])];

    const chat = await (
      await Chat.create({
        type: "group",
        name,
        description: description || "",
        participants: ids,
        admin: req.user._id,
      })
    ).populate("participants", "username avatar isOnline lastSeen");

    res.status(201).json({ success: true, chat });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/chats/group/:id/members — add members to a group
exports.addGroupMembers = async (req, res, next) => {
  try {
    const { userIds } = req.body;
    const chat = await Chat.findById(req.params.id);
    if (!chat || chat.type !== "group") {
      return res.status(404).json({ success: false, message: "Group not found." });
    }
    if (chat.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the admin can add members." });
    }

    const newIds = userIds.filter((id) => !chat.participants.map(String).includes(id));
    chat.participants.push(...newIds);
    await chat.save();
    await chat.populate("participants", "username avatar isOnline lastSeen");

    res.status(200).json({ success: true, chat });
  } catch (err) {
    next(err);
  }
};

// ─── ANONYMOUS CHATS ───────────────────────────────────────────────────────

// POST /api/chats/anon — start an anonymous chat session
exports.startAnonChat = async (req, res, next) => {
  try {
    const token = uuidv4();
    const alias = "Anon#" + Math.floor(1000 + Math.random() * 9000);

    const chat = await Chat.create({
      type: "anonymous",
      name: "Anonymous Session",
      anonSessionToken: token,
      participants: [],
    });

    res.status(201).json({
      success: true,
      chatId: chat._id,
      anonSessionToken: token,
      alias,
      message: "Anonymous session started. Share the token to connect.",
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/chats/:id — single chat detail
exports.getChatById = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate("participants", "username avatar isOnline lastSeen")
      .populate("lastMessage");

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found." });
    }

    // Auth check: user must be a participant (skip for anon)
    if (
      chat.type !== "anonymous" &&
      !chat.participants.some((p) => p._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    res.status(200).json({ success: true, chat });
  } catch (err) {
    next(err);
  }
};
