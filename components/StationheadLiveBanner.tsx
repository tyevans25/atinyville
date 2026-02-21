// ============================================================
// StationheadLiveBanner.tsx
// ============================================================
"use client"
import { Radio } from "lucide-react"

export function StationheadLiveBanner() {
  return (
    <div style={{
      background: "rgba(239,68,68,0.08)",
      border: "1px solid rgba(239,68,68,0.25)",
      borderRadius: 12,
      padding: "14px 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Pulsing dot */}
        <div style={{ position: "relative", width: 10, height: 10, flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#ef4444", opacity: 0.4, animation: "livePulse 1.5s ease-in-out infinite" }} />
          <div style={{ position: "absolute", inset: 2, borderRadius: "50%", background: "#ef4444" }} />
        </div>
        <div>
          <p style={{ color: "white", fontWeight: 700, fontSize: 14, margin: 0 }}>🎉 Stationhead Party LIVE NOW!</p>
          <p style={{ color: "#8b949e", fontSize: 12, margin: 0 }}>Join fellow ATINYs streaming together</p>
        </div>
      </div>
      <a href="/stationhead" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "#ef4444", border: "none", borderRadius: 8,
          color: "white", fontWeight: 700, fontSize: 13,
          padding: "8px 16px", cursor: "pointer",
        }}>
          <Radio style={{ width: 14, height: 14 }} />
          Join Party
        </button>
      </a>
      <style>{`@keyframes livePulse { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(2.2);opacity:0} }`}</style>
    </div>
  )
}
export default StationheadLiveBanner


// ============================================================
// StreamingGuideButton.tsx
// ============================================================