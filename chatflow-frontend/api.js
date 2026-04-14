const API_BASE = "https://chatflow-backend-s4wm.onrender.com";

export const API = {
  register: (data) => fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(r => r.json()),

  login: (data) => fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(r => r.json()),

  getChats: (token) => fetch(`${API_BASE}/api/chats`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(r => r.json()),

  getMessages: (chatId, token) => fetch(`${API_BASE}/api/messages/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(r => r.json()),

  sendMessage: (chatId, text, token) => fetch(`${API_BASE}/api/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ chatId, text }),
  }).then(r => r.json()),

  createChat: (userId, token) => fetch(`${API_BASE}/api/chats`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userId }),
  }).then(r => r.json()),
};
