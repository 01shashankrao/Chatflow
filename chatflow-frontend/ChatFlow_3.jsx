import { useState, useEffect, useRef } from "react";

const COLORS = {
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

const style = `
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

const Avatar = ({ name, size = 44, online = false, anon = false }) => {
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const palette = [COLORS.peach, COLORS.teal, "#c8b8d4", "#b8c8d4", "#d4c8b8"];
  const idx = name ? name.charCodeAt(0) % palette.length : 0;
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: anon ? "linear-gradient(135deg, #2d2420, #799A99)" : palette[idx],
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "sans-serif", fontWeight: 700,
        fontSize: size * 0.35, color: anon ? "#fff" : COLORS.text,
        border: `2px solid ${COLORS.card}`,
      }}>
        {anon ? "?" : initials}
      </div>
      {online && <div style={{ position: "absolute", bottom: 2, right: 2, width: 10, height: 10, borderRadius: "50%", background: COLORS.online, border: `2px solid ${COLORS.card}` }} />}
    </div>
  );
};

const DIRECT = [
  { id: 1, name: "Shashank", preview: "bro the build is breaking again 😭", time: "2m ago", unread: 3, online: true },
  { id: 2, name: "Mona", preview: "Sent you the moodboard for the landing page ✨", time: "1h ago", unread: 0, online: true },
  { id: 3, name: "Sharanya", preview: "Let's grab coffee tomorrow?", time: "3h ago", unread: 0, online: false },
  { id: 4, name: "Kiran", preview: "The animation is finalized 🔥", time: "Yesterday", unread: 0, online: false },
  { id: 5, name: "Eisha", preview: "Are you free for a quick call?", time: "Yesterday", unread: 1, online: true },
];

const GROUPS = [
  { id: 10, name: "Comparoo", preview: "Sharanya: pushed the new API changes", time: "5m ago", unread: 5, members: 6 },
  { id: 11, name: "SpaceBlaster", preview: "Kiran: design sprint starts Monday!", time: "30m ago", unread: 0, members: 4 },
  { id: 12, name: "Portfolio", preview: "Mona: everyone review the hero section", time: "2h ago", unread: 2, members: 5 },
];

const ANON = [
  { id: 20, name: "Aparitichitha", preview: "💬 anonymous session active", time: "Now", unread: 1, online: true, anon: true },
];

const MOCK_MESSAGES = {
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

function ChatScreen({ chat, onBack, isGroup, isAnon }) {
  const [messages, setMessages] = useState(MOCK_MESSAGES[chat.id] || []);
  const [input, setInput] = useState("");
  const [ghostMode, setGhostMode] = useState(false);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const msgId = Date.now();
    const msg = {
      id: msgId, from: "me", text: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ghost: ghostMode,
    };
    setMessages(m => [...m, msg]);
    setInput("");
    if (ghostMode) {
      setTimeout(() => setMessages(m => m.filter(x => x.id !== msgId)), 8000);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: COLORS.bg }}>
      <div style={{ padding: "14px 16px", background: COLORS.card, display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${COLORS.peach}40`, boxShadow: `0 2px 12px ${COLORS.peach}30` }}>
        <button onClick={onBack} style={{ background: COLORS.peach, border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
        <Avatar name={chat.name} size={40} online={chat.online} anon={isAnon} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 16 }}>{isAnon ? "👤 " : ""}{chat.name}</div>
          <div style={{ fontSize: 11, color: COLORS.muted }}>{isGroup ? `${chat.members} members` : chat.online ? "🟢 online" : "offline"}</div>
        </div>
        <button onClick={() => setGhostMode(g => !g)} style={{
          background: ghostMode ? COLORS.teal : `${COLORS.teal}22`, border: "none", borderRadius: 10,
          padding: "6px 12px", cursor: "pointer", color: ghostMode ? "#fff" : COLORS.teal,
          fontSize: 11, fontWeight: 600, transition: "all 0.2s",
        }}>
          {ghostMode ? "💨 Ghost ON" : "💨 Ghost"}
        </button>
      </div>

      {ghostMode && (
        <div style={{ background: `${COLORS.teal}20`, padding: "7px 16px", fontSize: 11, color: COLORS.tealDark, textAlign: "center", fontWeight: 600 }}>
          ✨ Ghost mode — messages vanish in 8 seconds
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: "flex", justifyContent: msg.from === "me" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end", opacity: msg.ghost ? 0.85 : 1, transition: "opacity 0.5s" }}>
            {msg.from !== "me" && <Avatar name={isAnon ? "?" : (isGroup ? msg.from : chat.name)} size={28} anon={isAnon} />}
            <div style={{ maxWidth: "72%" }}>
              {isGroup && msg.from !== "me" && <div style={{ fontSize: 10, color: COLORS.teal, fontWeight: 700, marginBottom: 3, paddingLeft: 4 }}>{msg.from}</div>}
              <div style={{
                background: msg.from === "me" ? `linear-gradient(135deg, ${COLORS.peach}, ${COLORS.peachDark})` : COLORS.card,
                borderRadius: msg.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                padding: "10px 14px",
                boxShadow: `0 2px 8px ${COLORS.peach}40`,
                border: msg.from !== "me" ? `1px solid ${COLORS.peach}40` : "none",
              }}>
                <div style={{ fontSize: 14 }}>{msg.text}</div>
                <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 4, textAlign: "right" }}>
                  {msg.ghost ? "💨 " : ""}{msg.time}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "10px 14px", background: COLORS.card, borderTop: `1px solid ${COLORS.peach}30`, display: "flex", gap: 10, alignItems: "center" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder={ghostMode ? "Ghost message..." : isAnon ? "Anonymous message..." : "Type a message..."}
          style={{ flex: 1, background: `${COLORS.peach}30`, border: "none", borderRadius: 24, padding: "12px 18px", fontSize: 14, outline: "none", color: COLORS.text, fontFamily: "sans-serif" }}
        />
        <button onClick={send} style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.tealDark})`, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", boxShadow: `0 4px 12px ${COLORS.teal}50` }}>
          ➤
        </button>
      </div>
    </div>
  );
}

function ChatsTab({ onSelect }) {
  const [tab, setTab] = useState("direct");
  const [search, setSearch] = useState("");

  const lists = { direct: DIRECT, groups: GROUPS, anon: ANON };
  const current = lists[tab].filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: COLORS.bg }}>
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.tealDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>💬</div>
            <span style={{ fontFamily: "sans-serif", fontWeight: 800, fontSize: 20, color: COLORS.text }}>ChatFlow</span>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${COLORS.peach}60`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16 }}>🔍</div>
        </div>

        <h1 style={{ fontFamily: "sans-serif", fontWeight: 900, fontSize: 36, lineHeight: 1, marginBottom: 18 }}>Conversations</h1>

        <div style={{ background: COLORS.card, borderRadius: 16, padding: "11px 16px", display: "flex", alignItems: "center", gap: 10, marginBottom: 18, boxShadow: `0 2px 12px ${COLORS.peach}30` }}>
          <span style={{ color: COLORS.muted }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search chats..." style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, color: COLORS.text, outline: "none" }} />
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto", paddingBottom: 2 }}>
          {["direct", "groups", "anon"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "8px 20px", borderRadius: 24, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, whiteSpace: "nowrap", transition: "all 0.2s", textTransform: "uppercase", letterSpacing: 0.5,
              background: tab === t ? COLORS.peach : `${COLORS.peach}25`,
              color: tab === t ? COLORS.text : COLORS.muted,
              boxShadow: tab === t ? `0 4px 12px ${COLORS.peach}60` : "none",
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 20px" }}>
        {current.map(chat => (
          <div key={chat.id} className="chat-item" onClick={() => onSelect(chat, tab)} style={{
            background: COLORS.card, borderRadius: 18, padding: "14px 16px", marginBottom: 10,
            display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
            boxShadow: `0 2px 10px ${COLORS.peach}25`, border: `1px solid ${COLORS.peach}20`, transition: "all 0.15s",
          }}>
            <Avatar name={chat.name} size={50} online={chat.online} anon={chat.anon} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{chat.anon ? "👤 " : ""}{chat.name}</span>
                <span style={{ fontSize: 11, color: COLORS.muted, fontWeight: 500 }}>{chat.time}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: COLORS.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{chat.preview}</span>
                {chat.unread > 0 && <div style={{ minWidth: 20, height: 20, borderRadius: 10, background: COLORS.teal, color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>{chat.unread}</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupsTab({ onSelect }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: COLORS.bg }}>
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.tealDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>💬</div>
          <span style={{ fontWeight: 800, fontSize: 20 }}>ChatFlow</span>
        </div>
        <h1 style={{ fontWeight: 900, fontSize: 36, marginBottom: 20 }}>Groups</h1>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 20px" }}>
        {GROUPS.map(g => (
          <div key={g.id} className="chat-item" onClick={() => onSelect(g, "groups")} style={{
            background: COLORS.card, borderRadius: 18, padding: 16, marginBottom: 10, cursor: "pointer",
            boxShadow: `0 2px 10px ${COLORS.peach}25`, border: `1px solid ${COLORS.peach}20`, transition: "all 0.15s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
              <div style={{ width: 50, height: 50, borderRadius: 16, background: `linear-gradient(135deg, ${COLORS.teal}50, ${COLORS.peach}80)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, color: COLORS.tealDark }}>{g.name[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{g.name}</div>
                <div style={{ fontSize: 12, color: COLORS.muted }}>👥 {g.members} members · {g.time}</div>
              </div>
              {g.unread > 0 && <div style={{ minWidth: 22, height: 22, borderRadius: 11, background: COLORS.teal, color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>{g.unread}</div>}
            </div>
            <div style={{ fontSize: 13, color: COLORS.muted, paddingLeft: 64 }}>{g.preview}</div>
          </div>
        ))}
        <div style={{ background: `linear-gradient(135deg, ${COLORS.peach}30, ${COLORS.teal}20)`, borderRadius: 18, padding: 20, textAlign: "center", border: `2px dashed ${COLORS.peach}` }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>✦</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Create a Group</div>
          <div style={{ fontSize: 13, color: COLORS.muted }}>Start a new conversation with multiple people</div>
        </div>
      </div>
    </div>
  );
}

function VibeTab() {
  const [selected, setSelected] = useState("Deep Talk");
  const vibes = [
    { name: "Chill", icon: "🌙", color: COLORS.teal },
    { name: "Hype", icon: "⚡", color: COLORS.peach },
    { name: "Deep Talk", icon: "✦", color: "#c8b8d4" },
    { name: "Gamers", icon: "🎮", color: "#b8d4d0" },
  ];
  const live = [
    { name: "Philosophy & Chai", desc: "Discussing existence over tea...", members: 12, tag: "ACTIVE NOW", icon: "☕" },
    { name: "Comparoo Dev Chat", desc: "Sprint planning and good vibes", members: 5, tag: "MATCHES YOU", icon: "🚀" },
    { name: "Portfolio Crew", desc: "Sharing work, getting feedback", members: 8, tag: "2KM AWAY", icon: "🎨" },
  ];
  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "20px 20px 100px", background: COLORS.bg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.tealDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>💬</div>
        <span style={{ fontWeight: 800, fontSize: 20 }}>ChatFlow</span>
      </div>
      <div style={{ fontSize: 10, color: COLORS.teal, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>DISCOVERY ENGINE</div>
      <h1 style={{ fontWeight: 900, fontSize: 32, marginBottom: 2 }}>Find your</h1>
      <h1 style={{ fontWeight: 900, fontSize: 32, color: COLORS.tealDark, marginBottom: 24 }}>perfect vibe.</h1>

      <div style={{ background: COLORS.card, borderRadius: 24, padding: 20, marginBottom: 24, boxShadow: `0 4px 20px ${COLORS.peach}30`, border: `1px solid ${COLORS.peach}20`, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: 100, height: 100, borderRadius: "50%", background: `radial-gradient(circle, ${COLORS.peach}, ${COLORS.peachDark})`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", boxShadow: `0 8px 30px ${COLORS.peach}60`, cursor: "grab" }}>
            <span style={{ fontSize: 24 }}>✦</span>
            <span style={{ fontWeight: 700, fontSize: 13 }}>{selected}</span>
          </div>
        </div>
        <p style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6 }}>Drag to shift the collective mood. Our AI matches you with groups currently hitting the same frequency.</p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ fontWeight: 800, fontSize: 20 }}>Popular Frequencies</h3>
        <span style={{ fontSize: 12, color: COLORS.teal, fontWeight: 700, cursor: "pointer" }}>View All</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        {vibes.map(v => (
          <div key={v.name} className="vibe-card" onClick={() => setSelected(v.name)} style={{
            background: selected === v.name ? `${v.color}50` : `${v.color}20`,
            border: `1.5px solid ${v.color}${selected === v.name ? "90" : "40"}`,
            borderRadius: 18, padding: "18px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer", transition: "all 0.2s",
          }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: v.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: `0 4px 12px ${v.color}60` }}>{v.icon}</div>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{v.name}</span>
          </div>
        ))}
      </div>

      <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 12 }}>Live Connections</h3>
      {live.map((l, i) => (
        <div key={i} style={{ background: COLORS.card, borderRadius: 18, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", boxShadow: `0 2px 10px ${COLORS.peach}25`, border: `1px solid ${COLORS.peach}20` }}>
          <div style={{ width: 50, height: 50, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.tealDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{l.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{l.name}</div>
            <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 6 }}>{l.desc}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ fontSize: 10, background: `${COLORS.teal}25`, color: COLORS.tealDark, borderRadius: 6, padding: "2px 7px", fontWeight: 700 }}>{l.members} online</span>
              <span style={{ fontSize: 10, background: `${COLORS.peach}60`, color: COLORS.tealDark, borderRadius: 6, padding: "2px 7px", fontWeight: 700 }}>{l.tag}</span>
            </div>
          </div>
          <span style={{ fontSize: 20, color: COLORS.teal }}>→</span>
        </div>
      ))}
    </div>
  );
}

export default function ChatFlow() {
  const [screen, setScreen] = useState("chats");
  const [activeChat, setActiveChat] = useState(null);
  const [chatType, setChatType] = useState("direct");

  const openChat = (chat, type) => { setActiveChat(chat); setChatType(type); };
  const closeChat = () => setActiveChat(null);

  return (
    <>
      <style>{style}</style>
      <div style={{ maxWidth: 420, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: COLORS.bg, boxShadow: "0 0 60px rgba(0,0,0,0.15)" }}>
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {activeChat ? (
            <ChatScreen chat={activeChat} onBack={closeChat} isGroup={chatType === "groups"} isAnon={chatType === "anon"} />
          ) : (
            <>
              {screen === "chats" && <ChatsTab onSelect={openChat} />}
              {screen === "groups" && <GroupsTab onSelect={openChat} />}
              {screen === "vibe" && <VibeTab />}
            </>
          )}
        </div>

        {!activeChat && (
          <div style={{ background: COLORS.card, borderTop: `1px solid ${COLORS.peach}30`, padding: "8px 0 14px", display: "flex", justifyContent: "space-around", boxShadow: `0 -4px 20px ${COLORS.peach}30`, flexShrink: 0 }}>
            {[
              { id: "chats", label: "CHATS", icon: "💬" },
              { id: "groups", label: "GROUPS", icon: "👥" },
              { id: "vibe", label: "VIBE", icon: "✦" },
            ].map(n => (
              <button key={n.id} className="nav-btn" onClick={() => setScreen(n.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: screen === n.id ? COLORS.peach : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: screen === n.id ? `0 4px 12px ${COLORS.peach}60` : "none" }}>{n.icon}</div>
                <span style={{ fontSize: 9, fontWeight: 800, color: screen === n.id ? COLORS.teal : COLORS.muted, letterSpacing: 1 }}>{n.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
