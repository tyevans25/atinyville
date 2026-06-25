"use client"

import { useState, useEffect } from "react"
import { Star, StarOff, Music, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

interface Song {
  trackId: number
  trackName: string
  variantCount: number
  titleTrack?: boolean
}

export default function AdminCatalog() {
  const router = useRouter()
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<number | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => { fetchCatalog() }, [])

  const fetchCatalog = async () => {
    try {
      const res = await fetch("/api/song-catalog")
      if (res.ok) {
        const data = await res.json()
        setSongs(data.songs || [])
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const toggleTitleTrack = async (song: Song) => {
    setToggling(song.trackId)
    try {
      const res = await fetch("/api/song-catalog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackId: song.trackId, titleTrack: !song.titleTrack }),
      })
      if (res.ok) {
        setSongs(prev => prev.map(s => s.trackId === song.trackId ? { ...s, titleTrack: !s.titleTrack } : s))
      }
    } catch (e) { console.error(e) }
    finally { setToggling(null) }
  }

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" })
    router.push("/admin/login")
    router.refresh()
  }

  const titleTracks = songs.filter(s => s.titleTrack)
  const filtered = songs.filter(s => s.trackName.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", padding: "32px 20px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ color: "#e6edf3", fontWeight: 800, fontSize: 22, margin: 0 }}>Song Catalog</h1>
            <p style={{ color: "#8b949e", fontSize: 13, marginTop: 4 }}>
              Mark title tracks for mission rotation. {titleTracks.length} title track{titleTracks.length !== 1 ? "s" : ""} selected.
            </p>
          </div>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#8b949e", fontSize: 12, padding: "7px 12px", cursor: "pointer" }}>
            <LogOut style={{ width: 13, height: 13 }} /> Logout
          </button>
        </div>

        {/* Title tracks summary */}
        {titleTracks.length > 0 && (
          <div style={{ background: "rgba(88,166,255,0.06)", border: "1px solid rgba(88,166,255,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
            <p style={{ color: "#58a6ff", fontWeight: 700, fontSize: 12, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              ★ Title Tracks ({titleTracks.length}) — rotating in pairs every 2 days
            </p>
            <p style={{ color: "#8b949e", fontSize: 12, margin: 0 }}>
              {titleTracks.map(s => s.trackName).join(" · ")}
            </p>
          </div>
        )}

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search songs..."
          style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, padding: "10px 14px", color: "white", fontSize: 13, outline: "none", marginBottom: 14, boxSizing: "border-box" }}
        />

        {/* Song list */}
        {loading ? (
          <p style={{ color: "#484f58", textAlign: "center", padding: 40 }}>Loading catalog...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "#484f58", textAlign: "center", padding: 40 }}>No songs found</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map(song => (
              <div key={song.trackId} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: song.titleTrack ? "rgba(88,166,255,0.06)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${song.titleTrack ? "rgba(88,166,255,0.25)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 9, padding: "10px 14px",
              }}>
                <Music style={{ width: 14, height: 14, color: "#484f58", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: song.titleTrack ? "#58a6ff" : "#e6edf3", fontWeight: song.titleTrack ? 700 : 500, fontSize: 13, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {song.trackName}
                  </p>
                  {song.variantCount > 1 && (
                    <p style={{ color: "#484f58", fontSize: 11, margin: 0 }}>{song.variantCount} variants</p>
                  )}
                </div>
                <button
                  onClick={() => toggleTitleTrack(song)}
                  disabled={toggling === song.trackId}
                  style={{ display: "flex", alignItems: "center", gap: 5, background: song.titleTrack ? "rgba(88,166,255,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${song.titleTrack ? "rgba(88,166,255,0.3)" : "rgba(255,255,255,0.1)"}`, borderRadius: 6, color: song.titleTrack ? "#58a6ff" : "#8b949e", fontSize: 11, fontWeight: 600, padding: "5px 10px", cursor: "pointer", flexShrink: 0 }}
                >
                  {song.titleTrack
                    ? <><Star style={{ width: 11, height: 11 }} /> Title Track</>
                    : <><StarOff style={{ width: 11, height: 11 }} /> Set as Title</>
                  }
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Nav links */}
        <div style={{ display: "flex", gap: 10, marginTop: 28, flexWrap: "wrap" }}>
          {[["Cron", "/admin/cron"], ["Goal", "/admin/goal"], ["Missions", "/admin/missions"], ["Community Goals", "/admin/community-goals"]].map(([label, href]) => (
            <a key={href} href={href} style={{ color: "#8b949e", fontSize: 12, textDecoration: "none", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 12px" }}>
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
