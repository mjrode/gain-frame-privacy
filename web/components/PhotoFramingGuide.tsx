/** Shown only for insufficient visual evidence, never for safety rejections. */
export default function PhotoFramingGuide() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, maxWidth: 440, margin: "20px auto", textAlign: "left" }}>
      <svg viewBox="0 0 90 120" width="90" height="120" role="img" aria-label="Framing example: one person facing forward, shoulders through thighs visible" style={{ flexShrink: 0 }}>
        <rect x="3" y="3" width="84" height="114" rx="10" fill="#f0f5f2" stroke="#527769" strokeDasharray="4 4" />
        <circle cx="45" cy="21" r="10" fill="#527769" />
        <path d="M29 39 Q45 31 61 39 L67 72 L59 74 L55 50 L56 80 L60 110 H48 L45 83 L42 110 H30 L34 80 L35 50 L31 74 L23 72 Z" fill="#527769" />
      </svg>
      <div>
        <strong>Make your outline easy to see</strong>
        <p>Face the camera with your shoulders, waist and upper thighs in frame. Keep your arms slightly away from your sides, use even front lighting, and wear fitted workout clothing. Include only yourself.</p>
      </div>
    </div>
  );
}
