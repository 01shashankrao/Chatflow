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

  searchUsers: (query, token) => fetch(`${API_BASE}/api/users/search?q=${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(r => r.json()),

  createOrGetChat: (userId, token) => fetch(`${API_BASE}/api/chats/direct`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userId }),
  }).then(r => r.json()),

  getMessages: (chatId, token) => fetch(`${API_BASE}/api/chats/${chatId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(r => r.json()),

  sendMessage: (chatId, text, token, isGhost = false) => {
    const body = { content: text };
    if (isGhost) {
      body.disappearAfterSeconds = 8;
    }
    return fetch(`${API_BASE}/api/chats/${chatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }).then(r => r.json());
  },
};
