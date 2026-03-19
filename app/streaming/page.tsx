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
import Image from "next/image"

/* ── shared card style ── */
const card: React.CSSProperties = {
  background: "rgba(22,32,56,0.85)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  overflow: "hidden",
}

interface EarnedCard {
  id: string
  memberName: string
  collectionName: string
  groupLabel: string
  cardNumber: number
  color: string
  secondColor: string
  imageUrl: string
}

function PhotocardEarnedModal({ card: earnedCard, onClaim }: { card: EarnedCard; onClaim: () => void }) {
  const [claiming, setClaiming] = useState(false)

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.92)", padding: 20 }}>
      <div style={{ position: "fixed", width: 500, height: 500, borderRadius: "50%", background: `${earnedCard.color}22`, filter: "blur(100px)", pointerEvents: "none" }} />
      <div style={{ zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center", maxWidth: 320 }}>
        <div style={{ animation: "fadeUp 0.4s ease both" }}>
          <p style={{ color: earnedCard.color, fontWeight: 800, fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 6px" }}>Missions Complete!</p>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "white", margin: 0, lineHeight: 1 }}>You Earned a Photocard! 🎴</h2>
          <p style={{ color: "#8b949e", fontSize: 13, margin: "8px 0 0" }}>Claim it to add it to your collection.</p>
        </div>

        <div style={{
          width: 200, aspectRatio: "2/3", borderRadius: 18, overflow: "hidden", position: "relative",
          border: `2px solid ${earnedCard.color}`,
          boxShadow: `0 0 60px ${earnedCard.color}55, 0 20px 80px rgba(0,0,0,0.8)`,
          animation: "cardSpinReveal 0.9s cubic-bezier(0.22,1,0.36,1) both",
        }}>
          <div style={{ height: 3, background: `linear-gradient(90deg,${earnedCard.color},${earnedCard.secondColor},${earnedCard.color})`, backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(125deg,rgba(255,0,128,.08),rgba(255,165,0,.08),rgba(255,255,0,.08),rgba(0,255,128,.08),rgba(0,128,255,.08),rgba(128,0,255,.08),rgba(255,0,128,.08))", backgroundSize: "400% 400%", animation: "holoShimmer 3s linear infinite", mixBlendMode: "screen", zIndex: 2, pointerEvents: "none" }} />
          {earnedCard.imageUrl.endsWith(".mp4") || earnedCard.imageUrl.endsWith(".webm") ? (
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 18 }}>
              <video autoPlay loop muted playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}>
                <source src={earnedCard.imageUrl} type="video/mp4" />
              </video>
            </div>
          ) : (
            <Image src={earnedCard.imageUrl} alt={earnedCard.memberName} fill style={{ objectFit: "cover", objectPosition: "top" }} sizes="200px" />
          )}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "linear-gradient(to top,rgba(0,0,0,0.9),transparent)", zIndex: 3 }} />
          <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center", zIndex: 4 }}>
            <p style={{ color: "white", fontWeight: 900, fontSize: 13, margin: 0 }}>{earnedCard.memberName}</p>
            <p style={{ color: `${earnedCard.color}cc`, fontSize: 9, margin: "2px 0 0" }}>{earnedCard.groupLabel} · {earnedCard.collectionName} · #{earnedCard.cardNumber}</p>
          </div>
        </div>

        <button
          onClick={async () => {
            setClaiming(true)
            await onClaim()
            setClaiming(false)
          }}
          disabled={claiming}
          style={{
            background: `linear-gradient(135deg,${earnedCard.color},${earnedCard.secondColor})`,
            border: "none", borderRadius: 12, padding: "14px 32px",
            color: "white", fontWeight: 800, fontSize: 14, cursor: claiming ? "not-allowed" : "pointer",
            fontFamily: "inherit", boxShadow: `0 4px 20px ${earnedCard.color}44`,
            opacity: claiming ? 0.7 : 1,
          }}
        >
          {claiming ? "Claiming..." : "Claim Card →"}
        </button>
      </div>
      <style>{`
        @keyframes cardSpinReveal {
          0%   { opacity: 0; transform: translateZ(0) rotateY(-180deg) scale(0.3); }
          65%  { opacity: 1; transform: translateZ(0) rotateY(8deg) scale(1.05); }
          100% { opacity: 1; transform: translateZ(0) rotateY(0deg) scale(1); }
        }
        @keyframes shimmer { 0%{background-position:0% 50%} 100%{background-position:200% 50%} }
        @keyframes holoShimmer { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}

export default function StreamingHub() {
  const { isSignedIn, user } = useUser()
  const [stationheadLive, setStationheadLive] = useState(false)
  const [todayStreams, setTodayStreams] = useState<number | null>(null)
  const [goalStreams, setGoalStreams]   = useState<number | null>(null)
  const [loading, setLoading]          = useState(true)
  const [earnedCard, setEarnedCard]    = useState<EarnedCard | null>(null)

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

  const handleMissionsComplete = async () => {
    if (!user) return
    try {
      // Award a random card
      const res = await fetch("/api/photocards/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.card) setEarnedCard(data.card)
      }
    } catch (e) {
      console.error("Failed to award photocard:", e)
    }
  }

  const handleClaimCard = async () => {
    if (!earnedCard || !user) return
    try {
      await fetch("/api/photocards/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, cardId: earnedCard.id }),
      })
    } finally {
      setEarnedCard(null)
    }
  }

  return (
    <>
      <Navigation />
      <div style={{ background: "#0d1117", minHeight: "100vh" }}>

        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "8%", left: "20%", width: 600, height: 600, borderRadius: "50%", background: "rgba(31,111,235,0.04)", filter: "blur(120px)" }} />
          <div style={{ position: "absolute", bottom: "15%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "rgba(88,166,255,0.03)", filter: "blur(100px)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", padding: "88px 24px 56px" }}>

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 style={{ color: "white", fontWeight: 900, fontSize: 36, margin: "0 0 8px", letterSpacing: "-0.01em" }}>Streaming Hub</h1>
            <p style={{ color: "#8b949e", fontSize: 14, margin: 0 }}>Complete missions, track goals, and stream with ATINYs!</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

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
                      >Link stats.fm</button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <StationheadLiveBanner />

            <div data-statsfm-card style={card}><StatsFmCard /></div>

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

            <div>
              <h2 style={{ color: "white", fontWeight: 800, fontSize: 20, margin: "0 0 4px" }}>Your Daily Missions</h2>
              <p style={{ color: "#8b949e", fontSize: 12, margin: "0 0 12px" }}>Personal streaming goals just for you!</p>
              <div style={card}>
                <DailyMissions onAllComplete={handleMissionsComplete} />
              </div>
            </div>

            <div>
              <h2 style={{ color: "white", fontWeight: 800, fontSize: 20, margin: "0 0 4px" }}>Recent Tracks</h2>
              <p style={{ color: "#8b949e", fontSize: 12, margin: "0 0 12px" }}>Updated based on stats.fm · Goals refresh hourly</p>
              <div style={card}><RecentTracksCard /></div>
            </div>

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

            <StreamingGuideButton />

          </div>
        </div>
      </div>

      {earnedCard && <PhotocardEarnedModal card={earnedCard} onClaim={handleClaimCard} />}
    </>
  )
}