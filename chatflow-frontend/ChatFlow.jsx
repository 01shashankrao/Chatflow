import { useState, useEffect } from "react";
import { COLORS, style, DIRECT, GROUPS, ANON } from './constants.js';
import ChatScreen from './ChatScreen.jsx';
import ChatsTab from './ChatsTab.jsx';
import GroupsTab from './GroupsTab.jsx';
import VibeTab from './VibeTab.jsx';
import { API } from './api.js';

export default function ChatFlow() {
  const [screen, setScreen] = useState("chats");
  const [activeChat, setActiveChat] = useState(null);
  const [chatType, setChatType] = useState("direct");
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [showAuth, setShowAuth] = useState(!token);
  const [authMode, setAuthMode] = useState("login");
  const [authData, setAuthData] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (token) {
      API.getChats(token)
        .then(data => { if (data.success) setChats(data.chats || []); })
        .catch(() => {});
    }
  }, [token]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      const data = authMode === "login" 
        ? await API.login({ email: authData.email, password: authData.password })
        : await API.register({ username: authData.name, email: authData.email, password: authData.password });
      
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setShowAuth(false);
      } else {
        setAuthError(data.message || "Authentication failed");
      }
    } catch (err) {
      setAuthError("Connection error. Please try again.");
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowAuth(true);
  };

  const openChat = (chat, type) => { setActiveChat(chat); setChatType(type); };
  const closeChat = () => setActiveChat(null);

  if (showAuth) {
    return (
      <>
        <style>{style}</style>
        <div style={{ maxWidth: 420, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", background: COLORS.bg }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 20 }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: COLORS.teal, marginBottom: 30 }}>ChatFlow</h1>
            <div style={{ background: COLORS.card, padding: 30, borderRadius: 20, width: "100%", maxWidth: 350, boxShadow: `0 8px 30px ${COLORS.peach}40` }}>
              <h2 style={{ marginBottom: 20, color: COLORS.text }}>{authMode === "login" ? "Welcome Back" : "Create Account"}</h2>
              <form onSubmit={handleAuth}>
                {authMode === "register" && (
                  <input type="text" placeholder="Username" required value={authData.name} onChange={e => setAuthData(d => ({...d, name: e.target.value}))} style={{ width: "100%", padding: 12, marginBottom: 12, border: `1px solid ${COLORS.peach}40`, borderRadius: 10, fontSize: 14, outline: "none" }} />
                )}
                <input type="email" placeholder="Email" required value={authData.email} onChange={e => setAuthData(d => ({...d, email: e.target.value}))} style={{ width: "100%", padding: 12, marginBottom: 12, border: `1px solid ${COLORS.peach}40`, borderRadius: 10, fontSize: 14, outline: "none" }} />
                <input type="password" placeholder="Password" required value={authData.password} onChange={e => setAuthData(d => ({...d, password: e.target.value}))} style={{ width: "100%", padding: 12, marginBottom: 12, border: `1px solid ${COLORS.peach}40`, borderRadius: 10, fontSize: 14, outline: "none" }} />
                {authError && <p style={{ color: "red", fontSize: 12, marginBottom: 12 }}>{authError}</p>}
                <button type="submit" style={{ width: "100%", padding: 12, background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.tealDark})`, color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
                  {authMode === "login" ? "Login" : "Sign Up"}
                </button>
              </form>
              <p style={{ textAlign: "center", marginTop: 15, fontSize: 13, color: COLORS.muted }}>
                {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
                <span onClick={() => setAuthMode(authMode === "login" ? "register" : "login")} style={{ color: COLORS.teal, cursor: "pointer", fontWeight: 600 }}>{authMode === "login" ? "Sign Up" : "Login"}</span>
              </p>
              <p style={{ textAlign: "center", marginTop: 10, fontSize: 12, color: COLORS.muted }}>
                <span onClick={() => { setShowAuth(false); setToken("demo"); }} style={{ cursor: "pointer", color: COLORS.teal }}>Continue as Guest</span>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{style}</style>
      <div style={{ maxWidth: 420, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: COLORS.bg, boxShadow: "0 0 60px rgba(0,0,0,0.15)" }}>
        {!activeChat && (
          <div style={{ padding: "12px 16px", background: COLORS.card, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${COLORS.peach}30` }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.text }}>{user?.name || "Guest"}</div>
              <div style={{ fontSize: 11, color: COLORS.muted }}>Online</div>
            </div>
            <button onClick={logout} style={{ background: COLORS.peach, border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: COLORS.text }}>Logout</button>
          </div>
        )}
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          {activeChat ? (
            <ChatScreen chat={activeChat} onBack={closeChat} isGroup={chatType === "groups"} isAnon={chatType === "anon"} token={token} />
          ) : (
            <>
              {screen === "chats" && <ChatsTab onSelect={openChat} token={token} />}
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
