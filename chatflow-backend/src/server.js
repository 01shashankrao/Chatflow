require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const initSocket = require("./socket/socketHandler");

// ── Routes ────────────────────────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/userRoutes");

// ── Connect to MongoDB Atlas ──────────────────────────────────────────────
connectDB();

// ── Express app ───────────────────────────────────────────────────────────
const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ChatFlow API",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ── API Routes ────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ── Global error handler ──────────────────────────────────────────────────
app.use(errorHandler);

// ── HTTP + Socket.io server ───────────────────────────────────────────────
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Attach socket handler
initSocket(io);

// ── Start listening ───────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║         ChatFlow Backend Running         ║
╠══════════════════════════════════════════╣
║  HTTP  →  http://localhost:${PORT}          ║
║  Mode  →  ${(process.env.NODE_ENV || "development").padEnd(30)}║
╚══════════════════════════════════════════╝
  `);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});
