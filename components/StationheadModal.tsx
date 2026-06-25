"use client"

import { X, Radio, Users } from "lucide-react"

interface Station {
  username: string
  displayName: string
  description: string
  isLive: boolean
  listenerCount: number
}

export function StationheadModal({ stations, onClose }: { stations: Station[]; onClose: () => void }) {
  const liveCount = stations.filter(s => s.isLive).length

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }} />

      {/* Modal */}
      <div
        style={{ position: "relative", background: "#161b22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, width: "100%", maxWidth: 480, padding: 24, maxHeight: "85vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Radio style={{ width: 18, height: 18, color: "#ef4444" }} />
            <h2 style={{ color: "white", fontWeight: 800, fontSize: 18, margin: 0 }}>Stationhead Stations</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#8b949e", padding: 4, display: "flex" }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <p style={{ color: "#8b949e", fontSize: 12, margin: "0 0 18px" }}>
          {liveCount > 0
            ? `${liveCount} station${liveCount > 1 ? "s" : ""} live now — join fellow ATINYs streaming together!`
            : "No stations are live right now. Check back soon!"}
        </p>

        {/* Station list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {stations.map(station => (
            <div
              key={station.username}
              style={{
                background: station.isLive ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${station.isLive ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 12,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                {/* Live indicator dot */}
                <div style={{ position: "relative", width: 10, height: 10, flexShrink: 0 }}>
                  {station.isLive ? (
                    <>
                      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#22c55e", opacity: 0.4, animation: "shPulse 1.5s ease-in-out infinite" }} />
                      <div style={{ position: "absolute", inset: 2, borderRadius: "50%", background: "#22c55e" }} />
                    </>
                  ) : (
                    <div style={{ position: "absolute", inset: 2, borderRadius: "50%", background: "#484f58" }} />
                  )}
                </div>

                <div style={{ minWidth: 0 }}>
                  <p style={{ color: "white", fontWeight: 700, fontSize: 14, margin: 0 }}>{station.displayName}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                    {station.isLive ? (
                      <>
                        <span style={{ background: "#22c55e", color: "white", fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 4, letterSpacing: "0.06em" }}>LIVE</span>
                        <span style={{ color: "#8b949e", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}>
                          <Users style={{ width: 10, height: 10 }} />
                          {station.listenerCount.toLocaleString()} listening
                        </span>
                      </>
                    ) : (
                      <span style={{ color: "#484f58", fontSize: 11 }}>Offline</span>
                    )}
                  </div>
                  <p style={{ color: "#484f58", fontSize: 11, margin: "4px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {station.description}
                  </p>
                </div>
              </div>

              <a
                href={`https://stationhead.com/${station.username}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", flexShrink: 0 }}
              >
                <button
                  style={{
                    background: station.isLive ? "#ef4444" : "rgba(255,255,255,0.08)",
                    border: "none",
                    borderRadius: 8,
                    color: "white",
                    fontWeight: 700,
                    fontSize: 12,
                    padding: "7px 16px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {station.isLive ? "Join" : "Visit"}
                </button>
              </a>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes shPulse { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(2.2);opacity:0} }`}</style>
    </div>
  )
}

export default StationheadModal
