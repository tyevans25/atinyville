import { kv } from "@vercel/kv"
import { NextResponse } from "next/server"

const ATEEZ_ARTIST_ID = 164828

const DEFAULT_COMMUNITY_DAILY = 10000
const DEFAULT_COMMUNITY_WEEKLY = 50000
const DEFAULT_SONG_GOAL_TARGET = 5000

interface Mission {
  id: string
  trackId: number
  trackName: string
  target: number
}

/* =========================
  DATE HELPERS
========================= */

function getKSTDate(): string {
  const now = new Date()
  const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return kstTime.toISOString().split("T")[0]
}

function getYesterdayKST(): string {
  const now = new Date()
  const yesterday = new Date(now.getTime() + 9 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000)
  return yesterday.toISOString().split("T")[0]
}

function getCurrentWeekKey(): string {
  const now = new Date()
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  
  // Find most recent Thursday
  const kstDay = kstNow.getUTCDay() // 0=Sun, 4=Thu
  const daysSinceThursday = (kstDay + 7 - 4) % 7
  
  const thursday = new Date(kstNow)
  thursday.setUTCDate(kstNow.getUTCDate() - daysSinceThursday)
  thursday.setUTCHours(0, 0, 0, 0)
  
  // Get ISO week number of that Thursday
  const jan4 = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 4))
  const weekNumber = Math.ceil(
    ((thursday.getTime() - jan4.getTime()) / 86400000 + jan4.getUTCDay() + 1) / 7
  ) + 1
  
  return `${thursday.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`
}

/* =========================
  GOAL RECALCULATION
========================= */

async function recalculateGoalTotals(
  today: string,
  weekKey: string,
  communityDaily: any,
  dailySongGoal: any,
  communityWeekly: any
) {
  if (communityDaily) {
    const userDailyKeys = await kv.keys(`community:daily:user:*:${today}`)
    let total = 0
    for (const key of userDailyKeys) {
      total += (await kv.get<number>(key)) || 0
    }
    await kv.set(`community:daily:${today}`, { ...communityDaily, current: total }, { ex: 86400 })
    console.log(`✅ Daily goal recalculated: ${total} streams`)
  }

  if (dailySongGoal) {
    const userSongKeys = await kv.keys(`daily:streams:*:${today}`)
    let total = 0
    for (const key of userSongKeys) {
      total += (await kv.get<number>(key)) || 0
    }
    await kv.set(`daily:goal:${today}`, { ...dailySongGoal, current: total }, { ex: 86400 })
    console.log(`✅ Song goal recalculated: ${total} streams`)
  }

  if (communityWeekly) {
    const userWeeklyKeys = await kv.keys(`community:weekly:user:*:${weekKey}`)
    let total = 0
    for (const key of userWeeklyKeys) {
      total += (await kv.get<number>(key)) || 0
    }
    
    await kv.set(`community:weekly:${weekKey}`, { ...communityWeekly, current: total }, { ex: 604800 })
    console.log(`✅ Weekly goal recalculated: ${total} streams`)
  }
}

/* =========================
  DEFAULT GOALS
========================= */

async function ensureDefaultGoals(today: string, weekKey: string) {
  const yesterday = getYesterdayKST()

  if (!(await kv.get(`community:daily:${today}`))) {
    await kv.set(`community:daily:${today}`, { target: DEFAULT_COMMUNITY_DAILY, current: 0 }, { ex: 86400 })
  }

  if (!(await kv.get(`community:weekly:${weekKey}`))) {
    await kv.set(`community:weekly:${weekKey}`, { target: DEFAULT_COMMUNITY_WEEKLY, current: 0 }, { ex: 604800 })
  }

  if (!(await kv.get(`daily:goal:${today}`))) {
    const yesterdayGoal = await kv.get<any>(`daily:goal:${yesterday}`)
    if (yesterdayGoal?.song) {
      await kv.set(`daily:goal:${today}`, {
        song: yesterdayGoal.song,
        trackId: yesterdayGoal.trackId,
        target: yesterdayGoal.target || DEFAULT_SONG_GOAL_TARGET,
        current: 0
      }, { ex: 86400 })
    }
  }

  if (!(await kv.get(`daily:missions:${today}`))) {
    const yesterdayMissions = await kv.get<Mission[]>(`daily:missions:${yesterday}`)
    if (yesterdayMissions?.length) {
      const todayMissions = yesterdayMissions.map(m => ({ ...m, id: `${m.trackId}-${today}` }))
      await kv.set(`daily:missions:${today}`, todayMissions, { ex: 86400 })
    }
  }
}

/* =========================
  PROCESS SINGLE USER (manual refresh)
========================= */

