import { kv } from "@vercel/kv"
import { NextResponse } from "next/server"

const ATEEZ_ARTIST_ID = 164828

export async function POST() {
  try {
    const today = new Date().toISOString().split("T")[0]
    const goalKey = `daily:goal:${today}`
    const goal = await kv.get<any>(goalKey)

    if (!goal) {
      return NextResponse.json({ error: "No goal set" }, { status: 404 })
    }

    // Get all users with stats.fm linked
    const allUserKeys = await kv.keys("user:*:statsfm")
    let totalStreams = 0

    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)

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
            const isToday = streamDate >= todayStart
            const isAteez = stream.artistIds?.includes(ATEEZ_ARTIST_ID)
            const matchesSong = stream.trackName?.toLowerCase().includes(goal.song.toLowerCase())
            
            return isToday && isAteez && matchesSong
          }).length

          totalStreams += userStreams
        }
      } catch (error) {
        console.error(`Error fetching for ${statsfmUsername}:`, error)
      }
    }

    // Update the goal with new count
    await kv.set(goalKey, {
      ...goal,
      current: totalStreams
    }, { ex: 86400 })

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