"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Circle, Music } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useMissionStreak } from "@/hooks/useMissionStreak"

interface Mission {
  id: string
  trackId: number
  trackName: string
  target: number
  current: number
}

export default function DailyMissions() {
  const { isSignedIn } = useUser()
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading]   = useState(true)
  const { updateStreak, checkAllMissionsComplete } = useMissionStreak()

  useEffect(() => {
    if (isSignedIn) {
      fetchMissions()
      const interval = setInterval(fetchMissions, 5 * 60 * 1000)
      return () => clearInterval(interval)
    } else {
      setLoading(false)
    }
  }, [isSignedIn])

  useEffect(() => {
    if (missions.length > 0 && checkAllMissionsComplete(missions)) {
      updateStreak()
    }
  }, [missions, checkAllMissionsComplete, updateStreak])

  const fetchMissions = async () => {
    try {
      const res = await fetch("/api/daily-missions")
      if (res.ok) { const d = await res.json(); setMissions(d.missions || []) }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const header = (
    <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Music style={{ width: 15, height: 15, color: "#58a6ff" }} />
        <span style={{ color: "#e6edf3", fontWeight: 700, fontSize: 14 }}>Daily Missions</span>
      </div>
      {missions.length > 0 && (
        <span style={{ color: "#8b949e", fontSize: 12 }}>
          {missions.filter(m => m.current >= m.target).length} / {missions.length} Complete
        </span>
      )}
    </div>
  )

  if (!isSignedIn) return (
    <div>{header}<div style={{ padding: "20px", textAlign: "center" }}><p style={{ color: "#484f58", fontSize: 13 }}>Sign in to see your daily missions</p></div></div>
  )
  if (loading) return (
    <div>{header}<div style={{ padding: "20px" }}><p style={{ color: "#484f58", fontSize: 13 }}>Loading missions...</p></div></div>
  )

  const completedCount = missions.filter(m => m.current >= m.target).length

  return (
    <div>
      {header}
      <div style={{ padding: "14px 20px" }}>
        {missions.length === 0 ? (
          <p style={{ color: "#484f58", fontSize: 13, textAlign: "center", padding: "16px 0" }}>No missions set for today</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {missions.map(mission => {
              const done     = mission.current >= mission.target
              const progress = Math.min(mission.current, mission.target)
              return (
                <div key={mission.id} style={{
                  background: done ? "rgba(34,197,94,0.06)" : "rgba(255,255,255,0.03)",
                  border: done ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10, padding: "12px 14px",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: done ? "#22c55e" : "white", fontWeight: 600, fontSize: 13, margin: 0, textDecoration: done ? "line-through" : "none" }}>
                      Stream "{mission.trackName}" {mission.target} {mission.target === 1 ? "time" : "times"}
                    </p>
                    <p style={{ color: done ? "#22c55e" : "#484f58", fontSize: 11, margin: "3px 0 0" }}>
                      {done ? "✓ Mission complete!" : `${progress} / ${mission.target} completed`}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                    {Array.from({ length: mission.target }).map((_, i) =>
                      i < progress
                        ? <CheckCircle key={i} style={{ width: 20, height: 20, color: "#22c55e" }} />
                        : <Circle     key={i} style={{ width: 20, height: 20, color: "#484f58" }} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {completedCount === missions.length && missions.length > 0 && (
          <div style={{ marginTop: 12, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
            <p style={{ color: "#22c55e", fontWeight: 700, fontSize: 13, margin: 0 }}>🎉 All missions complete! Great job!</p>
          </div>
        )}

        <p style={{ color: "#484f58", fontSize: 11, textAlign: "center", marginTop: 12 }}>
          Missions reset daily at 12AM KST. Keep streaming to complete new missions!
        </p>
      </div>
    </div>
  )
}