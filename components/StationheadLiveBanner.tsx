// ============================================================
// StationheadLiveBanner.tsx
// ============================================================
"use client"
import { useState, useEffect } from "react"
import { Radio } from "lucide-react"
import StationheadModal from "./StationheadModal"

interface Station {
  username: string
  displayName: string
  description: string
  isLive: boolean
}

export function StationheadLiveBanner() {
  const [stations, setStations] = useState<Station[]>([])
  const [isLive, setIsLive] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/stationhead-live")
      if (res.ok) {
        const data = await res.json()
        setStations(data.stations || [])
        setIsLive(data.isLive || false)
      }
    } catch {}
  }

  return (
    <>
      <div className="sh-banner" style={{
        background: isLive ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${isLive ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 12,
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Dot */}
          <div style={{ position: "relative", width: 10, height: 10, flexShrink: 0 }}>
            {isLive ? (
              <>
                <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#ef4444", opacity: 0.4, animation: "livePulse 1.5s ease-in-out infinite" }} />
                <div style={{ position: "absolute", inset: 2, borderRadius: "50%", background: "#ef4444" }} />
              </>
            ) : (
              <div style={{ position: "absolute", inset: 2, borderRadius: "50%", background: "#484f58" }} />
            )}
          </div>
          <div>
            <p style={{ color: "white", fontWeight: 700, fontSize: 14, margin: 0 }}>
              {isLive ? "🎉 Stationhead Party LIVE NOW!" : "🎙️ Stationhead Stations"}
            </p>
            <p style={{ color: "#8b949e", fontSize: 12, margin: 0 }}>
              {isLive ? "Join fellow ATINYs streaming together" : "No live stations right now — check back soon!"}
            </p>
          </div>
        </div>
        <button
          className="sh-banner-btn"
          onClick={() => setShowModal(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: isLive ? "#ef4444" : "rgba(255,255,255,0.08)",
            border: "none", borderRadius: 8, color: "white",
            fontWeight: 700, fontSize: 13, padding: "8px 16px",
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          <Radio style={{ width: 14, height: 14 }} />
          {isLive ? "Join Party" : "View Stations"}
        </button>
        <style>{`@keyframes livePulse { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(2.2);opacity:0} }`}</style>
      </div>

      {showModal && stations.length > 0 && (
        <StationheadModal stations={stations} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
export default StationheadLiveBanner


// ============================================================
// StreamingGuideButton.tsx
// ============================================================