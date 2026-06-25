import { kv } from "@vercel/kv"
import { NextResponse } from "next/server"

const ATEEZ_ARTIST_ID = 164828

function getKSTDate(): string {
  const now = new Date()
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000))
  return kstTime.toISOString().split('T')[0]
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
  if (!trackName) return ''

  return trackName
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .replace(/\s+-\s+(remaster(ed)?|mix|version|ver\.?|instrumental|live|japanese ver\.?|english ver\.?|sped up|slowed).*$/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/ version$/, '')
}

function matchesDailyGoalStream(stream: any, goal: any): boolean {
  const goalTrackIds = new Set([
    ...(goal?.trackIds || []),
    ...(goal?.trackId ? [goal.trackId] : [])
  ].map((trackId) => Number(trackId)))

  if (goalTrackIds.size > 0 && goalTrackIds.has(Number(stream.trackId))) {
    return true
  }

  return normalizeSongName(stream.trackName) === normalizeSongName(goal?.song)
}

export async function POST() {
  try {
    const today = getKSTDate()
    const goalKey = `daily:goal:${today}`
    const goal = await kv.get<any>(goalKey)

    if (!goal) {
      return NextResponse.json({ error: "No goal set" }, { status: 404 })
    }

    // Get all users with stats.fm linked
    const allUserKeys = await kv.keys("user:*:statsfm")
    let totalStreams = 0

    const todayStart = new Date()
    const todayStartKST = new Date(todayStart.getTime() + (9 * 60 * 60 * 1000))
    todayStartKST.setUTCHours(0, 0, 0, 0)
    const todayStartUTC = new Date(todayStartKST.getTime() - (9 * 60 * 60 * 1000))

    for (const userKey of allUserKeys) {
      const statsfmUsername = await kv.get<string>(userKey)
      if (!statsfmUsername) continue

      try {
        const response = await fetch(
          `https://api.stats.fm/api/v1/users/${statsfmUsername}/streams`,
          { headers: { 'Accept': 'application/json' } }
        )

        if (!response.ok) continue

        const data = await response.json()

        if (data.items && Array.isArray(data.items)) {
          const userStreams = data.items.filter((stream: any) => {
          const streamDate = new Date(stream.endTime)
          const isToday = streamDate >= todayStartUTC  // ← here
          const isAteez = stream.artistIds?.includes(ATEEZ_ARTIST_ID)
          const matchesSong = matchesDailyGoalStream(stream, goal)
          
          return isToday && isAteez && matchesSong
        }).length

          totalStreams += userStreams
        }
      } catch (error) {
        console.error(`Error fetching for ${statsfmUsername}:`, error)
      }
    }

    const ttl = secondsUntilEndOfNextKSTDay()

    // Keep goal available across midnight rollover checks.
    await kv.set(goalKey, {
      ...goal,
      current: totalStreams
    }, { ex: ttl })

    return NextResponse.json({ 
      success: true, 
      totalStreams,
      song: goal.song 
    })
  } catch (error) {
    console.error("Error updating streams:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}