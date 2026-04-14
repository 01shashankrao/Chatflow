import { useState, useEffect, useRef } from "react";
import { COLORS } from './constants.js';
import Avatar from './Avatar.jsx';
import { API } from './api.js';

function ChatScreen({ chat, onBack, isGroup, isAnon, token }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [ghostMode, setGhostMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => { 
    bottomRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [messages]);

  const loadMessages = () => {
    if (chat?._id && token) {
      setLoading(true);
      API.getMessages(chat._id, token)
        .then(data => { 
          if (data.success && data.messages) {
            setMessages(data.messages.map(m => ({
              ...m,
              text: m.content,
              from: m.sender === "me" || m.sender?._id === "me" ? "me" : (isGroup ? m.sender?.username : "them"),
            })));
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadMessages();
  }, [chat?._id, token]);

  const send = async () => {
    if (!input.trim()) return;
    
    const tempId = `temp_${Date.now()}`;
    const tempMsg = {
      _id: tempId,
      text: input,
      content: input,
      from: "me",
      sender: "me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      createdAt: new Date().toISOString(),
      ghost: ghostMode,
    };
    
    setMessages(m => [...m, tempMsg]);
    const textToSend = input;
    setInput("");
    
    if (token && chat?._id) {
      try {
        const data = await API.sendMessage(chat._id, textToSend, token, ghostMode);
        if (data.success) {
          setMessages(m => m.map(msg => 
            msg._id === tempId 
              ? { ...data.message, text: data.message.content, from: "me", time: new Date(data.message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
              : msg
          ));
        }
      } catch (err) {
        console.log("Message sent (offline mode)");
      }
    }
    
    if (ghostMode) {
      setTimeout(() => setMessages(m => m.filter(x => x._id !== tempId)), 8000);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: COLORS.bg }}>
      <div style={{ padding: "14px 16px", background: COLORS.card, display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${COLORS.peach}40`, boxShadow: `0 2px 12px ${COLORS.peach}30` }}>
        <button onClick={onBack} style={{ background: COLORS.peach, border: "none", borderRadius: 10, width: 36, height: 36, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
        <Avatar name={chat.name || chat.username || "User"} size={40} online={chat.isOnline} anon={isAnon} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 16 }}>{isAnon ? "👤 " : ""}{chat.name || chat.username || "User"}</div>
          <div style={{ fontSize: 11, color: COLORS.muted }}>{isGroup ? `${chat.members || 0} members` : chat.isOnline ? "🟢 online" : "offline"}</div>
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
        {loading && (
          <div style={{ textAlign: "center", color: COLORS.muted, padding: 20 }}>Loading messages...</div>
        )}
        {!loading && messages.length === 0 && (
          <div style={{ textAlign: "center", color: COLORS.muted, padding: 20 }}>
            Say hi! 👋
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={msg._id || idx} style={{ display: "flex", justifyContent: msg.from === "me" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end", opacity: msg.ghost ? 0.85 : 1, transition: "opacity 0.5s" }}>
            {msg.from !== "me" && <Avatar name={isAnon ? "?" : (isGroup ? msg.from : (chat.name || chat.username))} size={28} anon={isAnon} />}
            <div style={{ maxWidth: "72%" }}>
              {isGroup && msg.from !== "me" && <div style={{ fontSize: 10, color: COLORS.teal, fontWeight: 700, marginBottom: 3, paddingLeft: 4 }}>{msg.from}</div>}
              <div style={{
                background: msg.from === "me" ? `linear-gradient(135deg, ${COLORS.peach}, ${COLORS.peachDark})` : COLORS.card,
                borderRadius: msg.from === "me" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                padding: "10px 14px",
                boxShadow: `0 2px 8px ${COLORS.peach}40`,
                border: msg.from !== "me" ? `1px solid ${COLORS.peach}40` : "none",
              }}>
                <div style={{ fontSize: 14 }}>{msg.text || msg.content}</div>
                <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 4, textAlign: "right" }}>
                  {msg.ghost ? "💨 " : ""}{msg.time || new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
