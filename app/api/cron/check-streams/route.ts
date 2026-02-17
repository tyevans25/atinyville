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
  const yesterday = new Date(
    now.getTime() + 9 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000
  )
  return yesterday.toISOString().split("T")[0]
}

function getCurrentWeekKey(): string {
  const now = new Date()
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)

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

  const weekNumber = Math.floor(
    (thisWeekThursday.getTime() - firstThursday.getTime()) /
      (7 * 24 * 60 * 60 * 1000)
  )

  return `${year}-W${String(weekNumber).padStart(2, "0")}`
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
  const communityDailyKey = `community:daily:${today}`
  const dailySongGoalKey = `daily:goal:${today}`
  const communityWeeklyKey = `community:weekly:${weekKey}`

  if (communityDaily) {
    const userDailyKeys = await kv.keys(`community:daily:user:*:${today}`)
    let total = 0

    for (const key of userDailyKeys) {
      total += (await kv.get<number>(key)) || 0
    }

    await kv.set(
      communityDailyKey,
      { ...communityDaily, current: total },
      { ex: 86400 }
    )
  }

  if (dailySongGoal) {
    const userSongKeys = await kv.keys(`daily:streams:*:${today}`)
    let total = 0

    for (const key of userSongKeys) {
      total += (await kv.get<number>(key)) || 0
    }

    await kv.set(
      dailySongGoalKey,
      { ...dailySongGoal, current: total },
      { ex: 86400 }
    )
  }

  if (communityWeekly) {
    const userWeeklyKeys = await kv.keys(
      `community:weekly:user:*:${weekKey}`
    )
    let total = 0

    for (const key of userWeeklyKeys) {
      total += (await kv.get<number>(key)) || 0
    }

    await kv.set(
      communityWeeklyKey,
      { ...communityWeekly, current: total },
      { ex: 604800 }
    )
  }
}

/* =========================
   DEFAULT GOALS
========================= */

async function ensureDefaultGoals(today: string, weekKey: string) {
  const yesterday = getYesterdayKST()

  const communityDailyKey = `community:daily:${today}`
  const communityWeeklyKey = `community:weekly:${weekKey}`
  const dailySongGoalKey = `daily:goal:${today}`
  const missionsKey = `daily:missions:${today}`

  if (!(await kv.get(communityDailyKey))) {
    await kv.set(
      communityDailyKey,
      { target: DEFAULT_COMMUNITY_DAILY, current: 0 },
      { ex: 86400 }
    )
  }

  if (!(await kv.get(communityWeeklyKey))) {
    await kv.set(
      communityWeeklyKey,
      { target: DEFAULT_COMMUNITY_WEEKLY, current: 0 },
      { ex: 604800 }
    )
  }

  if (!(await kv.get(dailySongGoalKey))) {
    const yesterdayGoal = await kv.get<any>(
      `daily:goal:${yesterday}`
    )

    if (yesterdayGoal?.song) {
      await kv.set(
        dailySongGoalKey,
        {
          song: yesterdayGoal.song,
          trackId: yesterdayGoal.trackId,
          target:
            yesterdayGoal.target || DEFAULT_SONG_GOAL_TARGET,
          current: 0
        },
        { ex: 86400 }
      )
    }
  }

  if (!(await kv.get(missionsKey))) {
    const yesterdayMissions = await kv.get<Mission[]>(
      `daily:missions:${yesterday}`
    )

    if (yesterdayMissions?.length) {
      const todayMissions = yesterdayMissions.map(m => ({
        ...m,
        id: `${m.trackId}-${today}`
      }))

      await kv.set(missionsKey, todayMissions, { ex: 86400 })
    }
  }
}

/* =========================
   CRON HANDLER
========================= */

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const today = getKSTDate()
    const weekKey = getCurrentWeekKey()

    await ensureDefaultGoals(today, weekKey)

    const communityDaily = await kv.get(
      `community:daily:${today}`
    )

    const dailySongGoal = await kv.get(
      `daily:goal:${today}`
    )

    const communityWeekly = await kv.get(
      `community:weekly:${weekKey}`
    )

    const missions = await kv.get<Mission[]>(
      `daily:missions:${today}`
    )

    await recalculateGoalTotals(
      today,
      weekKey,
      communityDaily,
      dailySongGoal,
      communityWeekly
    )

    return NextResponse.json({
      success: true,
      date: today,
      week: weekKey
    })
  } catch (error) {
    console.error("Cron error:", error)
    return NextResponse.json(
      { error: "Cron failed" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  return POST(request)
}
