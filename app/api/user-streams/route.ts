import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

// ATEEZ stats.fm Artist ID
const ATEEZ_ARTIST_ID = 164828

// Helper: Get current date in KST (Korea Standard Time, UTC+9)
function getKSTDate(): string {
  const now = new Date()
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000))
  return kstTime.toISOString().split('T')[0]
}

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ totalStreams: 0, goalStreams: 0 }, { status: 200 })
    }

    // Get user's stats.fm username
    const statsfmUsername = await kv.get<string>(`user:${userId}:statsfm`)
    
    if (!statsfmUsername) {
      return NextResponse.json({ 
        totalStreams: 0,
        goalStreams: 0,
        message: "No stats.fm username linked" 
      })
    }

    // Get today's SONG goal (specific song) - FIXED KEY TO MATCH CRON
    const today = getKSTDate() // Use KST date
    const songGoalKey = `daily:goal:${today}` // Changed to match cron
    const songGoal = await kv.get<{ song: string; target: number; current?: number }>(songGoalKey)

    // Check cache
    const cacheKey = `user:streams:cache:${userId}:${today}`
    const cached = await kv.get<any>(cacheKey)
    
    if (cached) {
      return NextResponse.json(cached)
    }

    // Fetch streams from stats.fm API
    const response = await fetch(
      `https://api.stats.fm/api/v1/users/${statsfmUsername}/streams?limit=50`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      console.error('stats.fm API error:', response.status)
      return NextResponse.json({ 
        totalStreams: 0,
        goalStreams: 0,
        error: "Could not fetch streams from stats.fm" 
      })
    }

    const data = await response.json()
    
    // Get today's date range in KST
    const kstNow = new Date(new Date().getTime() + (9 * 60 * 60 * 1000))
    const todayStart = new Date(kstNow)
    todayStart.setHours(0, 0, 0, 0)

    let totalAteezStreams = 0
    let goalSongStreams = 0
    const recentStreams: any[] = [] // Store full stream data

    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((stream: any) => {
        const streamDate = new Date(stream.endTime)
        // Convert stream date to KST for comparison
        const streamKST = new Date(streamDate.getTime() + (9 * 60 * 60 * 1000))
        const isToday = streamKST >= todayStart
        const isAteez = stream.artistIds?.includes(ATEEZ_ARTIST_ID)
        
        if (isToday && isAteez) {
          totalAteezStreams++
          
          // Store the full stream data
          recentStreams.push({
            trackId: stream.trackId,
            trackName: stream.trackName,
            albumId: stream.albumId,
            endTime: stream.endTime,
            playedMs: stream.playedMs
          })
          
          // Check if it matches the song goal (specific song)
          if (songGoal && stream.trackName === songGoal.song) {
            goalSongStreams++
          }
        }
      })
    }

    const result = {
      totalStreams: totalAteezStreams,
      goalStreams: goalSongStreams,
      username: statsfmUsername,
      date: today,
      recentStreams: recentStreams.slice(0, 20) // Return last 20 streams
    }

    // Cache for 1 minute (60 seconds) for fresher data
    await kv.set(cacheKey, result, { ex: 60 })

    return NextResponse.json(result)

  } catch (error) {
    console.error("Error fetching user streams:", error)
    return NextResponse.json(
      { totalStreams: 0, goalStreams: 0, error: "Failed to fetch streams" },
      { status: 500 }
    )
  }
}