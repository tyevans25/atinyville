import { kv } from "@vercel/kv"
import { NextResponse } from "next/server"

// ATEEZ artist ID on stats.fm
const ATEEZ_ARTIST_ID = 164828

// DEFAULT GOALS
const DEFAULT_COMMUNITY_DAILY = 10000
const DEFAULT_COMMUNITY_WEEKLY = 50000
const DEFAULT_SONG_GOAL_TARGET = 5000

interface Mission {
  id: string
  trackId: number
  trackName: string
  target: number
}

// Helper: Get current date in KST (Korea Standard Time, UTC+9)
function getKSTDate(): string {
  const now = new Date()
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000))
  return kstTime.toISOString().split('T')[0]
}

// Helper: Get current week key (YYYY-W##)
function getCurrentWeekKey(): string {
  const now = new Date()
  const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000))
  const year = kstNow.getUTCFullYear()
  const startOfYear = new Date(Date.UTC(year, 0, 1))
  const days = Math.floor((kstNow.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  const weekNumber = Math.ceil((days + startOfYear.getUTCDay() + 1) / 7)
  return `${year}-W${String(weekNumber).padStart(2, '0')}`
}

// Helper: Get yesterday's date in KST
function getYesterdayKST(): string {
  const now = new Date()
  const yesterday = new Date(now.getTime() + (9 * 60 * 60 * 1000) - (24 * 60 * 60 * 1000))
  return yesterday.toISOString().split('T')[0]
}

// Helper: Set default goals if they don't exist
async function ensureDefaultGoals(today: string, weekKey: string) {
  const yesterday = getYesterdayKST()
  
  const communityDailyKey = `community:daily:${today}`
  const communityWeeklyKey = `community:weekly:${weekKey}`
  const dailySongGoalKey = `daily:goal:${today}`
  const missionsKey = `daily:missions:${today}`
  
  // Check and set daily community goal
  const dailyGoal = await kv.get(communityDailyKey)
  if (!dailyGoal) {
    await kv.set(communityDailyKey, { target: DEFAULT_COMMUNITY_DAILY, current: 0 }, { ex: 86400 })
    console.log(`✅ Set default daily community goal: ${DEFAULT_COMMUNITY_DAILY}`)
  }
  
  // Check and set weekly community goal
  const weeklyGoal = await kv.get(communityWeeklyKey)
  if (!weeklyGoal) {
    await kv.set(communityWeeklyKey, { target: DEFAULT_COMMUNITY_WEEKLY, current: 0 }, { ex: 604800 })
    console.log(`✅ Set default weekly community goal: ${DEFAULT_COMMUNITY_WEEKLY}`)
  }
  
  // Check and set daily song goal (copy from yesterday)
  const songGoal = await kv.get(dailySongGoalKey)
  if (!songGoal) {
    const yesterdaySongGoalKey = `daily:goal:${yesterday}`
    const yesterdaySongGoal = await kv.get<{ song: string; target: number }>(yesterdaySongGoalKey)
    
    if (yesterdaySongGoal?.song) {
      await kv.set(dailySongGoalKey, {
        song: yesterdaySongGoal.song,
        target: yesterdaySongGoal.target || DEFAULT_SONG_GOAL_TARGET,
        current: 0
      }, { ex: 86400 })
      console.log(`✅ Copied yesterday's song goal: "${yesterdaySongGoal.song}" (${yesterdaySongGoal.target})`)
    }
  }
  
  // Check and set missions (copy from yesterday)
  const missions = await kv.get(missionsKey)
  if (!missions || (Array.isArray(missions) && missions.length === 0)) {
    const yesterdayMissionsKey = `daily:missions:${yesterday}`
    const yesterdayMissions = await kv.get<Mission[]>(yesterdayMissionsKey)
    
    if (yesterdayMissions && yesterdayMissions.length > 0) {
      // Update mission IDs to include today's date
      const todayMissions = yesterdayMissions.map(m => ({
        ...m,
        id: `${m.trackId}-${today}`
      }))
      
      await kv.set(missionsKey, todayMissions, { ex: 86400 })
      console.log(`✅ Copied ${todayMissions.length} missions from yesterday`)
    }
  }
}

export async function GET(request: Request) {
  try {
    // --- Cron auth check ---
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = getKSTDate()
    const weekKey = getCurrentWeekKey()
    const cronRunTime = Date.now()

    // --- Ensure default goals exist ---
    await ensureDefaultGoals(today, weekKey)

    // --- Keys ---
    const communityDailyKey = `community:daily:${today}`
    const dailySongGoalKey = `daily:goal:${today}`
    const communityWeeklyKey = `community:weekly:${weekKey}`
    const missionsKey = `daily:missions:${today}`

    // --- Load goals and missions ---
    const [communityDaily, dailySongGoal, communityWeekly, missions] = await Promise.all([
      kv.get<{ target: number; current?: number }>(communityDailyKey),
      kv.get<{ song: string; target: number; current?: number }>(dailySongGoalKey),
      kv.get<{ target: number; current?: number }>(communityWeeklyKey),
      kv.get<Mission[]>(missionsKey)
    ])

    // --- Initialize NEW stream counters ---
    let newDailyStreams = 0
    let newDailySongStreams = 0
    let newWeeklyStreams = 0
    let usersProcessed = 0

    // --- Fetch all users with stats.fm ---
    const userKeys = await kv.keys("user:*:statsfm")

    for (const key of userKeys) {
      try {
        const userId = key.split(":")[1]
        const statsfmUsername = await kv.get<string>(key)
        
        if (!statsfmUsername) continue

        const lastProcessedKey = `user:${userId}:last_processed`
        const lastProcessed = await kv.get<number>(lastProcessedKey) || 0

        // Fetch streams
        const res = await fetch(`https://api.stats.fm/api/v1/users/${statsfmUsername}/streams?limit=500`)
        if (!res.ok) continue

        const data = await res.json()
        const streams = data.items || []

        // Filter ATEEZ streams newer than last processed
        const newStreams = streams.filter((s: any) => {
          const streamTime = new Date(s.endTime).getTime()
          return s.artistIds?.includes(ATEEZ_ARTIST_ID) && streamTime > lastProcessed
        })

        if (newStreams.length === 0) continue

        usersProcessed++

        // --- Process streams for each goal ---
        
        // Community Daily Goal (ANY ATEEZ)
        if (communityDaily) {
          const todayStreams = newStreams.filter((s: any) => {
            const streamDate = new Date(s.endTime)
            const kstDate = new Date(streamDate.getTime() + (9 * 60 * 60 * 1000))
            return kstDate.toISOString().split('T')[0] === today
          })

          if (todayStreams.length > 0) {
            newDailyStreams += todayStreams.length

            const userDailyKey = `community:daily:user:${userId}:${today}`
            const currentUserDaily = await kv.get<number>(userDailyKey) || 0
            await kv.set(userDailyKey, currentUserDaily + todayStreams.length, { ex: 86400 })
          }
        }

        // Daily Song Goal (SPECIFIC song)
        if (dailySongGoal?.song) {
          const songStreams = newStreams.filter((s: any) => {
            const streamDate = new Date(s.endTime)
            const kstDate = new Date(streamDate.getTime() + (9 * 60 * 60 * 1000))
            return kstDate.toISOString().split('T')[0] === today && 
                   s.trackName === dailySongGoal.song
          })

          if (songStreams.length > 0) {
            newDailySongStreams += songStreams.length

            const userSongKey = `daily:streams:${userId}:${today}`
            const currentUserSong = await kv.get<number>(userSongKey) || 0
            await kv.set(userSongKey, currentUserSong + songStreams.length, { ex: 86400 })
          }
        }

        // Weekly Goal (ANY ATEEZ)
        if (communityWeekly) {
          const weekStreams = newStreams.filter((s: any) => {
            const streamDate = new Date(s.endTime)
            const kstDate = new Date(streamDate.getTime() + (9 * 60 * 60 * 1000))
            const streamYear = kstDate.getUTCFullYear()
            const startOfYear = new Date(Date.UTC(streamYear, 0, 1))
            const days = Math.floor((kstDate.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
            const streamWeekNumber = Math.ceil((days + startOfYear.getUTCDay() + 1) / 7)
            const streamWeekKey = `${streamYear}-W${String(streamWeekNumber).padStart(2, '0')}`
            return streamWeekKey === weekKey
          })

          if (weekStreams.length > 0) {
            newWeeklyStreams += weekStreams.length

            const userWeeklyKey = `community:weekly:user:${userId}:${weekKey}`
            const currentUserWeekly = await kv.get<number>(userWeeklyKey) || 0
            await kv.set(userWeeklyKey, currentUserWeekly + weekStreams.length, { ex: 604800 })
          }
        }

        // Missions
        if (missions && missions.length > 0) {
          for (const mission of missions) {
            const missionStreams = newStreams.filter((s: any) => {
              const streamDate = new Date(s.endTime)
              const kstDate = new Date(streamDate.getTime() + (9 * 60 * 60 * 1000))
              return kstDate.toISOString().split('T')[0] === today && 
                     s.trackId === mission.trackId
            })

            if (missionStreams.length > 0) {
              const progressKey = `mission:progress:${userId}:${today}:${mission.id}`
              const current = await kv.get<number>(progressKey) || 0
              await kv.set(progressKey, current + missionStreams.length, { ex: 86400 })
            }
          }
        }

        // Update last processed timestamp
        await kv.set(lastProcessedKey, cronRunTime, { ex: 604800 })

      } catch (error) {
        console.error(`Error processing user ${key}:`, error)
      }
    }

    // --- Update goal totals ---
    if (communityDaily && newDailyStreams > 0) {
      const current = (communityDaily.current || 0) + newDailyStreams
      await kv.set(communityDailyKey, { ...communityDaily, current }, { ex: 86400 })
    }

    if (dailySongGoal && newDailySongStreams > 0) {
      const current = (dailySongGoal.current || 0) + newDailySongStreams
      await kv.set(dailySongGoalKey, { ...dailySongGoal, current }, { ex: 86400 })
    }

    if (communityWeekly && newWeeklyStreams > 0) {
      const current = (communityWeekly.current || 0) + newWeeklyStreams
      await kv.set(communityWeeklyKey, { ...communityWeekly, current }, { ex: 604800 })
    }

    return NextResponse.json({
      success: true,
      processed: {
        users: usersProcessed,
        daily: newDailyStreams,
        song: newDailySongStreams,
        weekly: newWeeklyStreams
      },
      date: today,
      week: weekKey
    })

  } catch (error) {
    console.error("Cron error:", error)
    return NextResponse.json({ error: "Cron failed" }, { status: 500 })
  }
}