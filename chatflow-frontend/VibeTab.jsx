import { useState } from "react";
import { COLORS } from './constants.js';

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

export default VibeTab;