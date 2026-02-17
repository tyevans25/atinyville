import { kv } from "@vercel/kv"
import { NextResponse } from "next/server"

const ATEEZ_ARTIST_ID = 164828

const DEFAULT_COMMUNITY_DAILY = 10000
const DEFAULT_COMMUNITY_WEEKLY = 50000
const DEFAULT_SONG_GOAL_TARGET = 5000

const TIER_INTERVALS = {
  free: 60,
  bronze: 30,
  silver: 15,
  gold: 10,
  platinum: 5
}

interface Mission {
  id: string
  trackId: number
  trackName: string
  target: number
}

function getKSTDate(): string {
  const now = new Date()
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000))
  return kstTime.toISOString().split('T')[0]
}

function getCurrentWeekKey(): string {
  const now = new Date()
  const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000))
  const kstDay = kstNow.getUTCDay()
  const daysSinceThursday = (kstDay + 7 - 4) % 7
  const thisWeekThursday = new Date(kstNow)
  thisWeekThursday.setUTCDate(kstNow.getUTCDate() - daysSinceThursday)
  thisWeekThursday.setUTCHours(0, 0, 0, 0)
  const year = thisWeekThursday.getUTCFullYear()
  const startOfYear = new Date(Date.UTC(year, 0, 1))
  const firstThursday = new Date(startOfYear)
  const daysUntilThursday = (4 - startOfYear.getUTCDay() + 7) % 7
  firstThursday.setUTCDate(1 + daysUntilThursday)
  const weekNumber = Math.floor((thisWeekThursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
  return `${year}-W${String(weekNumber).padStart(2, '0')}`
}

function getYesterdayKST(): string {
  const now = new Date()
  const yesterday = new Date(now.getTime() + (9 * 60 * 60 * 1000) - (24 * 60 * 60 * 1000))
  return yesterday.toISOString().split('T')[0]
}

// ✅ HELPER: Recalculate all goal totals from user contributions
async function recalculateGoalTotals(
  today: string,
  weekKey: string,
  communityDaily: any,
  dailySongGoal: any,
  communityWeekly: any
) {
  const communityDailyKey = `community:daily:${today}`
  const dailySongGoalKey = `daily:goal:${today}`
  const communityWeeklyKey = `community:weekly:${weekKey}`

  if (communityDaily) {
    const userDailyKeys = await kv.keys(`community:daily:user:*:${today}`)
    let total = 0
    for (const key of userDailyKeys) {
      total += await kv.get<number>(key) || 0
    }
    await kv.set(communityDailyKey, { ...communityDaily, current: total }, { ex: 86400 })
    console.log(`✅ Daily goal recalculated: ${total} streams`)
  }

  if (dailySongGoal) {
    const userSongKeys = await kv.keys(`daily:streams:*:${today}`)
    let total = 0
    for (const key of userSongKeys) {
      total += await kv.get<number>(key) || 0
    }
    await kv.set(dailySongGoalKey, { ...dailySongGoal, current: total }, { ex: 86400 })
    console.log(`✅ Song goal recalculated: ${total} streams`)
  }

  if (communityWeekly) {
    const userWeeklyKeys = await kv.keys(`community:weekly:user:*:${weekKey}`)
    let total = 0
    for (const key of userWeeklyKeys) {
      total += await kv.get<number>(key) || 0
    }
    await kv.set(communityWeeklyKey, { ...communityWeekly, current: total }, { ex: 604800 })
    console.log(`✅ Weekly goal recalculated: ${total} streams`)
  }
}

async function ensureDefaultGoals(today: string, weekKey: string) {
  const yesterday = getYesterdayKST()
  const communityDailyKey = `community:daily:${today}`
  const communityWeeklyKey = `community:weekly:${weekKey}`
  const dailySongGoalKey = `daily:goal:${today}`
  const missionsKey = `daily:missions:${today}`

  const dailyGoal = await kv.get(communityDailyKey)
  if (!dailyGoal) {
    await kv.set(communityDailyKey, { target: DEFAULT_COMMUNITY_DAILY, current: 0 }, { ex: 86400 })
  }

  const weeklyGoal = await kv.get(communityWeeklyKey)
  if (!weeklyGoal) {
    await kv.set(communityWeeklyKey, { target: DEFAULT_COMMUNITY_WEEKLY, current: 0 }, { ex: 604800 })
  }

  const songGoal = await kv.get(dailySongGoalKey)
  if (!songGoal) {
    const yesterdaySongGoal = await kv.get<{ song: string; trackId?: number; target: number }>(`daily:goal:${yesterday}`)
    if (yesterdaySongGoal?.song) {
      await kv.set(dailySongGoalKey, {
        song: yesterdaySongGoal.song,
        trackId: yesterdaySongGoal.trackId,
        target: yesterdaySongGoal.target || DEFAULT_SONG_GOAL_TARGET,
        current: 0
      }, { ex: 86400 })
    }
  }

  const missions = await kv.get(missionsKey)
  if (!missions || (Array.isArray(missions) && missions.length === 0)) {
    const yesterdayMissions = await kv.get<Mission[]>(`daily:missions:${yesterday}`)
    if (yesterdayMissions && yesterdayMissions.length > 0) {
      const todayMissions = yesterdayMissions.map(m => ({ ...m, id: `${m.trackId}-${today}` }))
      await kv.set(missionsKey, todayMissions, { ex: 86400 })
    }
  }
}

async function processSingleUser(
  userId: string,
  today: string,
  weekKey: string,
  goals: {
    communityDaily: any
    dailySongGoal: any
    communityWeekly: any
    missions: any
  }
) {
  const { communityDaily, dailySongGoal, communityWeekly, missions } = goals
  const statsfmUsername = await kv.get<string>(`user:${userId}:statsfm`)

  if (!statsfmUsername) return { newStreams: 0 }

  const lastProcessedKey = `user:${userId}:last_processed_manual`
  const lastProcessed = await kv.get<number>(lastProcessedKey) || 0

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

  // Community Daily Goal
  if (communityDaily) {
    const todayStreams = newStreams.filter((s: any) => {
      const kstDate = new Date(new Date(s.endTime).getTime() + (9 * 60 * 60 * 1000))
      return kstDate.toISOString().split('T')[0] === today
    })
    if (todayStreams.length > 0) {
      const userDailyKey = `community:daily:user:${userId}:${today}`
      const currentUserDaily = await kv.get<number>(userDailyKey) || 0
      const newTotal = currentUserDaily + todayStreams.length
      await kv.set(userDailyKey, newTotal, { ex: 86400 })
      const currentHighest = await kv.get<number>(`user:${userId}:highest_daily_streams`) || 0
      if (newTotal > currentHighest) {
        await kv.set(`user:${userId}:highest_daily_streams`, newTotal)
      }
    }
  }

  // Daily Song Goal
  if (dailySongGoal?.trackId) {
    const songStreams = newStreams.filter((s: any) => {
      const kstDate = new Date(new Date(s.endTime).getTime() + (9 * 60 * 60 * 1000))
      return kstDate.toISOString().split('T')[0] === today && s.trackId === dailySongGoal.trackId
    })
    if (songStreams.length > 0) {
      const userSongKey = `daily:streams:${userId}:${today}`
      const current = await kv.get<number>(userSongKey) || 0
      await kv.set(userSongKey, current + songStreams.length, { ex: 86400 })
    }
  } else if (dailySongGoal?.song) {
    const songStreams = newStreams.filter((s: any) => {
      const kstDate = new Date(new Date(s.endTime).getTime() + (9 * 60 * 60 * 1000))
      return kstDate.toISOString().split('T')[0] === today && s.trackName === dailySongGoal.song
    })
    if (songStreams.length > 0) {
      const userSongKey = `daily:streams:${userId}:${today}`
      const current = await kv.get<number>(userSongKey) || 0
      await kv.set(userSongKey, current + songStreams.length, { ex: 86400 })
    }
  }

  // Weekly Goal
  if (communityWeekly) {
    const weekStreams = newStreams.filter((s: any) => {
      const kstDate = new Date(new Date(s.endTime).getTime() + (9 * 60 * 60 * 1000))
      const streamDay = kstDate.getUTCDay()
      const daysSinceThursday = (streamDay + 7 - 4) % 7
      const streamWeekThursday = new Date(kstDate)
      streamWeekThursday.setUTCDate(kstDate.getUTCDate() - daysSinceThursday)
      streamWeekThursday.setUTCHours(0, 0, 0, 0)
      const streamYear = streamWeekThursday.getUTCFullYear()
      const startOfYear = new Date(Date.UTC(streamYear, 0, 1))
      const firstThursday = new Date(startOfYear)
      const daysUntilThursday = (4 - startOfYear.getUTCDay() + 7) % 7
      firstThursday.setUTCDate(1 + daysUntilThursday)
      const streamWeekNumber = Math.floor((streamWeekThursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
      const streamWeekKey = `${streamYear}-W${String(streamWeekNumber).padStart(2, '0')}`
      return streamWeekKey === weekKey
    })
    if (weekStreams.length > 0) {
      const userWeeklyKey = `community:weekly:user:${userId}:${weekKey}`
      const current = await kv.get<number>(userWeeklyKey) || 0
      await kv.set(userWeeklyKey, current + weekStreams.length, { ex: 604800 })
    }
  }

  // Missions
  if (missions && missions.length > 0) {
    for (const mission of missions) {
      const missionStreams = newStreams.filter((s: any) => {
        const kstDate = new Date(new Date(s.endTime).getTime() + (9 * 60 * 60 * 1000))
        return kstDate.toISOString().split('T')[0] === today && s.trackId === mission.trackId
      })
      if (missionStreams.length > 0) {
        const progressKey = `mission:progress:${userId}:${today}:${mission.id}`
        const current = await kv.get<number>(progressKey) || 0
        await kv.set(progressKey, current + missionStreams.length, { ex: 86400 })
      }
    }
  }

  await kv.set(lastProcessedKey, Date.now(), { ex: 604800 })

  return { newStreams: newStreams.length }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = getKSTDate()
    const weekKey = getCurrentWeekKey()
    const now = Date.now()

    console.log(`🚀 Cron started at ${new Date(now).toISOString()}`)

    await ensureDefaultGoals(today, weekKey)

    const communityDailyKey = `community:daily:${today}`
    const dailySongGoalKey = `daily:goal:${today}`
    const communityWeeklyKey = `community:weekly:${weekKey}`
    const missionsKey = `daily:missions:${today}`

    const [communityDaily, dailySongGoal, communityWeekly, missions] = await Promise.all([
      kv.get<{ target: number; current?: number }>(communityDailyKey),
      kv.get<{ song: string; trackId?: number; target: number; current?: number }>(dailySongGoalKey),
      kv.get<{ target: number; current?: number }>(communityWeeklyKey),
      kv.get<Mission[]>(missionsKey)
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

      // ✅ Recalculate totals after manual refresh too!
      await recalculateGoalTotals(today, weekKey, communityDaily, dailySongGoal, communityWeekly)

      return NextResponse.json({
        success: true,
        newStreams: result.newStreams,
        message: 'Streams refreshed successfully'
      })
    }

    // Regular cron - process all users
    const userKeys = await kv.keys("user:*:statsfm")
    const usersToProcess: string[] = []

    for (const key of userKeys) {
      const userId = key.split(":")[1]
      const tier = await kv.get<string>(`user:${userId}:tier`) || 'free'
      const interval = TIER_INTERVALS[tier as keyof typeof TIER_INTERVALS] || 60
      const lastProcessed = await kv.get<number>(`user:${userId}:last_processed_cron`) || 0
      const timeSinceLastCheck = now - lastProcessed

      if (timeSinceLastCheck >= interval * 60 * 1000) {
        usersToProcess.push(key)
      } else {
        const minutesRemaining = Math.ceil((interval * 60 * 1000 - timeSinceLastCheck) / 60000)
        console.log(`⏭️ Skipping ${userId} (${tier} tier) - ${minutesRemaining}min remaining`)
      }
    }

    console.log(`✅ Processing ${usersToProcess.length} of ${userKeys.length} users`)

    let usersProcessed = 0
    let usersSkipped = 0
    let newDailyStreams = 0
    let newDailySongStreams = 0
    let newWeeklyStreams = 0

    for (const key of usersToProcess) {
      try {
        const userId = key.split(":")[1]
        const statsfmUsername = await kv.get<string>(key)

        if (!statsfmUsername) { usersSkipped++; continue }

        const lastProcessedKey = `user:${userId}:last_processed_cron`
        const lastProcessed = await kv.get<number>(lastProcessedKey) || 0

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
            const kstDate = new Date(new Date(s.endTime).getTime() + (9 * 60 * 60 * 1000))
            return kstDate.toISOString().split('T')[0] === today
          })
          if (todayStreams.length > 0) {
            newDailyStreams += todayStreams.length
            const userDailyKey = `community:daily:user:${userId}:${today}`
            const current = await kv.get<number>(userDailyKey) || 0
            const newTotal = current + todayStreams.length
            await kv.set(userDailyKey, newTotal, { ex: 86400 })
            const currentHighest = await kv.get<number>(`user:${userId}:highest_daily_streams`) || 0
            if (newTotal > currentHighest) await kv.set(`user:${userId}:highest_daily_streams`, newTotal)
          }
        }

        // Daily Song Goal
        if (dailySongGoal?.trackId) {
          const songStreams = newStreams.filter((s: any) => {
            const kstDate = new Date(new Date(s.endTime).getTime() + (9 * 60 * 60 * 1000))
            return kstDate.toISOString().split('T')[0] === today && s.trackId === dailySongGoal.trackId
          })
          if (songStreams.length > 0) {
            newDailySongStreams += songStreams.length
            const userSongKey = `daily:streams:${userId}:${today}`
            const current = await kv.get<number>(userSongKey) || 0
            await kv.set(userSongKey, current + songStreams.length, { ex: 86400 })
          }
        } else if (dailySongGoal?.song) {
          const songStreams = newStreams.filter((s: any) => {
            const kstDate = new Date(new Date(s.endTime).getTime() + (9 * 60 * 60 * 1000))
            return kstDate.toISOString().split('T')[0] === today && s.trackName === dailySongGoal.song
          })
          if (songStreams.length > 0) {
            newDailySongStreams += songStreams.length
            const userSongKey = `daily:streams:${userId}:${today}`
            const current = await kv.get<number>(userSongKey) || 0
            await kv.set(userSongKey, current + songStreams.length, { ex: 86400 })
          }
        }

        // Weekly Goal
        if (communityWeekly) {
          const weekStreams = newStreams.filter((s: any) => {
            const kstDate = new Date(new Date(s.endTime).getTime() + (9 * 60 * 60 * 1000))
            const streamDay = kstDate.getUTCDay()
            const daysSinceThursday = (streamDay + 7 - 4) % 7
            const streamWeekThursday = new Date(kstDate)
            streamWeekThursday.setUTCDate(kstDate.getUTCDate() - daysSinceThursday)
            streamWeekThursday.setUTCHours(0, 0, 0, 0)
            const streamYear = streamWeekThursday.getUTCFullYear()
            const startOfYear = new Date(Date.UTC(streamYear, 0, 1))
            const firstThursday = new Date(startOfYear)
            const daysUntilThursday = (4 - startOfYear.getUTCDay() + 7) % 7
            firstThursday.setUTCDate(1 + daysUntilThursday)
            const streamWeekNumber = Math.floor((streamWeekThursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
            const streamWeekKey = `${streamYear}-W${String(streamWeekNumber).padStart(2, '0')}`
            return streamWeekKey === weekKey
          })
          if (weekStreams.length > 0) {
            newWeeklyStreams += weekStreams.length
            const userWeeklyKey = `community:weekly:user:${userId}:${weekKey}`
            const current = await kv.get<number>(userWeeklyKey) || 0
            await kv.set(userWeeklyKey, current + weekStreams.length, { ex: 604800 })
          }
        }

        // Missions
        if (missions && missions.length > 0) {
          for (const mission of missions) {
            const missionStreams = newStreams.filter((s: any) => {
              const kstDate = new Date(new Date(s.endTime).getTime() + (9 * 60 * 60 * 1000))
              return kstDate.toISOString().split('T')[0] === today && s.trackId === mission.trackId
            })
            if (missionStreams.length > 0) {
              const progressKey = `mission:progress:${userId}:${today}:${mission.id}`
              const current = await kv.get<number>(progressKey) || 0
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

    // ✅ Recalculate goal totals after ALL users processed
    await recalculateGoalTotals(today, weekKey, communityDaily, dailySongGoal, communityWeekly)

    // Check streaks
    const yesterday = getYesterdayKST()
    let streaksUpdated = 0
    const allUserKeys = await kv.keys("user:*:statsfm")

    for (const userKey of allUserKeys) {
      try {
        const userId = userKey.split(":")[1]
        if (!missions || missions.length === 0) continue

        let allMissionsComplete = true
        for (const mission of missions) {
          const progress = await kv.get<number>(`mission:progress:${userId}:${today}:${mission.id}`) || 0
          if (progress < mission.target) { allMissionsComplete = false; break }
        }

        if (allMissionsComplete) {
          const streakKey = `streak:${userId}`
          const lastActiveKey = `streak:${userId}:last_active`
          const longestKey = `streak:${userId}:longest`
          const currentStreak = await kv.get<number>(streakKey) || 0
          const lastActive = await kv.get<string>(lastActiveKey)
          const longestStreak = await kv.get<number>(longestKey) || 0

          if (lastActive === today) continue

          let newStreak = 1
          if (lastActive === yesterday) newStreak = currentStreak + 1
          else if (lastActive && lastActive < yesterday) newStreak = 1

          await kv.set(streakKey, newStreak)
          await kv.set(lastActiveKey, today)
          if (newStreak > longestStreak) await kv.set(longestKey, newStreak)
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

// Allow Vercel cron to call via GET
export async function GET(request: Request) {
  return POST(request)
}