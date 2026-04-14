const { verifySocketToken } = require("../middleware/auth");
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const User = require("../models/User");

/**
 * ChatFlow Socket.io Handler
 *
 * Events emitted BY client → handled here:
 *   join_chat      { chatId }
 *   leave_chat     { chatId }
 *   send_message   { chatId, content, type?, disappearAfterSeconds?, isAnonymous?, senderAlias? }
 *   typing         { chatId }
 *   stop_typing    { chatId }
 *   mark_read      { chatId, messageId }
 *
 * Events emitted TO client:
 *   new_message    { message }
 *   message_deleted { messageId, chatId }
 *   user_typing    { chatId, userId, username }
 *   user_stop_typing { chatId, userId }
 *   user_online    { userId }
 *   user_offline   { userId, lastSeen }
 *   read_receipt   { chatId, messageId, userId, readAt }
 *   error          { message }
 */
const initSocket = (io) => {
  // Authenticate every socket connection via JWT
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        // Allow anonymous connections with a flag
        socket.isAnonymous = true;
        socket.anonAlias = "Anon#" + Math.floor(1000 + Math.random() * 9000);
        return next();
      }

      const user = await verifySocketToken(token);
      socket.user = user;
      socket.isAnonymous = false;
      next();
    } catch (err) {
      next(new Error("Authentication failed: " + err.message));
    }
  });

  io.on("connection", async (socket) => {
    // ── Mark user online ──────────────────────────────────────────────────
    if (!socket.isAnonymous && socket.user) {
      await User.findByIdAndUpdate(socket.user._id, {
        isOnline: true,
        socketId: socket.id,
      });
      // Broadcast online status to everyone
      socket.broadcast.emit("user_online", { userId: socket.user._id });
      console.log(`🟢 ${socket.user.username} connected (${socket.id})`);
    } else {
      console.log(`👤 Anonymous socket connected (${socket.id})`);
    }

    // ── Join a chat room ──────────────────────────────────────────────────
    socket.on("join_chat", async ({ chatId }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) return socket.emit("error", { message: "Chat not found." });

        // Auth: non-anon must be a participant
        if (
          !socket.isAnonymous &&
          chat.type !== "anonymous" &&
          !chat.participants.map(String).includes(socket.user._id.toString())
        ) {
          return socket.emit("error", { message: "Not a participant of this chat." });
        }

        socket.join(chatId);
        console.log(
          `📥 ${socket.isAnonymous ? "Anon" : socket.user.username} joined room ${chatId}`
        );
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ── Leave a chat room ─────────────────────────────────────────────────
    socket.on("leave_chat", ({ chatId }) => {
      socket.leave(chatId);
    });

    // ── Send a message ────────────────────────────────────────────────────
    socket.on("send_message", async (data) => {
      try {
        const {
          chatId,
          content,
          type = "text",
          disappearAfterSeconds,
          isAnonymous,
          senderAlias,
        } = data;

        if (!chatId || !content) {
          return socket.emit("error", { message: "chatId and content are required." });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) return socket.emit("error", { message: "Chat not found." });

        // Build disappearsAt for ghost/disappearing messages
        let disappearsAt = null;
        if (disappearAfterSeconds && disappearAfterSeconds > 0) {
          disappearsAt = new Date(Date.now() + disappearAfterSeconds * 1000);
        }

        const msgData = {
          chat: chatId,
          content,
          type,
          disappearsAt,
          isAnonymous: isAnonymous || socket.isAnonymous || chat.type === "anonymous",
          senderAlias:
            senderAlias ||
            (socket.isAnonymous ? socket.anonAlias : socket.user?.username) ||
            "",
        };

        if (!msgData.isAnonymous && socket.user) {
          msgData.sender = socket.user._id;
        }

        const message = await Message.create(msgData);
        if (message.sender) {
          await message.populate("sender", "username avatar");
        }

        // Update chat metadata
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
          lastActivity: new Date(),
        });

        // Broadcast to everyone in the room (including sender)
        io.to(chatId).emit("new_message", { message });

        // Schedule client-side ghost message removal notification
        if (disappearsAt) {
          const msUntilExpiry = disappearsAt.getTime() - Date.now();
          setTimeout(() => {
            io.to(chatId).emit("message_deleted", {
              messageId: message._id,
              chatId,
            });
          }, msUntilExpiry);
        }
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ── Typing indicators ─────────────────────────────────────────────────
    socket.on("typing", ({ chatId }) => {
      if (socket.isAnonymous) return;
      socket.to(chatId).emit("user_typing", {
        chatId,
        userId: socket.user._id,
        username: socket.user.username,
      });
    });

    socket.on("stop_typing", ({ chatId }) => {
      if (socket.isAnonymous) return;
      socket.to(chatId).emit("user_stop_typing", {
        chatId,
        userId: socket.user._id,
      });
    });

    // ── Read receipts ─────────────────────────────────────────────────────
    socket.on("mark_read", async ({ chatId, messageId }) => {
      try {
        if (socket.isAnonymous) return;

        const message = await Message.findById(messageId);
        if (!message) return;

        const alreadyRead = message.readBy.some(
          (r) => r.user.toString() === socket.user._id.toString()
        );

        if (!alreadyRead) {
          const readAt = new Date();
          message.readBy.push({ user: socket.user._id, readAt });
          await message.save();

          socket.to(chatId).emit("read_receipt", {
            chatId,
            messageId,
            userId: socket.user._id,
            readAt,
          });
        }
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ── Disconnect ────────────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      if (!socket.isAnonymous && socket.user) {
        const lastSeen = new Date();
        await User.findByIdAndUpdate(socket.user._id, {
          isOnline: false,
          socketId: null,
          lastSeen,
        });
        socket.broadcast.emit("user_offline", {
          userId: socket.user._id,
          lastSeen,
        });
        console.log(`🔴 ${socket.user.username} disconnected`);
      }
    });
  });
};

module.exports = initSocket;
