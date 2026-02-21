"use client"

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'
import { type Badge, type UserStats } from '@/lib/badge-system'

interface StreakModalProps {
  isOpen: boolean
  onClose: () => void
}

const getTierInfo = (streak: number) => {
  if (streak >= 30) return { image: '/tiers/cap_RH.svg', name: "Captain's Right Hand", description: "Standing closest to the helm as the Captain's most trusted advisor. Hold the course.", next: null, progress: 100, rank: 4 }
  if (streak >= 14) return { image: '/tiers/1st_mate.svg', name: 'First Mate', description: "You've survived treacherous paths and made the trusted circle. Maintain it.", next: "Captain's Right Hand", target: 30, progress: ((streak - 14) / 16) * 100, rank: 3 }
  if (streak >= 7)  return { image: '/tiers/corsair.svg',  name: 'Corsair', description: "A daring pirate of the high seas. Keep moving forward.", next: 'First Mate', target: 14, progress: ((streak - 7) / 7) * 100, rank: 2 }
  if (streak >= 1)  return { image: '/tiers/wayfinder.svg',name: 'Wayfinder', description: "You're navigating the vast ocean. Don't lose direction.", next: 'Corsair', target: 7, progress: ((streak - 1) / 6) * 100, rank: 1 }
  return { image: '/tiers/deckhand.svg', name: 'Deckhand', description: "You're just getting started. Earn your keep.", next: 'Wayfinder', target: 1, progress: 0, rank: 0 }
}

const getWeekDaysLocal = (currentStreak: number) => {
  const now = new Date()
  const localDay = now.getDay()
  const daysSinceThursday = (localDay + 7 - 4) % 7
  const thisWeekThursday = new Date(now)
  thisWeekThursday.setDate(now.getDate() - daysSinceThursday)
  thisWeekThursday.setHours(0, 0, 0, 0)
  const days = []
  const dayLabels = ['T', 'F', 'S', 'S', 'M', 'T', 'W']
  for (let i = 0; i < 7; i++) {
    const date = new Date(thisWeekThursday)
    date.setDate(thisWeekThursday.getDate() + i)
    const daysFromToday = daysSinceThursday - i
    const completed = daysFromToday >= 0 && daysFromToday < currentStreak
    days.push({ day: dayLabels[i], completed, isToday: i === daysSinceThursday })
  }
  return days
}

