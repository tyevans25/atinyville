import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

// ATEEZ stats.fm Artist ID
const ATEEZ_ARTIST_ID = 164828

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ streams: 0 }, { status: 200 })
    }

    // Get user's stats.fm username
    const statsfmUsername = await kv.get<string>(`user:${userId}:statsfm`)
    
    if (!statsfmUsername) {
      return NextResponse.json({ 
        streams: 0,
        message: "No stats.fm username linked" 
      })
    }

    // Check cache first (cache for 5 minutes to avoid rate limits)
    const today = new Date().toISOString().split('T')[0]
    const cacheKey = `streams:cache:${userId}:${today}`
    const cached = await kv.get<number>(cacheKey)

    if (cached !== null) {
      return NextResponse.json({
        streams: cached,
        cached: true,
        username: statsfmUsername
      })
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
        streams: 0,
        error: "Could not fetch streams from stats.fm" 
      })
    }

    const data = await response.json()
    
    // Get today's date range in UTC
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)
    
    // Filter for ATEEZ streams from today only
    let ateezStreams = 0
    if (data.items && Array.isArray(data.items)) {
      ateezStreams = data.items.filter((stream: any) => {
        // Check if stream is from today
        const streamDate = new Date(stream.endTime)
        const isToday = streamDate >= todayStart
        
        // Check if artist is ATEEZ (164828)
        const isAteez = stream.artistIds && stream.artistIds.includes(ATEEZ_ARTIST_ID)
        
        return isToday && isAteez
      }).length
    }

    // Cache for 5 minutes
    await kv.set(cacheKey, ateezStreams, { ex: 300 })

    return NextResponse.json({
      streams: ateezStreams,
      username: statsfmUsername,
      date: today
    })

  } catch (error) {
    console.error("Error fetching user streams:", error)
    return NextResponse.json(
      { streams: 0, error: "Failed to fetch streams" },
      { status: 500 }
    )
  }
}