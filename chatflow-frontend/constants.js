export const COLORS = {
  peach: "#FFD2C2",
  teal: "#799A99",
  peachDark: "#f0b8a3",
  tealDark: "#5a7f7e",
  bg: "#fdf6f3",
  card: "#fff9f7",
  text: "#2d2420",
  muted: "#9a8580",
  online: "#4caf81",
};

export const style = `
  @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #fdf6f3; color: #2d2420; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #FFD2C2; border-radius: 4px; }
  .chat-item:hover { transform: translateY(-2px); box-shadow: 0 6px 20px #FFD2C240 !important; }
  .vibe-card:hover { transform: scale(1.04); }
  .nav-btn { transition: all 0.2s; }
`;

export const DIRECT = [
  { id: 1, name: "Shashank", preview: "bro the build is breaking again 😭", time: "2m ago", unread: 3, online: true },
  { id: 2, name: "Mona", preview: "Sent you the moodboard for the landing page ✨", time: "1h ago", unread: 0, online: true },
  { id: 3, name: "Sharanya", preview: "Let's grab coffee tomorrow?", time: "3h ago", unread: 0, online: false },
  { id: 4, name: "Kiran", preview: "The animation is finalized 🔥", time: "Yesterday", unread: 0, online: false },
  { id: 5, name: "Eisha", preview: "Are you free for a quick call?", time: "Yesterday", unread: 1, online: true },
];

export const GROUPS = [
  { id: 10, name: "Comparoo", preview: "Sharanya: pushed the new API changes", time: "5m ago", unread: 5, members: 6 },
  { id: 11, name: "SpaceBlaster", preview: "Kiran: design sprint starts Monday!", time: "30m ago", unread: 0, members: 4 },
  { id: 12, name: "Portfolio", preview: "Mona: everyone review the hero section", time: "2h ago", unread: 2, members: 5 },
];

export const ANON = [
  { id: 20, name: "Aparitichitha", preview: "💬 anonymous session active", time: "Now", unread: 1, online: true, anon: true },
];

export const MOCK_MESSAGES = {
  1: [
    { id: 1, from: "them", text: "bro pushed to main again without PR 💀", time: "10:02 AM" },
    { id: 2, from: "me", text: "lmaooo who did it this time", time: "10:03 AM" },
    { id: 3, from: "them", text: "the build is breaking again 😭 fix it pls", time: "10:05 AM" },
  ],
  2: [
    { id: 1, from: "them", text: "hey! working on the moodboard", time: "9:00 AM" },
    { id: 2, from: "me", text: "cool! can't wait to see it", time: "9:10 AM" },
    { id: 3, from: "them", text: "Sent you the moodboard for the landing page ✨", time: "9:45 AM" },
  ],
  3: [
    { id: 1, from: "them", text: "Hey! are you free this week?", time: "8:00 AM" },
    { id: 2, from: "me", text: "yes! what's up", time: "8:15 AM" },
    { id: 3, from: "them", text: "Let's grab coffee tomorrow?", time: "8:20 AM" },
  ],
  4: [
    { id: 1, from: "them", text: "The animation is finalized 🔥 check it out", time: "Yesterday" },
  ],
  5: [
    { id: 1, from: "them", text: "Are you free for a quick call?", time: "Yesterday" },
  ],
  10: [
    { id: 1, from: "Sharanya", text: "pushed the new API changes, please review", time: "9:55 AM" },
    { id: 2, from: "Kiran", text: "on it!", time: "9:57 AM" },
    { id: 3, from: "me", text: "approved 👍", time: "10:00 AM" },
  ],
  11: [
    { id: 1, from: "Eisha", text: "design sprint starts Monday!", time: "30m ago" },
  ],
  12: [
    { id: 1, from: "Mona", text: "everyone review the hero section pls", time: "2h ago" },
    { id: 2, from: "Shashank", text: "looks clean to me 🔥", time: "1h ago" },
  ],
  20: [
    { id: 1, from: "them", text: "hey, are you the dev from Comparoo?", time: "Just now", anon: true },
  ],
};