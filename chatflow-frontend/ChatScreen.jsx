import { useState, useEffect, useRef } from "react";
import { COLORS, MOCK_MESSAGES } from './constants.js';
import Avatar from './Avatar.jsx';

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

export default ChatScreen;