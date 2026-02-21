"use client"

import { useState, useEffect } from "react"
import { Target, Clock, Users } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"

interface DailyGoalData {
  song?: unknown
  target?: unknown
  current?: unknown
  userStreams?: unknown
}

const safeNumber = (value: unknown, fallback = 0): number =>
  typeof value === "number" && !Number.isNaN(value) ? value : fallback

const motivationGifs = [
  '/gifs/motivation/hongjoong.GIF', '/gifs/motivation/hongjoong2.GIF',
  '/gifs/motivation/jongho.GIF', '/gifs/motivation/mingi.GIF',
  '/gifs/motivation/san.GIF', '/gifs/motivation/seonghwa.GIF',
  '/gifs/motivation/wooyoung.GIF', '/gifs/motivation/yeosang.gif',
  '/gifs/motivation/yunho.GIF', '/gifs/motivation/yunho2.GIF'
]

const celebrationGifs = [
  '/gifs/complete/hongjoong.GIF', '/gifs/complete/jongho.gif',
  '/gifs/complete/mingi.GIF', '/gifs/complete/minig-san.GIF',
  '/gifs/complete/san.GIF', '/gifs/complete/seonghwa.GIF',
  '/gifs/complete/wooyoung.GIF', '/gifs/complete/yeosang.GIF',
  '/gifs/complete/yunho.GIF', '/gifs/complete/yunho2.GIF'
]

const getRandomGif = (gifs: string[]) => gifs[Math.floor(Math.random() * gifs.length)]

