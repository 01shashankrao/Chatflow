import { COLORS, GROUPS } from './constants.js';

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

export default GroupsTab;