"use client"

import { useState, useEffect } from "react"
import { TrendingUp } from "lucide-react"
import Navigation from "@/components/Navigation"
import StatsFmCard from "@/components/StatsFmCard"
import DailyMissions from "@/components/DailyMissions"
import DailyGoalCard from "@/components/DailyGoalCard"
import WeeklyGoalCard from "@/components/WeeklyGoalCard"
import CronCountdown from "@/components/CronCountdown"
import { useUser } from "@clerk/nextjs"
import RecentTracksCard from "@/components/RecentTracksCard"
import StreamingGuideButton from '@/components/StreamingGuide'
import StationheadLiveBanner from '@/components/StationheadLiveBanner'
import CommunityPlaylists from '@/components/CommunityPlaylists'
import CompactRefreshButton from "@/components/ManualRefreshButton"
import { Sparkles } from "lucide-react"

/* ── shared card style ── */
const card: React.CSSProperties = {
  background: "rgba(22,32,56,0.85)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  overflow: "hidden",
}

export default function StreamingHub() {
  const { isSignedIn } = useUser()
  const [stationheadLive, setStationheadLive] = useState(false)
  const [todayStreams, setTodayStreams] = useState<number | null>(null)
  const [goalStreams, setGoalStreams]   = useState<number | null>(null)
  const [loading, setLoading]          = useState(true)

  useEffect(() => { setStationheadLive(Math.random() > 0.7) }, [])

  useEffect(() => {
    if (isSignedIn) fetchTodayStreams()
    else setLoading(false)
  }, [isSignedIn])

  const fetchTodayStreams = async () => {
    try {
      const res = await fetch("/api/user-streams")
      if (res.ok) {
        const data = await res.json()
        setTodayStreams(data.totalStreams ?? 0)
        setGoalStreams(data.goalStreams ?? 0)
      }
    } catch { setTodayStreams(null); setGoalStreams(null) }
    finally { setLoading(false) }
  }

  return (
    <>
      <Navigation />
      <div style={{ background: "#0d1117", minHeight: "100vh" }}>

        {/* Background atmosphere */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "8%", left: "20%", width: 600, height: 600, borderRadius: "50%", background: "rgba(31,111,235,0.04)", filter: "blur(120px)" }} />
          <div style={{ position: "absolute", bottom: "15%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "rgba(88,166,255,0.03)", filter: "blur(100px)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", padding: "88px 24px 56px" }}>

          {/* Page header */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 style={{ color: "white", fontWeight: 900, fontSize: 36, margin: "0 0 8px", letterSpacing: "-0.01em" }}>
              Streaming Hub
            </h1>
            <p style={{ color: "#8b949e", fontSize: 14, margin: 0 }}>
              Complete missions, track goals, and stream with ATINYs!
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Your streams today */}
            {isSignedIn && (
              <div style={card}>
                <div style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(88,166,255,0.12)", border: "1px solid rgba(88,166,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <TrendingUp style={{ width: 18, height: 18, color: "#58a6ff" }} />
                    </div>
                    <div>
                      <p style={{ color: "white", fontWeight: 700, fontSize: 14, margin: 0 }}>Your ATEEZ Streams Today</p>
                      <p style={{ color: "#8b949e", fontSize: 12, margin: 0 }}>Keep streaming to reach today's goal!</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                    {loading ? (
                      <span style={{ color: "#484f58", fontSize: 13 }}>Loading...</span>
                    ) : todayStreams !== null ? (
                      <>
                        <div style={{ textAlign: "center" }}>
                          <p style={{ color: "#58a6ff", fontWeight: 900, fontSize: 28, margin: 0, lineHeight: 1 }}>{todayStreams}</p>
                          <p style={{ color: "#484f58", fontSize: 10, margin: "3px 0 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total ATEEZ</p>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <p style={{ color: "#22c55e", fontWeight: 900, fontSize: 28, margin: 0, lineHeight: 1 }}>{goalStreams}</p>
                          <p style={{ color: "#484f58", fontSize: 10, margin: "3px 0 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>Daily Goal Song</p>
                        </div>
                        <CompactRefreshButton />
                      </>
                    ) : (
                      <button
                        style={{ background: "#e6edf3", color: "#0d1117", fontWeight: 700, fontSize: 13, borderRadius: 8, padding: "8px 18px", border: "none", cursor: "pointer" }}
                        onClick={() => document.querySelector('[data-statsfm-card]')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        Link stats.fm
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stationhead live banner */}
            <StationheadLiveBanner />

            {/* stats.fm */}
            <div data-statsfm-card style={card}>
              <StatsFmCard />
            </div>

            {/* Community goals */}
            <div>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                <div>
                  <h2 style={{ color: "white", fontWeight: 800, fontSize: 20, margin: "0 0 4px" }}>Community Goals</h2>
                  <p style={{ color: "#8b949e", fontSize: 12, margin: 0 }}>Combined streams from everyone in the community.</p>
                </div>
                <CronCountdown />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div style={card}><DailyGoalCard /></div>
                <div style={card}><WeeklyGoalCard /></div>
              </div>
            </div>

            {/* Daily missions */}
            <div>
              <h2 style={{ color: "white", fontWeight: 800, fontSize: 20, margin: "0 0 4px" }}>Your Daily Missions</h2>
              <p style={{ color: "#8b949e", fontSize: 12, margin: "0 0 12px" }}>Personal streaming goals just for you!</p>
              <div style={card}><DailyMissions /></div>
            </div>

            {/* Recently played */}
            <div>
              <h2 style={{ color: "white", fontWeight: 800, fontSize: 20, margin: "0 0 4px" }}>Recent Tracks</h2>
              <p style={{ color: "#8b949e", fontSize: 12, margin: "0 0 12px" }}>Updated based on stats.fm · Goals refresh hourly</p>
              <div style={card}><RecentTracksCard /></div>
            </div>

            {/* Community playlists */}
            <div style={card}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.02)" }}>
                <Sparkles style={{ width: 16, height: 16, color: "#58a6ff" }} />
                <span style={{ color: "#e6edf3", fontWeight: 700, fontSize: 14 }}>ATINYTOWN Streaming Playlists</span>
              </div>
              <div style={{ padding: "16px 20px" }}>
                <p style={{ color: "#8b949e", fontSize: 12, marginBottom: 16 }}>Curated ATEEZ playlists optimized for streaming by ATINYs</p>
                <CommunityPlaylists />
              </div>
            </div>

            {/* Streaming guide */}
            <StreamingGuideButton />

          </div>
        </div>
      </div>
    </>
  )
}