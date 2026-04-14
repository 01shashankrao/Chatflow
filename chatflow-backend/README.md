# ChatFlow Backend

Real-time chat API built with **Node.js**, **Express**, **MongoDB Atlas** and **Socket.io**.

## Features
- JWT authentication (register / login)
- Individual (direct) chats
- Group chats with admin controls
- Anonymous chats (no user ID stored)
- Disappearing / ghost messages (MongoDB TTL index)
- Real-time messaging via Socket.io
- Typing indicators
- Read receipts
- Online / offline presence

---

## Quick Start

### 1. Clone & install
```bash
git clone <your-repo>
cd chatflow-backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```

Edit `.env` and fill in:
```
MONGODB_URI=mongodb+srv://USER:PASS@CLUSTER.mongodb.net/chatflow?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_64_char_string
PORT=5000
CLIENT_ORIGIN=http://localhost:3000
```

### 3. Get your MongoDB Atlas URI
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Click **Connect → Drivers → Node.js**
4. Copy the connection string and paste into `.env`
5. Add your IP to the **Network Access** allowlist (or allow `0.0.0.0/0` for dev)

### 4. Seed demo data
```bash
npm run seed
```
Creates users: `shashank`, `mona`, `sharanya`, `kiran`, `eisha` (password: `password123`)  
Creates groups: `Comparoo`, `SpaceBlaster`, `Portfolio`

### 5. Start the server
```bash
npm run dev   # development (nodemon)
npm start     # production
```

---

## API Reference

### Auth
| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | `{ username, email, password }` | Register |
| POST | `/api/auth/login` | `{ email, password }` | Login → JWT |
| GET | `/api/auth/me` | — | Current user |
| PATCH | `/api/auth/me` | `{ username?, bio?, avatar? }` | Update profile |

### Chats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chats` | All my chats |
| POST | `/api/chats/direct` | `{ userId }` — get or create DM |
| POST | `/api/chats/group` | `{ name, participantIds[] }` — create group |
| POST | `/api/chats/anon` | Start anonymous session |
| GET | `/api/chats/:id` | Single chat |
| PATCH | `/api/chats/group/:id/members` | `{ userIds[] }` — add members |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chats/:chatId/messages` | Paginated history (`?page=1&limit=40`) |
| POST | `/api/chats/:chatId/messages` | Send message (REST fallback) |
| PATCH | `/api/chats/:chatId/read-all` | Mark all read |
| PATCH | `/api/messages/:id/read` | Mark one read |
| DELETE | `/api/messages/:id` | Soft delete |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/search?q=name` | Search users |
| GET | `/api/users/online` | Online users |
| GET | `/api/users/:id` | User profile |

---

## Socket.io Events

**Authenticate:** pass token in `socket.handshake.auth.token`

### Client → Server
```js
socket.emit("join_chat",    { chatId })
socket.emit("leave_chat",   { chatId })
socket.emit("send_message", { chatId, content, type?, disappearAfterSeconds?, isAnonymous?, senderAlias? })
socket.emit("typing",       { chatId })
socket.emit("stop_typing",  { chatId })
socket.emit("mark_read",    { chatId, messageId })
```

### Server → Client
```js
socket.on("new_message",       ({ message }) => {})
socket.on("message_deleted",   ({ messageId, chatId }) => {})
socket.on("user_typing",       ({ chatId, userId, username }) => {})
socket.on("user_stop_typing",  ({ chatId, userId }) => {})
socket.on("user_online",       ({ userId }) => {})
socket.on("user_offline",      ({ userId, lastSeen }) => {})
socket.on("read_receipt",      ({ chatId, messageId, userId, readAt }) => {})
socket.on("error",             ({ message }) => {})
```

### Ghost / Disappearing Messages
Send with `disappearAfterSeconds: 8` — MongoDB TTL index auto-deletes the document; the server also emits `message_deleted` via Socket.io after the timer fires.

---

## Project Structure
```
chatflow-backend/
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB Atlas connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Chat.js
│   │   └── Message.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── messageController.js
│   │   └── userController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── messageRoutes.js
│   │   └── userRoutes.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── socket/
│   │   └── socketHandler.js   # All Socket.io logic
│   └── server.js              # Entry point
├── scripts/
│   └── seed.js                # Demo data seeder
├── .env.example
├── .gitignore
└── package.json
```
