"use client"

import { useState, useEffect } from "react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Youtube, TrendingUp, Clock, BarChart2 } from "lucide-react"

interface FocusMVEntry { t: string; v: number }
interface FocusMV {
  videoId: string
  title: string
  thumbnail: string
  channelTitle: string
  setAt: string
}

function formatViews(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function buildChartData(history: FocusMVEntry[]) {
  if (history.length < 2) return []
  return history.slice(1).map((entry, i) => {
    const prev = history[i]
    const delta = Math.max(entry.v - prev.v, 0)
    // Parse as UTC then display in browser local time
    const local = new Date(`${entry.t}:00:00Z`)
    const hour = local.getHours().toString().padStart(2, '0')
    const month = (local.getMonth() + 1).toString().padStart(2, '0')
    const day = local.getDate().toString().padStart(2, '0')
    return { label: `${month}-${day} ${hour}:00`, delta, views: entry.v }
  })
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: "#161b22", border: "1px solid rgba(88,166,255,0.2)", borderRadius: 8, padding: "8px 12px", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>
      <p style={{ color: "#8b949e", fontSize: 11, margin: "0 0 4px" }}>{label}</p>
      <p style={{ color: "#60a5fa", fontWeight: 700, fontSize: 13, margin: 0 }}>
        +{payload[0]?.value?.toLocaleString()} views/hr
      </p>
      <p style={{ color: "#484f58", fontSize: 11, margin: "2px 0 0" }}>
        {formatViews(payload[0]?.payload?.views)} total
      </p>
    </div>
  )
}

