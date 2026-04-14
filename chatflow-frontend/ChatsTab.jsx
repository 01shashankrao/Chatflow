import { useState, useEffect } from "react";
import { COLORS, style, DIRECT } from './constants.js';
import ChatScreen from './ChatScreen.jsx';
import Avatar from './Avatar.jsx';
import { API } from './api.js';

export default function ChatsTab({ onSelect, token }) {
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (token) {
      API.getChats(token)
        .then(data => { if (data.success) setChats(data.chats || []); })
        .catch(() => {});
    }
  }, [token]);

  const displayChats = token && chats.length > 0 
    ? chats.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()))
    : DIRECT.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

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
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 20px" }}>
        {displayChats.map(chat => (
          <div key={chat._id || chat.id} className="chat-item" onClick={() => onSelect(chat, "direct")} style={{
            background: COLORS.card, borderRadius: 18, padding: "14px 16px", marginBottom: 10,
            display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
            boxShadow: `0 2px 10px ${COLORS.peach}25`, border: `1px solid ${COLORS.peach}20`, transition: "all 0.15s",
          }}>
            <Avatar name={chat.name || chat.username} size={50} online={chat.isOnline} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{chat.name || chat.username}</span>
                <span style={{ fontSize: 11, color: COLORS.muted, fontWeight: 500 }}>{chat.lastMessageTime || ""}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: COLORS.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{chat.lastMessage || "Start a conversation"}</span>
                {chat.unreadCount > 0 && <div style={{ minWidth: 20, height: 20, borderRadius: 10, background: COLORS.teal, color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>{chat.unreadCount}</div>}
              </div>
            </div>
          </div>
        ))}
        {!token && displayChats.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: COLORS.muted }}>
            <p>Login to see your conversations</p>
          </div>
        )}
      </div>
    </div>
  );
}