export default function StreakModal({ isOpen, onClose }: StreakModalProps) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) fetchStats()
  }, [isOpen])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/user-stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setBadges(data.badges)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  if (!isOpen) return null

  const tier = stats ? getTierInfo(stats.currentStreak) : null
  const daysRemaining = tier?.next ? (tier.target! - (stats?.currentStreak || 0)) : 0
  const weekDays = getWeekDaysLocal(stats?.currentStreak || 0)
  const completedDays = weekDays.filter(d => d.completed).length

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ position: "relative", width: "100%", maxWidth: 440 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Animated gradient border */}
        <div style={{
          position: "absolute", inset: -2, borderRadius: 18,
          background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #8b5cf6, #3b82f6)",
          backgroundSize: "300% 100%",
          animation: "gradientShift 4s linear infinite",
          opacity: 0.7,
        }} />

        <div style={{
          position: "relative", borderRadius: 16, overflow: "hidden",
          background: "#0d1117",
          border: "1px solid rgba(255,255,255,0.08)",
          maxHeight: "88vh", display: "flex", flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", animation: "pulse 2s ease-in-out infinite" }} />
              <span style={{ color: "#58a6ff", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>ATINY Stats</span>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#484f58", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {/* Scrollable body */}
          {loading ? (
            <div style={{ padding: 48, textAlign: "center", color: "#484f58" }}>Loading...</div>
          ) : (
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", flex: 1 }}>

              {/* Tier + streak */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", filter: "blur(16px)", opacity: 0.4 }} />
                  <div style={{ position: "relative", width: 80, height: 96 }}>
                    {tier?.image && <Image src={tier.image} alt={tier.name} fill style={{ objectFit: "contain" }} />}
                  </div>
                  <div style={{ position: "absolute", top: -4, right: -4, color: "#58a6ff", fontSize: 12, animation: "pulse 2s ease-in-out infinite" }}>✦</div>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ color: "white", fontWeight: 900, fontSize: 17 }}>{tier?.name}</span>
                    <span style={{ background: "rgba(88,166,255,0.15)", color: "#58a6ff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5, border: "1px solid rgba(88,166,255,0.25)" }}>RANK {tier?.rank}</span>
                  </div>
                  <p style={{ color: "#8b949e", fontSize: 11, fontStyle: "italic", marginBottom: 8, lineHeight: 1.5 }}>{tier?.description}</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                    <span style={{ color: "white", fontWeight: 900, fontSize: 28 }}>{stats?.currentStreak || 0}</span>
                    <span style={{ color: "#8b949e", fontSize: 12 }}>day streak</span>
                  </div>
                  {tier?.next ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ color: "#8b949e", fontSize: 10 }}>Progress to {tier.next}</span>
                        <span style={{ color: "#8b949e", fontSize: 10 }}>{Math.round(tier.progress)}%</span>
                      </div>
                      <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${tier.progress}%`, background: "linear-gradient(90deg,#3b82f6,#8b5cf6)", borderRadius: 3, transition: "width 0.5s" }} />
                      </div>
                      <p style={{ color: "#484f58", fontSize: 10, marginTop: 4 }}>{daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining</p>
                    </>
                  ) : (
                    <p style={{ color: "#22c55e", fontSize: 12 }}>🏆 Highest level reached!</p>
                  )}
                </div>
              </div>

              {/* Stats bar */}
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", padding: "12px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", textAlign: "center" }}>
                  {[
                    { label: "Total Streams", value: stats?.totalStreams?.toLocaleString() || "0" },
                    { label: "Best Streak",   value: stats?.longestStreak || 0 },
                    { label: "Best Day",      value: stats?.highestDailyStreams || 0 },
                  ].map(({ label, value }, i, arr) => (
                    <div key={label} style={{ flex: 1, borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                      <div style={{ color: "white", fontWeight: 800, fontSize: 20 }}>{value}</div>
                      <div style={{ color: "#484f58", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly streak */}
              <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ color: "#8b949e", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Weekly Streak</span>
                  <span style={{ color: "#58a6ff", fontSize: 10, fontWeight: 600 }}>{completedDays}/7 Complete</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {weekDays.map((day, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{
                        width: "100%", height: 36, borderRadius: 8,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700, position: "relative",
                        background: day.completed ? "linear-gradient(135deg,#22c55e,#16a34a)" : "rgba(255,255,255,0.04)",
                        border: day.isToday ? "1px solid rgba(88,166,255,0.4)" : "1px solid rgba(255,255,255,0.06)",
                        color: day.completed ? "white" : "#484f58",
                        boxShadow: day.completed ? "0 4px 12px rgba(34,197,94,0.2)" : "none",
                      }}>
                        {day.completed ? "✓" : day.day}
                        {day.isToday && <div style={{ position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)", width: 5, height: 5, borderRadius: "50%", background: "#58a6ff" }} />}
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ color: "#484f58", fontSize: 10, textAlign: "center", marginTop: 10 }}>Week resets every Thursday</p>
              </div>

              {/* Achievements */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ color: "#8b949e", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>🏆 Achievements</span>
                  <span style={{ color: "#484f58", fontSize: 10 }}>{badges.length} unlocked</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
                  {badges.map(badge => (
                    <div key={badge.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ position: "relative", width: 64, height: 76 }}>
                        <Image src={badge.image} alt={badge.name} fill style={{ objectFit: "contain" }} />
                      </div>
                      <p style={{ color: "#8b949e", fontSize: 10, fontWeight: 600, marginTop: 6, textAlign: "center", maxWidth: 80 }}>{badge.name}</p>
                      <p style={{ color: "#484f58", fontSize: 9, marginTop: 2, textAlign: "center", maxWidth: 90 }}>{badge.description}</p>
                    </div>
                  ))}
                  {badges.length < 6 && Array.from({ length: Math.min(6 - badges.length, 3) }).map((_, i) => (
                    <div key={`locked-${i}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.25 }}>
                      <div style={{ width: 64, height: 76, borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🔒</div>
                      <p style={{ color: "#484f58", fontSize: 10, marginTop: 6 }}>Locked</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Motivational footer */}
              <div style={{ background: "linear-gradient(135deg,rgba(59,130,246,0.08),rgba(139,92,246,0.08))", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>
                <p style={{ color: "white", fontSize: 12, fontWeight: 600 }}>
                  {stats && stats.currentStreak > 0
                    ? `🔥 You're on fire! Don't break your ${stats.currentStreak}-day streak!`
                    : "Complete your first mission set to start your streak!"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes gradientShift { 0% { background-position: 0% 50% } 100% { background-position: 300% 50% } }
        @keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
      `}</style>
    </div>
  )
}