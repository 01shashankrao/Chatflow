/**
 * ChatFlow Seed Script
 * Creates the 5 users + 3 groups from the UI mockup in MongoDB Atlas.
 *
 * Usage:
 *   node scripts/seed.js
 *
 * Make sure .env is configured with MONGODB_URI before running.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");
const Chat = require("../src/models/Chat");
const Message = require("../src/models/Message");

const connectDB = require("../src/config/db");

const USERS = [
  { username: "shashank",  email: "shashank@chatflow.dev",  password: "password123" },
  { username: "mona",      email: "mona@chatflow.dev",      password: "password123" },
  { username: "sharanya",  email: "sharanya@chatflow.dev",  password: "password123" },
  { username: "kiran",     email: "kiran@chatflow.dev",     password: "password123" },
  { username: "eisha",     email: "eisha@chatflow.dev",     password: "password123" },
];

const GROUPS = [
  { name: "Comparoo",     description: "Backend + Frontend sync for Comparoo project" },
  { name: "SpaceBlaster", description: "Game dev team chat" },
  { name: "Portfolio",    description: "Portfolio review and design feedback" },
];

async function seed() {
  await connectDB();
  console.log("\n🌱 Seeding ChatFlow database...\n");

  // Wipe existing data
  await User.deleteMany({});
  await Chat.deleteMany({});
  await Message.deleteMany({});
  console.log("🗑️  Cleared existing data.");

  // Create users
  const createdUsers = [];
  for (const u of USERS) {
    const user = await User.create(u);
    createdUsers.push(user);
    console.log(`👤 Created user: ${user.username} (${user._id})`);
  }

  // Create direct chats between first user (shashank) and the rest
  const [shashank, mona, sharanya, kiran, eisha] = createdUsers;

  const directChats = [];
  for (const other of [mona, sharanya, kiran, eisha]) {
    const chat = await Chat.create({
      type: "direct",
      participants: [shashank._id, other._id],
    });
    directChats.push({ chat, other });
    console.log(`💬 Direct chat: shashank ↔ ${other.username}`);
  }

  // Seed a couple messages per direct chat
  const sampleMessages = [
    "hey! how's the project going?",
    "making good progress, pushed some updates",
    "looks great, let me review the PR",
  ];
  for (const { chat, other } of directChats) {
    for (let i = 0; i < sampleMessages.length; i++) {
      await Message.create({
        chat: chat._id,
        sender: i % 2 === 0 ? shashank._id : other._id,
        content: sampleMessages[i],
      });
    }
  }

  // Create group chats
  for (const g of GROUPS) {
    const group = await Chat.create({
      type: "group",
      name: g.name,
      description: g.description,
      participants: createdUsers.map((u) => u._id),
      admin: shashank._id,
    });

    await Message.create({
      chat: group._id,
      sender: shashank._id,
      content: `Welcome to ${g.name}! 🚀`,
      type: "system",
    });

    console.log(`👥 Created group: ${g.name} (${group._id})`);
  }

  // Create one anonymous chat
  const anonChat = await Chat.create({
    type: "anonymous",
    name: "Anonymous Session",
    anonSessionToken: "demo-anon-token-aparitichitha",
    participants: [],
  });

  await Message.create({
    chat: anonChat._id,
    sender: null,
    senderAlias: "Anon#4821",
    content: "hey, are you the dev from Comparoo?",
    isAnonymous: true,
  });

  console.log(`👤 Created anonymous chat (${anonChat._id})`);

  console.log(`
✅ Seed complete!

Default credentials (all users):
  Password: password123

Users: shashank, mona, sharanya, kiran, eisha
Groups: Comparoo, SpaceBlaster, Portfolio
Anon: 1 anonymous session

Start the server: npm run dev
  `);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
