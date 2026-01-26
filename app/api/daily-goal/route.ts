import { kv } from "@vercel/kv"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

// Runtime-safe helpers
const isValidNumber = (v: unknown): v is number =>
  typeof v === "number" && !Number.isNaN(v)

const todayKey = () =>
  new Date().toISOString().split("T")[0]

const ATEEZ_ARTIST_ID = 164828

// GET: Fetch today's goal and calculate community streams
export async function GET() {
  try {
    const { userId } = await auth()
    const today = todayKey()

    const goalKey = `daily:goal:${today}`
    const cacheKey = `daily:goal:cache:${today}`
    const rawGoal = await kv.get<any>(goalKey)

    // 🔒 HARD GUARD
    if (
      !rawGoal ||
      typeof rawGoal.song !== "string" ||
      !isValidNumber(rawGoal.target)
    ) {
      return NextResponse.json(null)
    }

    // Check cache first (refresh every 5 minutes)
    const cached = await kv.get<any>(cacheKey)
    if (cached) {
      // Still need to get current user's streams if they just signed in
      let userStreams = 0
      if (userId) {
        const statsfmUsername = await kv.get<string>(`user:${userId}:statsfm`)
        if (statsfmUsername && cached.userStreamsByUsername) {
          userStreams = cached.userStreamsByUsername[statsfmUsername] || 0
        }
      }
      
      return NextResponse.json({
        song: cached.song,
        target: cached.target,
        current: cached.current,
        userStreams
      })
    }

    // Calculate community streams from all users
    const allUserKeys = await kv.keys("user:*:statsfm")
    let totalStreams = 0
    let currentUserStreams = 0
    const userStreamsByUsername: Record<string, number> = {}

    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)

    console.log(`Checking ${allUserKeys.length} users for song: ${rawGoal.song}`)

    for (const userKey of allUserKeys) {
      const statsfmUsername = await kv.get<string>(userKey)
      if (!statsfmUsername) continue

      try {
        const response = await fetch(
          `https://api.stats.fm/api/v1/users/${statsfmUsername}/streams`,
          {
            headers: { 'Accept': 'application/json' }
          }
        )

        if (!response.ok) {
          console.log(`Failed to fetch for ${statsfmUsername}: ${response.status}`)
          continue
        }

        const data = await response.json()

        if (data.items && Array.isArray(data.items)) {
          const userStreams = data.items.filter((stream: any) => {
            const streamDate = new Date(stream.endTime)
            const isToday = streamDate >= todayStart
            const isAteez = stream.artistIds?.includes(ATEEZ_ARTIST_ID)
            const matchesSong = stream.trackName?.toLowerCase().includes(rawGoal.song.toLowerCase())
            
            return isToday && isAteez && matchesSong
          }).length

          totalStreams += userStreams
          userStreamsByUsername[statsfmUsername] = userStreams

          // Track current user's streams
          const currentUserId = userKey.split(':')[1]
          if (userId === currentUserId) {
            currentUserStreams = userStreams
          }

          console.log(`User ${statsfmUsername}: ${userStreams} streams`)
        }
      } catch (error) {
        console.error(`Error fetching for ${statsfmUsername}:`, error)
      }
    }

    console.log(`Total community streams: ${totalStreams}`)

    const result = {
      song: rawGoal.song,
      target: rawGoal.target,
      current: totalStreams,
      userStreams: currentUserStreams,
      userStreamsByUsername
    }

    // Cache for 5 minutes
    await kv.set(cacheKey, result, { ex: 300 })

    return NextResponse.json({
      song: result.song,
      target: result.target,
      current: result.current,
      userStreams: result.userStreams
    })
  } catch (error) {
    console.error("Error fetching daily goal:", error)
    return NextResponse.json(
      { error: "Failed to fetch goal" },
      { status: 500 }
    )
  }
}

// POST: Set today's goal (admin only)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { song, target } = body ?? {}

    // 🔒 STRICT VALIDATION
    if (
      typeof song !== "string" ||
      song.trim().length === 0 ||
      !isValidNumber(target) ||
      target <= 0
    ) {
      return NextResponse.json(
        { error: "Valid song and positive numeric target are required" },
        { status: 400 }
      )
    }

    const today = todayKey()
    const goalKey = `daily:goal:${today}`

    await kv.set(
      goalKey,
      {
        song: song.trim(),
        target,
      },
      { ex: 86400 }
    )

    // Clear cache so it recalculates immediately
    const cacheKey = `daily:goal:cache:${today}`
    await kv.del(cacheKey)

    return NextResponse.json({
      success: true,
      song: song.trim(),
      target,
    })
  } catch (error) {
    console.error("Error setting daily goal:", error)
    return NextResponse.json(
      { error: "Failed to set goal" },
      { status: 500 }
    )
  }
}