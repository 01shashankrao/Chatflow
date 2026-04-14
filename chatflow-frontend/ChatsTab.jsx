import { useState, useEffect } from "react";
import { COLORS, DIRECT } from './constants.js';
import Avatar from './Avatar.jsx';
import { API } from './api.js';

export default function ChatsTab({ onSelect, token }) {
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("direct");

  useEffect(() => {
    if (token) {
      API.getChats(token)
        .then(data => { 
          if (data.success) {
            setChats(data.chats.map(c => ({
              ...c,
              id: c._id,
              name: c.participants?.find(p => p._id !== token)?.username || c.name,
              isOnline: c.participants?.some(p => p.isOnline && p._id !== token),
              lastMessage: c.lastMessage?.content || "",
              unreadCount: 0,
            })));
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const allItems = [...chats, ...DIRECT].filter(c => c.name || c.username);
  const filteredItems = allItems.filter(c => (c.name || c.username || "").toLowerCase().includes(search.toLowerCase()));

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

        {token && (
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
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 20px" }}>
        {!token && filteredItems.map(chat => (
          <div key={chat.id || chat._id} className="chat-item" onClick={() => onSelect(chat, tab)} style={{
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

        {token && filteredItems.map(chat => (
          <div key={chat._id || chat.id} className="chat-item" onClick={() => onSelect(chat, "direct")} style={{
            background: COLORS.card, borderRadius: 18, padding: "14px 16px", marginBottom: 10,
            display: "flex", alignItems: "center", gap: 14, cursor: "pointer",
            boxShadow: `0 2px 10px ${COLORS.peach}25`, border: `1px solid ${COLORS.peach}20`, transition: "all 0.15s",
          }}>
            <Avatar name={chat.name || chat.username} size={50} online={chat.isOnline} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{chat.name || chat.username}</span>
                {chat.lastMessageTime && <span style={{ fontSize: 11, color: COLORS.muted, fontWeight: 500 }}>{new Date(chat.lastActivity).toLocaleDateString()}</span>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: COLORS.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{chat.lastMessage || "Start a conversation"}</span>
                {chat.unreadCount > 0 && <div style={{ minWidth: 20, height: 20, borderRadius: 10, background: COLORS.teal, color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>{chat.unreadCount}</div>}
              </div>
            </div>
          </div>
        ))}

        {token && filteredItems.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: COLORS.muted }}>
            <p>No conversations yet</p>
            <p style={{ fontSize: 13, marginTop: 8 }}>Click "New Chat" to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
