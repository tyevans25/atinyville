import { kv } from "@vercel/kv"
import { NextResponse } from "next/server"

function getCurrentWeekKey(): string {
  const now = new Date()
  const year = now.getFullYear()
  const startOfYear = new Date(year, 0, 1)
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)
  return `${year}-W${String(weekNumber).padStart(2, "0")}`
}

export async function GET(request: Request) {
  try {
    // Cron auth
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date().toISOString().split("T")[0]
    const weekKey = getCurrentWeekKey()

    // Load goals and missions
    const [dailyGoal, weeklyGoal, missions] = await Promise.all([
      kv.get<{ song: string; target: number; current?: number }>(`daily:goal:${today}`),
      kv.get<{ song: string; target: number; current?: number }>(`weekly:goal:${weekKey}`),
      kv.get<Array<{ id: string; song: string; target: number }>>(`daily:missions:${today}`)
    ])

    if (!dailyGoal && !weeklyGoal && (!missions || missions.length === 0)) {
      return NextResponse.json({ success: true, message: "No active goals today" })
    }

    const userKeys = await kv.keys("user:*:statsfm")
    let usersProcessed = 0

    for (const key of userKeys) {
      try {
        const userId = key.split(":")[1]
        const statsfmUsername = await kv.get<string>(key)
        if (!statsfmUsername) continue

        const res = await fetch(`https://api.stats.fm/api/v1/users/${statsfmUsername}/streams`)
        if (!res.ok) continue
        const data = await res.json()
        if (!Array.isArray(data.items)) continue

        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)

        // --- DAILY GOAL SONG ---
        if (dailyGoal) {
          const todayStreams = data.items.filter((s: any) => {
            return new Date(s.endTime) >= todayStart && s.trackName === dailyGoal.song
          }).length

          const prevCount = (await kv.get<number>(`daily:streams:${userId}:${today}`)) || 0
          const newCount = prevCount + todayStreams
          await kv.set(`daily:streams:${userId}:${today}`, newCount, { ex: 86400 })
        }

        // --- WEEKLY GOAL SONG ---
        if (weeklyGoal) {
          const now = new Date()
          const dayOfWeek = now.getDay()
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
          const startOfWeek = new Date(now)
          startOfWeek.setDate(now.getDate() - daysToMonday)
          startOfWeek.setHours(0, 0, 0, 0)

          const weekStreams = data.items.filter((s: any) => {
            return new Date(s.endTime) >= startOfWeek && s.trackName === weeklyGoal.song
          }).length

          const prevWeekly = (await kv.get<number>(`weekly:streams:${userId}:${weekKey}`)) || 0
          await kv.set(`weekly:streams:${userId}:${weekKey}`, prevWeekly + weekStreams, { ex: 604800 })
        }

        // --- MISSIONS ---
        if (missions && missions.length > 0) {
          for (const mission of missions) {
            const missionCount = data.items.filter((s: any) => {
              return new Date(s.endTime) >= todayStart && s.trackName === mission.song
            }).length
            const prevMission = (await kv.get<number>(`mission:progress:${userId}:${today}:${mission.id}`)) || 0
            await kv.set(`mission:progress:${userId}:${today}:${mission.id}`, prevMission + missionCount, { ex: 86400 })
          }
        }

        usersProcessed++
      } catch (err) {
        console.error(`Error processing ${key}:`, err)
      }
    }

    // --- UPDATE DAILY GOAL TOTAL FROM ALL USERS ---
    if (dailyGoal) {
      const allUserDailyKeys = await kv.keys(`daily:streams:*:${today}`)
      let totalDaily = 0
      for (const k of allUserDailyKeys) {
        const count = (await kv.get<number>(k)) || 0
        totalDaily += count
      }
      await kv.set(`daily:goal:${today}`, { ...dailyGoal, current: totalDaily }, { ex: 86400 })
    }

    // --- UPDATE WEEKLY GOAL TOTAL FROM ALL USERS ---
    if (weeklyGoal) {
      const allWeeklyKeys = await kv.keys(`weekly:streams:*:${weekKey}`)
      let totalWeekly = 0
      for (const k of allWeeklyKeys) {
        const count = (await kv.get<number>(k)) || 0
        totalWeekly += count
      }
      await kv.set(`weekly:goal:${weekKey}`, { ...weeklyGoal, current: totalWeekly }, { ex: 604800 })
    }

    console.log(`Cron done: ${usersProcessed} users processed`)

    return NextResponse.json({ success: true, usersProcessed })
  } catch (error) {
    console.error("Cron job failed:", error)
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 })
  }
}
