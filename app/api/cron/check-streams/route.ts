import { kv } from "@vercel/kv"
import { NextResponse } from "next/server"
import { appendFocusMVSnapshot } from "@/lib/focus-mv-snapshot"

const ATEEZ_ARTIST_ID = 164828

const DEFAULT_COMMUNITY_DAILY = 10000
const DEFAULT_COMMUNITY_WEEKLY = 50000
const DEFAULT_SONG_GOAL_TARGET = 5000

interface Mission {
  id: string
  trackId: number
  trackIds?: number[]
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

function secondsUntilEndOfNextKSTDay(): number {
  const now = new Date()
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const endOfNextDay = new Date(Date.UTC(
    kstNow.getUTCFullYear(),
    kstNow.getUTCMonth(),
    kstNow.getUTCDate() + 2,
    0, 0, 0
  ) - 9 * 60 * 60 * 1000)
  return Math.floor((endOfNextDay.getTime() - now.getTime()) / 1000)
}

function normalizeSongName(trackName?: string): string {
  if (!trackName) return ""

  return trackName
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s*\[[^\]]*\]/g, "")
    .replace(/\s+-\s+(remaster(ed)?|mix|version|ver\.?|instrumental|live|japanese ver\.?|english ver\.?|sped up|slowed).*$/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/ version$/, "")
}

function matchesMissionStream(stream: any, mission: Mission): boolean {
  const missionTrackIds = new Set([mission.trackId, ...(mission.trackIds || [])].map((trackId) => Number(trackId)))
  if (missionTrackIds.has(Number(stream.trackId))) {
    return true
  }

  return normalizeSongName(stream.trackName) === normalizeSongName(mission.trackName)
}

function matchesDailyGoalStream(stream: any, dailySongGoal: any): boolean {
  const goalTrackIds = new Set([
    ...(dailySongGoal?.trackIds || []),
    ...(dailySongGoal?.trackId ? [dailySongGoal.trackId] : [])
  ].map((trackId) => Number(trackId)))

  if (goalTrackIds.size > 0 && goalTrackIds.has(Number(stream.trackId))) {
    return true
  }

  return normalizeSongName(stream.trackName) === normalizeSongName(dailySongGoal?.song)
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
    const platformTotals: Record<string, number> = {}
    for (const key of userDailyKeys) {
      const streams = (await kv.get<number>(key)) || 0
      total += streams
      try {
        const userId = key.split(':')[3]
        const platform = (await kv.get<string>(`user:${userId}:platform`)) || 'spotify'
        platformTotals[platform] = (platformTotals[platform] || 0) + streams
      } catch {}
    }
    await kv.set(`community:daily:${today}`, { ...communityDaily, current: total }, { ex: 86400 })
    await Promise.all(Object.entries(platformTotals).map(([p, count]) =>
      kv.set(`platform:daily:${p}:${today}`, count, { ex: 86400 })
    )).catch(() => {})
    console.log(`✅ Daily goal recalculated: ${total} streams | platforms: ${JSON.stringify(platformTotals)}`)
  }

  if (dailySongGoal) {
    const userSongKeys = await kv.keys(`daily:streams:*:${today}`)
    let total = 0
    const platformTotals: Record<string, number> = {}
    for (const key of userSongKeys) {
      const streams = (await kv.get<number>(key)) || 0
      total += streams
      try {
        const userId = key.split(':')[2]
        const platform = (await kv.get<string>(`user:${userId}:platform`)) || 'spotify'
        platformTotals[platform] = (platformTotals[platform] || 0) + streams
      } catch {}
    }
    await kv.set(`daily:goal:${today}`, { ...dailySongGoal, current: total }, { ex: secondsUntilEndOfNextKSTDay() })
    await Promise.all(Object.entries(platformTotals).map(([p, count]) =>
      kv.set(`platform:song:${p}:${today}`, count, { ex: secondsUntilEndOfNextKSTDay() })
    )).catch(() => {})
    console.log(`✅ Song goal recalculated: ${total} streams`)
  }

  if (communityWeekly) {
    const userWeeklyKeys = await kv.keys(`community:weekly:user:*:${weekKey}`)
    let total = 0
    const platformTotals: Record<string, number> = {}
    for (const key of userWeeklyKeys) {
      const streams = (await kv.get<number>(key)) || 0
      total += streams
      try {
        const userId = key.split(':')[3]
        const platform = (await kv.get<string>(`user:${userId}:platform`)) || 'spotify'
        platformTotals[platform] = (platformTotals[platform] || 0) + streams
      } catch {}
    }
    await kv.set(`community:weekly:${weekKey}`, { ...communityWeekly, current: total }, { ex: 604800 })
    await Promise.all(Object.entries(platformTotals).map(([p, count]) =>
      kv.set(`platform:weekly:${p}:${weekKey}`, count, { ex: 604800 })
    )).catch(() => {})
    console.log(`✅ Weekly goal recalculated: ${total} streams`)
  }
}

