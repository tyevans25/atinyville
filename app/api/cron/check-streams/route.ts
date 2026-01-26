import { kv } from "@vercel/kv"
import { NextResponse } from "next/server"

// Helper: Get current week key (YYYY-W##)
function getCurrentWeekKey(): string {
  const now = new Date()
  const year = now.getFullYear()
  const startOfYear = new Date(year, 0, 1)
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)
  return `${year}-W${String(weekNumber).padStart(2, '0')}`
}

export async function GET(request: Request) {
  try {
    // --- Cron auth check ---
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date().toISOString().split("T")[0]
    const weekKey = getCurrentWeekKey()

    // --- Keys ---
    const dailyGoalKey = `daily:goal:${today}`
    const weeklyGoalKey = `weekly:goal:${weekKey}`
    const missionsKey = `daily:missions:${today}`

    // --- Load goals and missions ---
    const [dailyGoal, weeklyGoal, missions] = await Promise.all([
      kv.get<{ song: string; target: number; current?: number }>(dailyGoalKey),
      kv.get<{ song: string; target: number; current?: number }>(weeklyGoalKey),
      kv.get<Array<{ id: string; song: string; target: number }>>(missionsKey)
    ])

    if (!dailyGoal && !weeklyGoal && (!missions || missions.length === 0)) {
      return NextResponse.json({ success: true, message: "No active goals today" })
    }

    // --- Initialize accumulators ---
    let totalDaily = 0
    let totalWeekly = 0
    let usersProcessed = 0

    // --- Fetch all users with stats.fm ---
    const userKeys = await kv.keys("user:*:statsfm")

    for (const key of userKeys) {
      try {
        const userId = key.split(":")[1]
        const statsfmUsername = await kv.get<string>(key)
        if (!statsfmUsername) continue

        // Fetch user's streams
        const res = await fetch(`https://api.stats.fm/api/v1/users/${statsfmUsername}/streams`)
        if (!res.ok) continue
        const data = await res.json()
        const streams: any[] = data.items || []

        // --- DAILY GOAL ---
        if (dailyGoal) {
          const todayStreams = streams.filter((s) => {
            const streamDate = new Date(s.endTime).toISOString().split("T")[0]
            return streamDate === today && s.trackName === dailyGoal.song
          })

          // Save per-user daily streams
          const prevUserDaily = (await kv.get<number>(`daily:streams:${userId}:${today}`)) || 0
          const newUserDaily = prevUserDaily + todayStreams.length
          await kv.set(`daily:streams:${userId}:${today}`, newUserDaily, { ex: 86400 })

          totalDaily += todayStreams.length
        }

        // --- WEEKLY GOAL ---
        if (weeklyGoal) {
          const now = new Date()
          const dayOfWeek = now.getDay()
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
          const startOfWeek = new Date(now)
          startOfWeek.setDate(now.getDate() - daysToMonday)
          startOfWeek.setHours(0, 0, 0, 0)

          const weekStreams = streams.filter((s) => {
            const streamDate = new Date(s.endTime)
            return streamDate >= startOfWeek && s.trackName === weeklyGoal.song
          })

          const prevUserWeekly = (await kv.get<number>(`weekly:streams:${userId}:${weekKey}`)) || 0
          const newUserWeekly = prevUserWeekly + weekStreams.length
          await kv.set(`weekly:streams:${userId}:${weekKey}`, newUserWeekly, { ex: 604800 })

          totalWeekly += weekStreams.length
        }

        // --- INDIVIDUAL MISSIONS ---
        if (missions && missions.length > 0) {
          for (const mission of missions) {
            const missionStreams = streams.filter((s) => {
              const streamDate = new Date(s.endTime).toISOString().split("T")[0]
              return streamDate === today && s.trackName === mission.song
            })

            const prevMission = (await kv.get<number>(`mission:progress:${userId}:${today}:${mission.id}`)) || 0
            const newMission = prevMission + missionStreams.length
            await kv.set(`mission:progress:${userId}:${today}:${mission.id}`, newMission, { ex: 86400 })
          }
        }

        usersProcessed++
      } catch (err) {
        console.error(`Error processing user ${key}:`, err)
      }
    }

    // --- UPDATE DAILY GOAL TOTAL ---
    if (dailyGoal) {
      await kv.set(dailyGoalKey, {
        song: dailyGoal.song,
        target: dailyGoal.target,
        current: totalDaily
      }, { ex: 86400 })
    }

    // --- UPDATE WEEKLY GOAL TOTAL ---
    if (weeklyGoal) {
      await kv.set(weeklyGoalKey, {
        song: weeklyGoal.song,
        target: weeklyGoal.target,
        current: totalWeekly
      }, { ex: 604800 })
    }

    // --- COMMUNITY MISSIONS TOTALS ---
    if (missions && missions.length > 0) {
      for (const mission of missions) {
        let missionTotal = 0
        for (const key of userKeys) {
          const userId = key.split(":")[1]
          const count = (await kv.get<number>(`mission:progress:${userId}:${today}:${mission.id}`)) || 0
          missionTotal += count
        }
        await kv.set(`mission:community:${today}:${mission.id}`, missionTotal, { ex: 86400 })
      }
    }

    console.log(`Cron done: ${usersProcessed} users processed. Daily: ${totalDaily}, Weekly: ${totalWeekly}`)

    return NextResponse.json({
      success: true,
      usersProcessed,
      dailyTotal: totalDaily,
      weeklyTotal: totalWeekly,
      missionsCount: missions?.length || 0
    })
  } catch (error) {
    console.error("Error in cron job:", error)
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 })
  }
}
