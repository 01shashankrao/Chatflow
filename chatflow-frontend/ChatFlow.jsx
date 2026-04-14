import { useState } from "react";
import { COLORS, style } from './constants.js';
import ChatScreen from './ChatScreen.jsx';
import ChatsTab from './ChatsTab.jsx';
import GroupsTab from './GroupsTab.jsx';
import VibeTab from './VibeTab.jsx';

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