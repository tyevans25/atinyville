import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

// Helper to get current week key
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
    // Verify this is actually a cron job
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = new Date().toISOString().split('T')[0]
    const weekKey = getCurrentWeekKey()
    
    // Get today's goals and missions
    const dailyGoalKey = `daily:goal:${today}`
    const weeklyGoalKey = `weekly:goal:${weekKey}`
    const missionsKey = `daily:missions:${today}`
    
    const [dailyGoal, weeklyGoal, missions] = await Promise.all([
      kv.get<{ song: string; target: number; current: number }>(dailyGoalKey),
      kv.get<{ song: string; target: number; current: number }>(weeklyGoalKey),
      kv.get<Array<{ id: string; song: string; target: number }>>(missionsKey)
    ])

    // Get all users with stats.fm usernames
    const userKeys = await kv.keys('user:*:statsfm')
    
    let dailyTotal = 0
    let weeklyTotal = 0
    let usersChecked = 0

    for (const key of userKeys) {
      try {
        const userId = key.split(':')[1]
        const statsfmUsername = await kv.get<string>(key)

        if (!statsfmUsername) continue

        // Fetch their streams from stats.fm
        const response = await fetch(
          `https://api.stats.fm/api/v1/users/${statsfmUsername}/streams`
        )

        if (!response.ok) continue

        const data = await response.json()

        // === DAILY GOAL ===
        if (dailyGoal) {
          const todayStreams = data.items.filter((stream: any) => {
            const streamDate = new Date(stream.endTime).toISOString().split('T')[0]
            return streamDate === today && stream.trackName === dailyGoal.song
          })

          const userDailyCount = todayStreams.length
          await kv.set(
            `daily:streams:${userId}:${today}`,
            userDailyCount,
            { ex: 86400 }
          )
          dailyTotal += userDailyCount
        }

        // === WEEKLY GOAL ===
        if (weeklyGoal) {
          // Get start of week (Monday)
          const now = new Date()
          const dayOfWeek = now.getDay()
          const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
          const startOfWeek = new Date(now)
          startOfWeek.setDate(now.getDate() - daysToMonday)
          startOfWeek.setHours(0, 0, 0, 0)

          const weekStreams = data.items.filter((stream: any) => {
            const streamDate = new Date(stream.endTime)
            return streamDate >= startOfWeek && stream.trackName === weeklyGoal.song
          })

          const userWeeklyCount = weekStreams.length
          await kv.set(
            `weekly:streams:${userId}:${weekKey}`,
            userWeeklyCount,
            { ex: 604800 }
          )
          weeklyTotal += userWeeklyCount
        }

        // === INDIVIDUAL MISSIONS ===
        if (missions && missions.length > 0) {
          for (const mission of missions) {
            const missionStreams = data.items.filter((stream: any) => {
              const streamDate = new Date(stream.endTime).toISOString().split('T')[0]
              return streamDate === today && stream.trackName === mission.song
            })

            const userMissionCount = missionStreams.length
            await kv.set(
              `mission:progress:${userId}:${today}:${mission.id}`,
              userMissionCount,
              { ex: 86400 }
            )
          }
        }

        usersChecked++

      } catch (error) {
        console.error(`Error checking user ${key}:`, error)
        continue
      }
    }

    // Update goal totals
    if (dailyGoal) {
      await kv.set(dailyGoalKey, {
        song: dailyGoal.song,
        target: dailyGoal.target,
        current: dailyTotal
      }, { ex: 86400 })
    }

    if (weeklyGoal) {
      await kv.set(weeklyGoalKey, {
        song: weeklyGoal.song,
        target: weeklyGoal.target,
        current: weeklyTotal
      }, { ex: 604800 })
    }

    console.log(`Checked ${usersChecked} users - Daily: ${dailyTotal}, Weekly: ${weeklyTotal}`)

    return NextResponse.json({
      success: true,
      usersChecked,
      dailyTotal,
      weeklyTotal,
      missionsCount: missions?.length || 0
    })

  } catch (error) {
    console.error('Error in cron job:', error)
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    )
  }
}