export default function FocusMVCard() {
  const [focus, setFocus] = useState<FocusMV | null>(null)
  const [history, setHistory] = useState<FocusMVEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<24 | 48 | 168>(24)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch("/api/focus-mv")
      if (res.ok) {
        const data = await res.json()
        setFocus(data.focus)
        setHistory(data.history || [])
      }
    } catch {}
    finally { setLoading(false) }
  }

  if (loading || !focus) return null

  const slicedHistory = history.slice(-range)
  const chartData = buildChartData(slicedHistory)
  const currentViews = history.at(-1)?.v ?? 0
  const firstViews = slicedHistory[0]?.v ?? currentViews
  const gained = currentViews - firstViews
  const peakHour = chartData.length ? Math.max(...chartData.map(d => d.delta)) : 0
  const latestDelta = chartData.at(-1)?.delta ?? 0
  const hasChart = chartData.length >= 1

  return (
    <div style={{
      borderRadius: 14,
      border: "1px solid rgba(88,166,255,0.15)",
      background: "rgba(13,17,23,0.98)",
      overflow: "hidden",
    }}>
      {/* accent line */}
      <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #ef4444 20%, #ff6b6b 50%, #ef4444 80%, transparent)" }} />

      {/* Header */}
      <div style={{
        padding: "12px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <TrendingUp style={{ width: 14, height: 14, color: "#ef4444" }} />
        <span style={{ color: "#e6edf3", fontWeight: 700, fontSize: 14 }}>
          Comeback Music Video Stats
          {focus.title.match(/['\u2018\u2019]([^'\u2018\u2019]+)['\u2018\u2019]/)?.[1] && (
            <span style={{ color: "#8b949e", fontWeight: 500 }}>
              {" : "}
              <span style={{ color: "#60a5fa", fontWeight: 700 }}>
                {focus.title.match(/['\u2018\u2019]([^'\u2018\u2019]+)['\u2018\u2019]/)?.[1]}
              </span>
            </span>
          )}
        </span>
        <span style={{
          marginLeft: "auto",
          display: "flex", alignItems: "center", gap: 4,
          background: "rgba(239,68,68,0.1)", color: "#ef4444",
          fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, letterSpacing: "0.08em",
          border: "1px solid rgba(239,68,68,0.2)"
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ef4444", display: "inline-block", boxShadow: "0 0 6px #ef4444" }} />
          LIVE
        </span>
      </div>

      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Video embed + info */}
        <div className="fmv-row" style={{ display: "flex", gap: 20, alignItems: "stretch" }}>
          {/* Autoplaying muted embed with YouTube click-through overlay */}
          <div className="fmv-embed" style={{
            flexShrink: 0, position: "relative",
            width: 280, height: 158, borderRadius: 10, overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            background: "#000",
          }}>
            <iframe
              src={`https://www.youtube.com/embed/${focus.videoId}?autoplay=1&mute=1&loop=1&playlist=${focus.videoId}&controls=0&rel=0&modestbranding=1&playsinline=1`}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none", pointerEvents: "none" }}
              allow="autoplay; encrypted-media"
              allowFullScreen={false}
            />
            {/* Transparent overlay — captures clicks and opens YouTube */}
            <a
              href={`https://www.youtube.com/watch?v=${focus.videoId}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
                padding: 6, textDecoration: "none",
              }}
              title="Watch on YouTube"
            >
              <span style={{
                display: "flex", alignItems: "center", gap: 4,
                background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
                borderRadius: 5, padding: "3px 7px",
                color: "white", fontSize: 10, fontWeight: 700,
              }}>
                <Youtube style={{ width: 11, height: 11, color: "#ef4444" }} />
                YouTube
              </span>
            </a>
          </div>

          {/* Title + stats */}
          <div className="fmv-stats" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
            <div>
              <p style={{
                color: "#e6edf3", fontWeight: 800, fontSize: 15,
                margin: "0 0 3px",
                overflow: "hidden", textOverflow: "ellipsis",
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              }}>{focus.title}</p>
              <p style={{ color: "#484f58", fontSize: 11, margin: 0 }}>{focus.channelTitle}</p>
            </div>

            {/* Stat pills */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {/* Total */}
              <div style={{
                background: "rgba(88,166,255,0.07)", border: "1px solid rgba(88,166,255,0.15)",
                borderRadius: 8, padding: "7px 12px", minWidth: 80,
              }}>
                <p style={{ color: "#484f58", fontSize: 9, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Views</p>
                <p style={{ color: "#e6edf3", fontWeight: 800, fontSize: 17, margin: 0, lineHeight: 1 }}>{formatViews(currentViews)}</p>
              </div>
              {/* Last hour */}
              <div style={{
                background: latestDelta > 0 ? "rgba(34,197,94,0.07)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${latestDelta > 0 ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 8, padding: "7px 12px", minWidth: 80,
              }}>
                <p style={{ color: "#484f58", fontSize: 9, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 3 }}>
                  <Clock style={{ width: 8, height: 8, display: "inline" }} /> Last Hour
                </p>
                <p style={{ color: latestDelta > 0 ? "#22c55e" : "#484f58", fontWeight: 800, fontSize: 17, margin: 0, lineHeight: 1 }}>
                  +{formatViews(latestDelta)}
                </p>
              </div>
              {/* Gained */}
              <div style={{
                background: "rgba(88,166,255,0.07)", border: "1px solid rgba(88,166,255,0.15)",
                borderRadius: 8, padding: "7px 12px", minWidth: 80,
              }}>
                <p style={{ color: "#484f58", fontSize: 9, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Gained ({range === 168 ? "7d" : `${range}h`})
                </p>
                <p style={{ color: "#60a5fa", fontWeight: 800, fontSize: 17, margin: 0, lineHeight: 1 }}>+{formatViews(gained)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />

        {/* Chart section */}
        {hasChart ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <BarChart2 style={{ width: 12, height: 12, color: "#484f58" }} />
                <span style={{ color: "#484f58", fontSize: 11 }}>
                  Views/hr — peak{" "}
                  <span style={{ color: "#60a5fa", fontWeight: 700 }}>+{formatViews(peakHour)}</span>
                </span>
              </div>
              <div style={{ display: "flex", gap: 3 }}>
                {([24, 48, 168] as const).map(r => (
                  <button key={r} onClick={() => setRange(r)} style={{
                    background: range === r ? "rgba(88,166,255,0.15)" : "transparent",
                    border: `1px solid ${range === r ? "rgba(88,166,255,0.35)" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 5, color: range === r ? "#60a5fa" : "#484f58",
                    fontSize: 10, fontWeight: 700, padding: "3px 8px",
                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  }}>{r === 168 ? "7d" : `${r}h`}</button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={110}>
              <AreaChart data={chartData} margin={{ top: 4, right: 2, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fill: "#484f58", fontSize: 9 }} tickLine={false} axisLine={false}
                  interval={Math.max(Math.floor(chartData.length / 6) - 1, 0)}
                  tickFormatter={v => v.slice(6, 11)} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="delta" stroke="#3b82f6" strokeWidth={1.5}
                  fill="url(#focusGrad)" dot={false}
                  activeDot={{ r: 4, fill: "#60a5fa", strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 8, padding: "18px 0",
            border: "1px dashed rgba(255,255,255,0.07)", borderRadius: 10,
          }}>
            <BarChart2 style={{ width: 22, height: 22, color: "#30363d" }} />
            <p style={{ color: "#484f58", fontSize: 12, margin: 0, fontWeight: 600 }}>Chart building…</p>
            <p style={{ color: "#30363d", fontSize: 11, margin: 0 }}>Updates every hour — check back soon</p>
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 640px) {
          .fmv-row { flex-direction: column !important; align-items: stretch !important; }
          .fmv-embed { width: 100% !important; height: 0 !important; padding-bottom: 56.25% !important; }
          .fmv-embed iframe { position: absolute; inset: 0; width: 100% !important; height: 100% !important; }
          .fmv-stats { align-items: center !important; text-align: center; }
          .fmv-stats p { text-align: center; }
          .fmv-stats > div:last-child { justify-content: center !important; }
        }
      `}</style>
    </div>
  )
}
