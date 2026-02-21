"use client"

import { useState, useEffect } from 'react'
import { TrendingUp, Eye, ExternalLink, Loader2, Flame } from 'lucide-react'

interface MVStats {
  videoId: string
  title: string
  album: string
  viewCount: number
  likeCount: number
  viewsGainedHour: number
  likesGainedHour: number
  thumbnail: string
  url: string
}

export default function MVTracker() {
  const [videos, setVideos] = useState<MVStats[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/youtube-tracker')
      if (response.ok) {
        const data = await response.json()
        setVideos(data.videos || [])
        setLastUpdated(data.lastUpdated)
      }
    } catch (error) {
      console.error('Error fetching MV stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  if (loading) {
    return (
      <div style={{ padding: 32, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <Loader2 style={{ width: 20, height: 20, color: "#58a6ff" }} className="animate-spin" />
        <span style={{ color: "#8b949e", fontSize: 13 }}>Loading MV stats...</span>
      </div>
    )
  }

  const topByViews = videos.slice(0, 5)
  const topByGrowth = videos
    .filter(v => v.viewsGainedHour > 0)
    .sort((a, b) => b.viewsGainedHour - a.viewsGainedHour)
    .slice(0, 5)

  const rankColor = (i: number) =>
    i === 0 ? '#FFD700' : i === 1 ? '#9ca3af' : i === 2 ? '#fb923c' : '#484f58'

  const trendIcon = (i: number) => i === 0 ? '🔥' : i === 1 ? '⚡' : '📈'

  const rowStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 10,
    background: "rgba(255,255,255,0.03)", borderRadius: 10,
    padding: "10px 12px", border: "1px solid rgba(255,255,255,0.06)",
    textDecoration: "none", transition: "background 0.15s",
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        padding: "13px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(255,255,255,0.02)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TrendingUp style={{ width: 15, height: 15, color: "#58a6ff", flexShrink: 0 }} />
          <span style={{ color: "#e6edf3", fontWeight: 700, fontSize: 14 }}>MV Performance Tracker</span>
          <span style={{ color: "#484f58", fontSize: 11 }}>· Updated hourly</span>
        </div>
        {lastUpdated && (
          <span style={{ color: "#484f58", fontSize: 11 }}>
            {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "16px 22px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>

          {/* Most Viewed */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Eye style={{ width: 13, height: 13, color: "#C084FC" }} />
              <span style={{ color: "#8b949e", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Most Viewed</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {topByViews.map((video, index) => (
                <a
                  key={video.videoId}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={rowStyle}
                  onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)"}
                  onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.03)"}
                >
                  <span style={{ fontSize: 13, fontWeight: 900, width: 18, textAlign: "center", flexShrink: 0, color: rankColor(index) }}>
                    {index + 1}
                  </span>
                  <img src={video.thumbnail} alt={video.title} style={{ width: 52, height: 30, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "#e6edf3", fontSize: 11, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{video.title}</p>
                    <p style={{ color: "#484f58", fontSize: 10, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{video.album}</p>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <p style={{ color: "#e6edf3", fontSize: 12, fontWeight: 700, margin: 0 }}>{formatNumber(video.viewCount)}</p>
                    <p style={{ color: "#484f58", fontSize: 9, margin: 0 }}>views</p>
                  </div>
                  <ExternalLink style={{ width: 11, height: 11, color: "#58a6ff", flexShrink: 0, opacity: 0.5 }} />
                </a>
              ))}
            </div>
          </div>

          {/* Trending Now */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <Flame style={{ width: 13, height: 13, color: "#fb923c" }} />
              <span style={{ color: "#8b949e", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Trending Now</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {topByGrowth.length > 0 ? (
                topByGrowth.map((video, index) => (
                  <a
                    key={video.videoId}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={rowStyle}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)"}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.03)"}
                  >
                    <span style={{ fontSize: 13, flexShrink: 0 }}>{trendIcon(index)}</span>
                    <img src={video.thumbnail} alt={video.title} style={{ width: 52, height: 30, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "#e6edf3", fontSize: 11, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{video.title}</p>
                      <p style={{ color: "#22c55e", fontSize: 10, fontWeight: 700, margin: "2px 0 0" }}>+{formatNumber(video.viewsGainedHour)}/hr</p>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      <p style={{ color: "#e6edf3", fontSize: 12, fontWeight: 700, margin: 0 }}>{formatNumber(video.viewCount)}</p>
                      <p style={{ color: "#484f58", fontSize: 9, margin: 0 }}>total</p>
                    </div>
                    <ExternalLink style={{ width: 11, height: 11, color: "#58a6ff", flexShrink: 0, opacity: 0.5 }} />
                  </a>
                ))
              ) : (
                <div style={{ color: "#484f58", fontSize: 13, textAlign: "center", padding: "32px 0" }}>
                  No trending data yet.<br />Check back in an hour!
                </div>
              )}
            </div>
          </div>
        </div>

        <p style={{ color: "#484f58", fontSize: 11, textAlign: "center", marginTop: 16 }}>
          Tracking {videos.length} ATEEZ music videos
        </p>
      </div>
    </div>
  )
}