async function processSingleUser(
  userId: string,
  today: string,
  weekKey: string,
  goals: { communityDaily: any; dailySongGoal: any; communityWeekly: any; missions: any }
) {
  const { communityDaily, dailySongGoal, communityWeekly, missions } = goals
  const statsfmUsername = await kv.get<string>(`user:${userId}:statsfm`)
  if (!statsfmUsername) return { newStreams: 0 }

  const lastProcessedKey = `user:${userId}:last_processed`
  const lastProcessed = (await kv.get<number>(lastProcessedKey)) || 0

  const res = await fetch(`https://api.stats.fm/api/v1/users/${statsfmUsername}/streams?limit=500`)
  if (!res.ok) throw new Error(`Failed to fetch streams: ${res.status}`)

  const data = await res.json()
  const streams = data.items || []

  const newStreams = streams.filter((s: any) => {
    const streamTime = new Date(s.endTime).getTime()
    return s.artistIds?.includes(ATEEZ_ARTIST_ID) && streamTime > lastProcessed
  })

  if (newStreams.length === 0) return { newStreams: 0 }

  console.log(`✅ Manual refresh: ${newStreams.length} new streams for ${statsfmUsername}`)

  await kv.incrby(`user:${userId}:total_streams`, newStreams.length)

  // Community Daily
  if (communityDaily) {
    const todayStreams = newStreams.filter((s: any) => {
      const kstDate = new Date(new Date(s.endTime).getTime() + 9 * 60 * 60 * 1000)
      return kstDate.toISOString().split("T")[0] === today
    })
    if (todayStreams.length > 0) {
      const userDailyKey = `community:daily:user:${userId}:${today}`
      const current = (await kv.get<number>(userDailyKey)) || 0
      const newTotal = current + todayStreams.length
      await kv.set(userDailyKey, newTotal, { ex: 86400 })
      const currentHighest = (await kv.get<number>(`user:${userId}:highest_daily_streams`)) || 0
      if (newTotal > currentHighest) await kv.set(`user:${userId}:highest_daily_streams`, newTotal)
    }
  }

  // Daily Song Goal
  if (dailySongGoal?.trackId) {
    const songStreams = newStreams.filter((s: any) => {
      const kstDate = new Date(new Date(s.endTime).getTime() + 9 * 60 * 60 * 1000)
      return kstDate.toISOString().split("T")[0] === today && s.trackId === dailySongGoal.trackId
    })
    if (songStreams.length > 0) {
      const userSongKey = `daily:streams:${userId}:${today}`
      const current = (await kv.get<number>(userSongKey)) || 0
      await kv.set(userSongKey, current + songStreams.length, { ex: 86400 })
    }
  } else if (dailySongGoal?.song) {
    const songStreams = newStreams.filter((s: any) => {
      const kstDate = new Date(new Date(s.endTime).getTime() + 9 * 60 * 60 * 1000)
      return kstDate.toISOString().split("T")[0] === today && s.trackName === dailySongGoal.song
    })
    if (songStreams.length > 0) {
      const userSongKey = `daily:streams:${userId}:${today}`
      const current = (await kv.get<number>(userSongKey)) || 0
      await kv.set(userSongKey, current + songStreams.length, { ex: 86400 })
    }
  }

  // Weekly Goal
  if (communityWeekly) {
    const weekStreams = newStreams.filter((s: any) => {
      const kstDate = new Date(new Date(s.endTime).getTime() + 9 * 60 * 60 * 1000)
      const streamDay = kstDate.getUTCDay()
      const daysSinceThursday = (streamDay + 7 - 4) % 7
      const thursday = new Date(kstDate)
      thursday.setUTCDate(kstDate.getUTCDate() - daysSinceThursday)
      thursday.setUTCHours(0, 0, 0, 0)
      const jan4 = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 4))
      const streamWeekNumber = Math.ceil(
        ((thursday.getTime() - jan4.getTime()) / 86400000 + jan4.getUTCDay() + 1) / 7
      ) + 1
      const streamWeekKey = `${thursday.getUTCFullYear()}-W${String(streamWeekNumber).padStart(2, "0")}`
      return streamWeekKey === weekKey
    })

    console.log(`Weekly check: ${newStreams.length} new streams, ${weekStreams.length} matched weekKey ${weekKey}`)
    
    if (weekStreams.length > 0) {
      const userWeeklyKey = `community:weekly:user:${userId}:${weekKey}`
      const current = (await kv.get<number>(userWeeklyKey)) || 0
      await kv.set(userWeeklyKey, current + weekStreams.length, { ex: 604800 })
    }
  }

  // Missions
  if (missions?.length > 0) {
    for (const mission of missions) {
      const missionStreams = newStreams.filter((s: any) => {
        const kstDate = new Date(new Date(s.endTime).getTime() + 9 * 60 * 60 * 1000)
        return kstDate.toISOString().split("T")[0] === today && s.trackId === mission.trackId
      })
      if (missionStreams.length > 0) {
        const progressKey = `mission:progress:${userId}:${today}:${mission.id}`
        const current = (await kv.get<number>(progressKey)) || 0
        await kv.set(progressKey, current + missionStreams.length, { ex: 86400 })
      }
    }
  }

  await kv.set(lastProcessedKey, Date.now(), { ex: 604800 })
  return { newStreams: newStreams.length }
}