export default function DailyGoalSlide() {
  const { isSignedIn } = useUser()
  const [goalData, setGoalData] = useState<DailyGoalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState("")
  const [currentGif, setCurrentGif] = useState<string>("")

  useEffect(() => {
    fetchGoalData()
    const interval = setInterval(fetchGoalData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [isSignedIn])

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const nowKST = new Date(now.getTime() + 9 * 60 * 60 * 1000)
      const tomorrowKST = new Date(nowKST)
      tomorrowKST.setUTCDate(tomorrowKST.getUTCDate() + 1)
      tomorrowKST.setUTCHours(0, 0, 0, 0)
      const diff = tomorrowKST.getTime() - nowKST.getTime()
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeRemaining(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
    }
    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (goalData) {
      const progress = safeNumber(goalData.target) > 0
        ? safeNumber(goalData.current) / safeNumber(goalData.target)
        : 0
      setCurrentGif(getRandomGif(progress >= 0.9 ? celebrationGifs : motivationGifs))
    }
  }, [goalData])

  const fetchGoalData = async () => {
    try {
      const res = await fetch("/api/daily-goal")
      if (!res.ok) { setGoalData(null); setLoading(false); return }
      const data = await res.json()
      setGoalData(data ?? null)
    } catch { setGoalData(null) }
    finally { setLoading(false) }
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <p style={{ color: "white", fontSize: 13 }}>Loading today's goal...</p>
    </div>
  )

  if (!goalData) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 }}>
      <Target style={{ width: 32, height: 32, color: "rgba(255,255,255,0.4)" }} />
      <p style={{ color: "white", fontWeight: 700, margin: 0 }}>No Active Goal</p>
      <p style={{ color: "#8b949e", fontSize: 12, margin: 0 }}>Check back soon!</p>
    </div>
  )

  const target = safeNumber(goalData.target)
  const current = safeNumber(goalData.current)
  const userStreams = safeNumber(goalData.userStreams)
  const song = typeof goalData.song === "string" && goalData.song.trim()
    ? goalData.song : "Unknown Song"
  const progress = target > 0 ? (current / target) * 100 : 0
  const remaining = Math.max(target - current, 0)
  const isNearComplete = progress >= 90

  return (
    <div style={{ minHeight: 260, display: "flex", padding: "16px 20px", gap: 16, overflow: "hidden" }}>

      {/* LEFT: GIF */}
      <div style={{ width: 130, flexShrink: 0, position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
        {currentGif && (
          <>
            <Image
              src={currentGif}
              alt={isNearComplete ? "Celebration!" : "Keep going!"}
              fill
              style={{ objectFit: "cover" }}
              unoptimized
            />
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "rgba(0,0,0,0.55)", padding: "4px 6px", textAlign: "center"
            }}>
              <span style={{ color: "white", fontSize: 10, fontWeight: 700 }}>
                {isNearComplete ? "🎉 Almost there!" : "💪 Keep streaming!"}
              </span>
            </div>
          </>
        )}
      </div>

      {/* RIGHT: Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>

        {/* Top row: title + streaming icons */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}>
              <Users style={{ width: 14, height: 14, color: "white" }} />
            </div>
            <div>
              <p style={{ color: "white", fontWeight: 800, fontSize: 14, margin: 0, lineHeight: 1.2 }}>Daily Streaming Goal</p>
              <p style={{ color: "#8b949e", fontSize: 10, margin: 0 }}>Stream together, reach the goal 🏴‍☠️</p>
            </div>
          </div>

          {/* Streaming icons */}
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <a href={`https://open.spotify.com/search/${encodeURIComponent(song)}`}
              target="_blank" rel="noopener noreferrer" title="Stream on Spotify"
              style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "rgba(30,215,96,0.15)", border: "1px solid rgba(30,215,96,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none", fontSize: 14
              }}> <Image src="/logo/spotify.jpg" alt="Spotify" width={16} height={16} style={{ borderRadius: 2 }} unoptimized />
            </a>
            <a href={`https://music.apple.com/us/search?term=${encodeURIComponent(song)}`}
              target="_blank" rel="noopener noreferrer" title="Stream on Apple Music"
              style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "rgba(252,60,68,0.15)", border: "1px solid rgba(252,60,68,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none", fontSize: 14
              }}> <Image src="/logo/am.jpg" alt="Apple Music" width={16} height={16} style={{ borderRadius: 2 }} unoptimized />
            </a>
          </div>
        </div>

        {/* Song + timer */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ color: "#8b949e", fontSize: 10, margin: "0 0 1px" }}>Today's Song</p>
            <p style={{ color: "white", fontWeight: 800, fontSize: 15, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{song}"</p>
          </div>
          <div style={{
            marginLeft: "auto", flexShrink: 0, display: "flex", alignItems: "center", gap: 5,
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8, padding: "4px 10px"
          }}>
            <Clock style={{ width: 11, height: 11, color: "white" }} />
            <span style={{ color: "white", fontWeight: 700, fontSize: 12, fontFamily: "monospace" }}>{timeRemaining}</span>
          </div>
        </div>

        {/* Progress card */}
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
            <span style={{ color: "white", fontWeight: 700, fontSize: 17 }}>{current.toLocaleString()}</span>
            <span style={{ color: "#8b949e", fontSize: 11 }}>/ {target.toLocaleString()}</span>
          </div>
          <div style={{ height: 7, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${Math.min(progress, 100)}%`, borderRadius: 4,
              background: isNearComplete ? "linear-gradient(90deg,#22c55e,#4ade80)" : "linear-gradient(90deg,#3b82f6,#60a5fa)",
              boxShadow: isNearComplete ? "0 0 6px rgba(34,197,94,0.5)" : "0 0 6px rgba(59,130,246,0.5)",
              transition: "width 0.5s"
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ color: isNearComplete ? "#4ade80" : "#60a5fa", fontSize: 10, fontWeight: 700 }}>{Math.round(progress)}%</span>
            <span style={{ color: "#8b949e", fontSize: 10 }}>
              {remaining > 0 ? `${remaining.toLocaleString()} to go` : "🎉 Goal reached!"}
            </span>
          </div>
        </div>

        {/* Bottom row: contribution + reset time */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {isSignedIn && userStreams > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Target style={{ width: 11, height: 11, color: "#60a5fa" }} />
              <span style={{ color: "#8b949e", fontSize: 11 }}>Your streams:</span>
              <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>{userStreams}</span>
              <span style={{ color: "#60a5fa", fontSize: 11 }}>
                ({current > 0 ? ((userStreams / current) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          ) : (
            <Link href="/streaming" style={{ color: "#60a5fa", fontSize: 11, fontWeight: 600, textDecoration: "none" }}>
              {isSignedIn ? "Start Contributing →" : "Set Up Tracking →"}
            </Link>
          )}
          <span style={{ color: "#484f58", fontSize: 10 }}>⏰ Resets 12AM KST</span>
        </div>

      </div>
    </div>
  )
}