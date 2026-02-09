import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

// ATEEZ stats.fm Artist ID
const ATEEZ_ARTIST_ID = 164828

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ recentStreams: [] }, { status: 200 })
    }

    // Get user's stats.fm username
    const statsfmUsername = await kv.get<string>(`user:${userId}:statsfm`)
    
    if (!statsfmUsername) {
      return NextResponse.json({ 
        recentStreams: [],
        message: "No stats.fm username linked" 
      })
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
        recentStreams: [],
        error: "Could not fetch streams from stats.fm" 
      })
    }

    const data = await response.json()
    const recentStreams: any[] = []

    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((stream: any) => {
        const isAteez = stream.artistIds?.includes(ATEEZ_ARTIST_ID)
        
        if (isAteez) {
          recentStreams.push({
            trackId: stream.trackId,
            trackName: stream.trackName,
            albumId: stream.albumId,
            endTime: stream.endTime,
            playedMs: stream.playedMs
          })
        }
      })
    }

    return NextResponse.json({
      recentStreams: recentStreams.slice(0, 20),
      username: statsfmUsername
    })

  } catch (error) {
    console.error("Error fetching recent tracks:", error)
    return NextResponse.json(
      { recentStreams: [], error: "Failed to fetch streams" },
      { status: 500 }
    )
  }
}