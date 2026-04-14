const express = require("express");
const router = express.Router();
const {
  getMyChats,
  getOrCreateDirect,
  createGroup,
  addGroupMembers,
  startAnonChat,
  getChatById,
} = require("../controllers/chatController");
const {
  getMessages,
  sendMessage,
  markRead,
  deleteMessage,
  markAllRead,
} = require("../controllers/messageController");
const { protect } = require("../middleware/auth");

// All chat routes require authentication
router.use(protect);

// Chat list & creation
router.get("/", getMyChats);
router.post("/direct", getOrCreateDirect);
router.post("/group", createGroup);
router.post("/anon", startAnonChat);
router.patch("/group/:id/members", addGroupMembers);
router.get("/:id", getChatById);

// Messages within a chat
router.get("/:chatId/messages", getMessages);
router.post("/:chatId/messages", sendMessage);
router.patch("/:chatId/read-all", markAllRead);

module.exports = router;