const CATALOG_KEY = 'ateez:songs:catalog'
const KV_PREFIX = process.env.NODE_ENV === 'development' ? 'dev:' : ''

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
        trackIds: yesterdayGoal.trackIds || (yesterdayGoal.trackId ? [yesterdayGoal.trackId] : []),
        target: yesterdayGoal.target || DEFAULT_SONG_GOAL_TARGET,
        current: 0
      }, { ex: secondsUntilEndOfNextKSTDay() })
    }
  }

  if (!(await kv.get(`${KV_PREFIX}daily:missions:${today}`))) {
    await autoGenerateMissions(today)
  }
}

async function autoGenerateMissions(today: string) {
  const dailyGoal = await kv.get<any>(`daily:goal:${today}`)
  const catalog = await kv.get<Record<string, any>>(CATALOG_KEY) || {}

  // Deduplicate catalog entries by normalized name, split into title/other
  const seenNames = new Set<string>()
  const titleTracks: any[] = []
  const otherTracks: any[] = []

  for (const entry of Object.values(catalog)) {
    const normalized = normalizeSongName(entry.trackName)
    if (seenNames.has(normalized)) continue
    seenNames.add(normalized)
    if (entry.titleTrack) titleTracks.push(entry)
    else otherTracks.push(entry)
  }

  // Sort deterministically
  titleTracks.sort((a, b) => a.trackName.localeCompare(b.trackName))
  otherTracks.sort((a, b) => a.trackName.localeCompare(b.trackName))

  const missions: Mission[] = []
  const focusTrackId = dailyGoal?.trackId ? Number(dailyGoal.trackId) : null

  // Mission 1: Focus song (mirrors the daily goal)
  if (dailyGoal?.song && focusTrackId) {
    missions.push({
      id: `focus-${today}`,
      trackId: focusTrackId,
      trackIds: dailyGoal.trackIds || [focusTrackId],
      trackName: dailyGoal.song,
      target: 5,
    })
  }

  // Missions 2–3: Rotating title track pair, swaps every 2 days
  const available = titleTracks.filter(t => Number(t.trackId) !== focusTrackId)
  if (available.length >= 2) {
    const [year, month, day] = today.split('-').map(Number)
    const epoch = Date.UTC(2024, 0, 1)
    const dayNum = Math.floor((Date.UTC(year, month - 1, day) - epoch) / 86400000)
    const numPairs = Math.floor(available.length / 2)
    const pairIndex = Math.floor(dayNum / 2) % numPairs
    missions.push({
      id: `title-a-${today}`,
      trackId: available[pairIndex * 2].trackId,
      trackName: available[pairIndex * 2].trackName,
      target: 3,
    })
    missions.push({
      id: `title-b-${today}`,
      trackId: available[pairIndex * 2 + 1].trackId,
      trackName: available[pairIndex * 2 + 1].trackName,
      target: 3,
    })
  } else if (available.length === 1) {
    missions.push({
      id: `title-a-${today}`,
      trackId: available[0].trackId,
      trackName: available[0].trackName,
      target: 3,
    })
  }

  // Fill remaining slots up to 8 total with random non-title tracks (2 streams each)
  const needed = 8 - missions.length
  if (needed > 0 && otherTracks.length > 0) {
    const [year, month, day] = today.split('-').map(Number)
    const seed = year * 10000 + month * 100 + day
    const usedIds = new Set(missions.map(m => m.trackId))
    const pool = otherTracks.filter(t => !usedIds.has(t.trackId) && Number(t.trackId) !== focusTrackId)
    for (let i = 0; i < needed && i < pool.length; i++) {
      const pick = pool[(seed + i * 97) % pool.length]
      missions.push({
        id: `random-${i}-${today}`,
        trackId: pick.trackId,
        trackName: pick.trackName,
        target: 2,
      })
    }
  }

  if (missions.length > 0) {
    await kv.set(`${KV_PREFIX}daily:missions:${today}`, missions, { ex: secondsUntilEndOfNextKSTDay() })
    console.log(`✅ Auto-generated ${missions.length} missions for ${today}: ${missions.map(m => m.trackName).join(', ')}`)
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
  if (!statsfmUsername) return { streamsFound: 0 }

  const res = await fetch(`https://api.stats.fm/api/v1/users/${statsfmUsername}/streams?limit=500`)
  if (!res.ok) throw new Error(`Failed to fetch streams: ${res.status}`)

  const data = await res.json()
  const streams = data.items || []

  // All ATEEZ streams in the API response
  const ateezStreams = streams.filter((s: any) => s.artistIds?.includes(ATEEZ_ARTIST_ID))

  // Today's ATEEZ streams (by KST date) — used for daily/song/mission counts
  const todayAteezStreams = ateezStreams.filter((s: any) => {
    const kstDate = new Date(new Date(s.endTime).getTime() + 9 * 60 * 60 * 1000)
    return kstDate.toISOString().split("T")[0] === today
  })

  // All-time total: only increment by streams newer than last processed to avoid double-counting
  const lastProcessedKey = `user:${userId}:last_processed`
  const lastProcessed = (await kv.get<number>(lastProcessedKey)) || 0
  const newAteezStreams = ateezStreams.filter((s: any) => new Date(s.endTime).getTime() > lastProcessed)
  if (newAteezStreams.length > 0) {
    await kv.incrby(`user:${userId}:total_streams`, newAteezStreams.length)
  }

  console.log(`✅ Manual refresh: ${todayAteezStreams.length} today's streams for ${statsfmUsername}`)

  // Community Daily — SET total from scratch so late-ingested streams are always caught
  if (communityDaily) {
    const userDailyKey = `community:daily:user:${userId}:${today}`
    await kv.set(userDailyKey, todayAteezStreams.length, { ex: secondsUntilEndOfNextKSTDay() })
    const currentHighest = (await kv.get<number>(`user:${userId}:highest_daily_streams`)) || 0
    if (todayAteezStreams.length > currentHighest) await kv.set(`user:${userId}:highest_daily_streams`, todayAteezStreams.length)
  }

  // Daily Song Goal — SET total from scratch
  if (dailySongGoal) {
    const songStreams = todayAteezStreams.filter((s: any) => matchesDailyGoalStream(s, dailySongGoal))
    const userSongKey = `daily:streams:${userId}:${today}`
    await kv.set(userSongKey, songStreams.length, { ex: secondsUntilEndOfNextKSTDay() })
  }

  // Weekly Goal — SET total from scratch
  if (communityWeekly) {
    const weekStreams = ateezStreams.filter((s: any) => {
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
    const userWeeklyKey = `community:weekly:user:${userId}:${weekKey}`
    await kv.set(userWeeklyKey, weekStreams.length, { ex: 604800 })
  }

  // Missions — SET total from scratch
  if (missions?.length > 0) {
    for (const mission of missions) {
      const missionStreams = todayAteezStreams.filter((s: any) => matchesMissionStream(s, mission))
      const progressKey = `mission:progress:${userId}:${today}:${mission.id}`
      await kv.set(progressKey, missionStreams.length, { ex: secondsUntilEndOfNextKSTDay() })
    }
  }

  await kv.set(lastProcessedKey, Date.now(), { ex: 604800 })
  return { streamsFound: todayAteezStreams.length }
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
      kv.get<Mission[]>(`${KV_PREFIX}daily:missions:${today}`)
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
      return NextResponse.json({ success: true, newStreams: result.streamsFound, message: "Streams refreshed successfully" })
    }

    // Regular cron — process ALL users, no tier filtering
    const userKeys = await kv.keys("user:*:statsfm")
    console.log(`📊 Processing all ${userKeys.length} users...`)

    let usersProcessed = 0
    let usersSkipped = 0
    let newDailyStreams = 0
    let newDailySongStreams = 0
    let newWeeklyStreams = 0

    const BATCH_SIZE = 5
    for (let i = 0; i < userKeys.length; i += BATCH_SIZE) {
      const batch = userKeys.slice(i, i + BATCH_SIZE)
      const batchResults = await Promise.allSettled(batch.map(async (key) => {
        const userId = key.split(":")[1]
        const statsfmUsername = await kv.get<string>(key)
        if (!statsfmUsername) throw new Error("No username")

        const res = await fetch(`https://api.stats.fm/api/v1/users/${statsfmUsername}/streams?limit=500`)
        if (!res.ok) throw new Error(`stats.fm ${res.status}`)

        const data = await res.json()
        const streams = data.items || []

        const ateezStreams = streams.filter((s: any) => s.artistIds?.includes(ATEEZ_ARTIST_ID))
        const todayAteezStreams = ateezStreams.filter((s: any) => {
          const kstDate = new Date(new Date(s.endTime).getTime() + 9 * 60 * 60 * 1000)
          return kstDate.toISOString().split("T")[0] === today
        })

        const lastProcessedKey = `user:${userId}:last_processed`
        const lastProcessed = (await kv.get<number>(lastProcessedKey)) || 0
        const newAteezStreams = ateezStreams.filter((s: any) => new Date(s.endTime).getTime() > lastProcessed)
        if (newAteezStreams.length > 0) {
          await kv.incrby(`user:${userId}:total_streams`, newAteezStreams.length)
        }

        console.log(`✅ ${todayAteezStreams.length} today's streams for ${statsfmUsername}`)

        let dailyStreams = 0
        let songStreams = 0
        let weeklyStreams = 0

        if (communityDaily) {
          dailyStreams = todayAteezStreams.length
          const userDailyKey = `community:daily:user:${userId}:${today}`
          await kv.set(userDailyKey, dailyStreams, { ex: secondsUntilEndOfNextKSTDay() })
          const currentHighest = (await kv.get<number>(`user:${userId}:highest_daily_streams`)) || 0
          if (dailyStreams > currentHighest) await kv.set(`user:${userId}:highest_daily_streams`, dailyStreams)
        }

        if (dailySongGoal) {
          const matched = todayAteezStreams.filter((s: any) => matchesDailyGoalStream(s, dailySongGoal))
          songStreams = matched.length
          await kv.set(`daily:streams:${userId}:${today}`, songStreams, { ex: secondsUntilEndOfNextKSTDay() })
        }

        if (communityWeekly) {
          const weekStreams = ateezStreams.filter((s: any) => {
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
          weeklyStreams = weekStreams.length
          await kv.set(`community:weekly:user:${userId}:${weekKey}`, weeklyStreams, { ex: 604800 })
        }

        if (missions && missions.length > 0) {
          for (const mission of missions) {
            const missionStreams = todayAteezStreams.filter((s: any) => matchesMissionStream(s, mission))
            await kv.set(`mission:progress:${userId}:${today}:${mission.id}`, missionStreams.length, { ex: secondsUntilEndOfNextKSTDay() })
          }
        }

        await kv.set(lastProcessedKey, now, { ex: 604800 })
        return { dailyStreams, songStreams, weeklyStreams }
      }))

      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          usersProcessed++
          newDailyStreams += result.value.dailyStreams
          newDailySongStreams += result.value.songStreams
          newWeeklyStreams += result.value.weeklyStreams
        } else {
          usersSkipped++
          console.error("❌ Error processing user in batch:", result.reason)
        }
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

    // Snapshot focus MV views (once per hour, de-duped inside)
    await appendFocusMVSnapshot()

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