/* =========================
  CRON HANDLER
========================= */

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = getKSTDate()
    const weekKey = getCurrentWeekKey()
    const now = Date.now()

    console.log(`🗓️ Date debug: UTC=${new Date().toISOString()}, KST date=${today}, weekKey=${weekKey}`)

    console.log(`🚀 Cron started at ${new Date(now).toISOString()}`)

    await ensureDefaultGoals(today, weekKey)

    const [communityDaily, dailySongGoal, communityWeekly, missions] = await Promise.all([
      kv.get<{ target: number; current?: number }>(`community:daily:${today}`),
      kv.get<{ song: string; trackId?: number; target: number; current?: number }>(`daily:goal:${today}`),
      kv.get<{ target: number; current?: number }>(`community:weekly:${weekKey}`),
      kv.get<Mission[]>(`daily:missions:${today}`)
    ])

    // Check if manual refresh
    let body: any = {}
    try { body = await request.json() } catch { }
    const { userId: manualUserId, manual } = body

    if (manual && manualUserId) {
      console.log(`🔄 Manual refresh for user ${manualUserId}`)
      const result = await processSingleUser(manualUserId, today, weekKey, {
        communityDaily, dailySongGoal, communityWeekly, missions
      })
      await recalculateGoalTotals(today, weekKey, communityDaily, dailySongGoal, communityWeekly)
      return NextResponse.json({ success: true, newStreams: result.newStreams, message: "Streams refreshed successfully" })
    }

    // Regular cron — process ALL users, no tier filtering
    const userKeys = await kv.keys("user:*:statsfm")
    console.log(`📊 Processing all ${userKeys.length} users...`)

    let usersProcessed = 0
    let usersSkipped = 0
    let newDailyStreams = 0
    let newDailySongStreams = 0
    let newWeeklyStreams = 0

    for (const key of userKeys) {
      try {
        const userId = key.split(":")[1]
        const statsfmUsername = await kv.get<string>(key)
        if (!statsfmUsername) { usersSkipped++; continue }

        const lastProcessedKey = `user:${userId}:last_processed`
        const lastProcessed = (await kv.get<number>(lastProcessedKey)) || 0

        const res = await fetch(`https://api.stats.fm/api/v1/users/${statsfmUsername}/streams?limit=500`)
        if (!res.ok) { usersSkipped++; continue }

        const data = await res.json()
        const streams = data.items || []

        const newStreams = streams.filter((s: any) => {
          const streamTime = new Date(s.endTime).getTime()
          return s.artistIds?.includes(ATEEZ_ARTIST_ID) && streamTime > lastProcessed
        })

        if (newStreams.length === 0) { usersSkipped++; continue }

        usersProcessed++
        console.log(`✅ ${newStreams.length} new streams for ${statsfmUsername}`)

        await kv.incrby(`user:${userId}:total_streams`, newStreams.length)

        // Community Daily
        if (communityDaily) {
          const todayStreams = newStreams.filter((s: any) => {
            const kstDate = new Date(new Date(s.endTime).getTime() + 9 * 60 * 60 * 1000)
            return kstDate.toISOString().split("T")[0] === today
          })
          if (todayStreams.length > 0) {
            newDailyStreams += todayStreams.length
            const userDailyKey = `community:daily:user:${userId}:${today}`
            const current = (await kv.get<number>(userDailyKey)) || 0
            const newTotal = current + todayStreams.length
            await kv.set(userDailyKey, newTotal, { ex: 86400 })
            const currentHighest = (await kv.get<number>(`user:${userId}:highest_daily_streams`)) || 0
            if (newTotal > currentHighest) await kv.set(`user:${userId}:highest_daily_streams`, newTotal)
          }
        }

        // Daily Song Goal
        if (dailySongGoal?.trackId) {
          const songStreams = newStreams.filter((s: any) => {
            const kstDate = new Date(new Date(s.endTime).getTime() + 9 * 60 * 60 * 1000)
            return kstDate.toISOString().split("T")[0] === today && s.trackId === dailySongGoal.trackId
          })
          if (songStreams.length > 0) {
            newDailySongStreams += songStreams.length
            const userSongKey = `daily:streams:${userId}:${today}`
            const current = (await kv.get<number>(userSongKey)) || 0
            await kv.set(userSongKey, current + songStreams.length, { ex: 86400 })
          }
        } else if (dailySongGoal?.song) {
          const songStreams = newStreams.filter((s: any) => {
            const kstDate = new Date(new Date(s.endTime).getTime() + 9 * 60 * 60 * 1000)
            return kstDate.toISOString().split("T")[0] === today && s.trackName === dailySongGoal.song
          })
          if (songStreams.length > 0) {
            newDailySongStreams += songStreams.length
            const userSongKey = `daily:streams:${userId}:${today}`
            const current = (await kv.get<number>(userSongKey)) || 0
            await kv.set(userSongKey, current + songStreams.length, { ex: 86400 })
          }
        }

        // Weekly Goal
        if (communityWeekly) {
          const weekStreams = newStreams.filter((s: any) => {
            const kstDate = new Date(new Date(s.endTime).getTime() + 9 * 60 * 60 * 1000)
            const streamDay = kstDate.getUTCDay()
            const daysSinceThursday = (streamDay + 7 - 4) % 7
            const thursday = new Date(kstDate)
            thursday.setUTCDate(kstDate.getUTCDate() - daysSinceThursday)
            thursday.setUTCHours(0, 0, 0, 0)
            const jan4 = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 4))
            const streamWeekNumber = Math.ceil(
              ((thursday.getTime() - jan4.getTime()) / 86400000 + jan4.getUTCDay() + 1) / 7
            ) + 1
            const streamWeekKey = `${thursday.getUTCFullYear()}-W${String(streamWeekNumber).padStart(2, "0")}`
            return streamWeekKey === weekKey
          })

          console.log(`Weekly check: ${newStreams.length} new streams, ${weekStreams.length} matched weekKey ${weekKey}`)

          if (weekStreams.length > 0) {
            newWeeklyStreams += weekStreams.length
            const userWeeklyKey = `community:weekly:user:${userId}:${weekKey}`
            const current = (await kv.get<number>(userWeeklyKey)) || 0
            await kv.set(userWeeklyKey, current + weekStreams.length, { ex: 604800 })
          }
        }

        // Missions
        if (missions && missions.length > 0) {
          for (const mission of missions) {
            const missionStreams = newStreams.filter((s: any) => {
              const kstDate = new Date(new Date(s.endTime).getTime() + 9 * 60 * 60 * 1000)
              return kstDate.toISOString().split("T")[0] === today && s.trackId === mission.trackId
            })
            if (missionStreams.length > 0) {
              const progressKey = `mission:progress:${userId}:${today}:${mission.id}`
              const current = (await kv.get<number>(progressKey)) || 0
              await kv.set(progressKey, current + missionStreams.length, { ex: 86400 })
            }
          }
        }

        await kv.set(lastProcessedKey, now, { ex: 604800 })

      } catch (error) {
        console.error(`❌ Error processing user ${key}:`, error)
        usersSkipped++
        continue
      }
    }

    // Recalculate all goal totals
    await recalculateGoalTotals(today, weekKey, communityDaily, dailySongGoal, communityWeekly)

    // Update streaks
    const yesterday = getYesterdayKST()
    let streaksUpdated = 0
    const allUserKeys = await kv.keys("user:*:statsfm")

    for (const userKey of allUserKeys) {
      try {
        const userId = userKey.split(":")[1]
        if (!missions || missions.length === 0) continue

        let allMissionsComplete = true
        for (const mission of missions) {
          const progress = (await kv.get<number>(`mission:progress:${userId}:${today}:${mission.id}`)) || 0
          if (progress < mission.target) { allMissionsComplete = false; break }
        }

        if (allMissionsComplete) {
          const currentStreak = (await kv.get<number>(`streak:${userId}`)) || 0
          const lastActive = await kv.get<string>(`streak:${userId}:last_active`)
          const longestStreak = (await kv.get<number>(`streak:${userId}:longest`)) || 0

          if (lastActive === today) continue

          let newStreak = 1
          if (lastActive === yesterday) newStreak = currentStreak + 1
          else if (lastActive && lastActive < yesterday) newStreak = 1

          await kv.set(`streak:${userId}`, newStreak)
          await kv.set(`streak:${userId}:last_active`, today)
          if (newStreak > longestStreak) await kv.set(`streak:${userId}:longest`, newStreak)
          await kv.incr(`user:${userId}:total_mission_sets`)
          streaksUpdated++
        }
      } catch (error) {
        console.error(`❌ Streak error for ${userKey}:`, error)
        continue
      }
    }

    console.log(`📊 Done: ${usersProcessed} processed, ${usersSkipped} skipped, ${streaksUpdated} streaks updated`)

    return NextResponse.json({
      success: true,
      processed: { users: usersProcessed, skipped: usersSkipped, daily: newDailyStreams, song: newDailySongStreams, weekly: newWeeklyStreams },
      date: today,
      week: weekKey
    })

  } catch (error) {
    console.error("❌ Cron error:", error)
    return NextResponse.json({ error: "Cron failed" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  return POST(request)
}