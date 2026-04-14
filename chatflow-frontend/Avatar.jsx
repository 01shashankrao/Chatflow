import { COLORS } from './constants.js';

const Avatar = ({ name, size = 44, online = false, anon = false }) => {
  const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const palette = [COLORS.peach, COLORS.teal, "#c8b8d4", "#b8c8d4", "#d4c8b8"];
  const idx = name ? name.charCodeAt(0) % palette.length : 0;
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        background: anon ? "linear-gradient(135deg, #2d2420, #799A99)" : palette[idx],
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "sans-serif", fontWeight: 700,
        fontSize: size * 0.35, color: anon ? "#fff" : COLORS.text,
        border: `2px solid ${COLORS.card}`,
      }}>
        {anon ? "?" : initials}
      </div>
      {online && <div style={{ position: "absolute", bottom: 2, right: 2, width: 10, height: 10, borderRadius: "50%", background: COLORS.online, border: `2px solid ${COLORS.card}` }} />}
    </div>
  );
};

export default Avatar;