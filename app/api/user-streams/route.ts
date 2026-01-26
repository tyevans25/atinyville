import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

// ATEEZ stats.fm Artist ID
const ATEEZ_ARTIST_ID = 164828

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

    // Get today's goal to check for specific song
    const today = new Date().toISOString().split('T')[0]
    const goalKey = `daily:goal:${today}`
    const goal = await kv.get<any>(goalKey)

    // Check cache
    const cacheKey = `user:streams:cache:${userId}:${today}`
    const cached = await kv.get<any>(cacheKey)
    
    if (cached) {
      return NextResponse.json(cached)
    }

    // Fetch streams from stats.fm API
    const response = await fetch(
      `https://api.stats.fm/api/v1/users/${statsfmUsername}/streams`,
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
    
    // Get today's date range
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)

    let totalAteezStreams = 0
    let goalSongStreams = 0

    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((stream: any) => {
        const streamDate = new Date(stream.endTime)
        const isToday = streamDate >= todayStart
        const isAteez = stream.artistIds?.includes(ATEEZ_ARTIST_ID)
        
        if (isToday && isAteez) {
          totalAteezStreams++
          
          // Check if it matches the goal song
          if (goal && stream.trackName?.toLowerCase().includes(goal.song.toLowerCase())) {
            goalSongStreams++
          }
        }
      })
    }

    const result = {
      totalStreams: totalAteezStreams,
      goalStreams: goalSongStreams,
      username: statsfmUsername,
      date: today
    }

    // Cache for 5 minutes
    await kv.set(cacheKey, result, { ex: 300 })

    return NextResponse.json(result)

  } catch (error) {
    console.error("Error fetching user streams:", error)
    return NextResponse.json(
      { totalStreams: 0, goalStreams: 0, error: "Failed to fetch streams" },
      { status: 500 }
    )
  }
}