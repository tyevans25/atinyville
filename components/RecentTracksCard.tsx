"use client"

import { useState, useEffect } from "react"
import { Music, Clock } from "lucide-react"
import { useUser } from "@clerk/nextjs"

interface Stream {
  trackId: number
  trackName: string
  albumId: number
  endTime: string
  playedMs: number
}

interface StreamData {
  recentStreams?: Stream[]
  username?: string
}

export default function RecentTracksCard() {
  const { isSignedIn } = useUser()
  const [streamData, setStreamData] = useState<StreamData | null>(null)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (isSignedIn) {
      fetchStreams()
      const interval = setInterval(fetchStreams, 5 * 60 * 1000)
      return () => clearInterval(interval)
    } else {
      setLoading(false)
    }
  }, [isSignedIn])

  const fetchStreams = async () => {
    try {
      const res = await fetch("/api/recent-tracks")
      if (res.ok) setStreamData(await res.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const fmt = (iso: string) => {
    const d = new Date(iso)
    return {
      date: d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    }
  }

  const header = (
    <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", flexWrap: "wrap", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Music style={{ width: 15, height: 15, color: "#58a6ff" }} />
        <span style={{ color: "#e6edf3", fontWeight: 700, fontSize: 14 }}>Recent Tracks</span>
      </div>
      {streamData?.recentStreams && (
        <span style={{ color: "#484f58", fontSize: 11 }}>{streamData.recentStreams.length} recent ATEEZ streams</span>
      )}
    </div>
  )

  if (!isSignedIn) return (
    <div>{header}<div style={{ padding: 20, textAlign: "center" }}><p style={{ color: "#484f58", fontSize: 13 }}>Sign in to see your recent ATEEZ streams</p></div></div>
  )
  if (loading) return (
    <div>{header}<div style={{ padding: 20 }}><p style={{ color: "#484f58", fontSize: 13 }}>Loading your streams...</p></div></div>
  )
  if (!streamData?.recentStreams?.length) return (
    <div>
      {header}
      <div style={{ padding: "32px 20px", textAlign: "center" }}>
        <Music style={{ width: 36, height: 36, color: "rgba(255,255,255,0.15)", margin: "0 auto 12px" }} />
        <p style={{ color: "#8b949e", fontSize: 13, margin: 0 }}>No ATEEZ streams found</p>
        <p style={{ color: "#484f58", fontSize: 11, marginTop: 4 }}>Start streaming to see your tracks here!</p>
      </div>
    </div>
  )

  return (
    <div>
      {header}
      <div style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 480, overflowY: "auto" }}>
          {streamData.recentStreams.map((s, i) => {
            const { date, time } = fmt(s.endTime)
            return (
              <div key={`${s.trackId}-${s.endTime}-${i}`} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 9, padding: "10px 12px",
              }}>
                {/* Album art */}
                <div style={{ width: 44, height: 44, borderRadius: 7, background: "rgba(255,255,255,0.06)", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img
                    src={`https://cdn.stats.fm/file/statsfm/images/albums/${s.albumId}/default`}
                    alt={s.trackName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                  />
                </div>
                {/* Track info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "white", fontWeight: 600, fontSize: 13, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.trackName}</p>
                  <p style={{ color: "#484f58", fontSize: 11, margin: 0 }}>ATEEZ</p>
                </div>
                {/* Time */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ color: "#8b949e", fontSize: 12, fontWeight: 500, margin: 0 }}>{date}</p>
                  <p style={{ color: "#484f58", fontSize: 11, margin: 0, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3 }}>
                    <Clock style={{ width: 10, height: 10 }} />{time}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {streamData.username && (
          <p style={{ color: "#484f58", fontSize: 11, textAlign: "center", marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            Synced from stats.fm • @{streamData.username}
          </p>
        )}
      </div>
    </div>
  )
}