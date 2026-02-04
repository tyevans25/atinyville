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

    // Get today's SONG goal (specific song)
    const today = getKSTDate()
    const songGoalKey = `daily:goal:${today}`
    const songGoal = await kv.get<{ song: string; trackId?: number; target: number; current?: number }>(songGoalKey)

    // 🔍 DEBUG: Log song goal
    console.log('🔍 Today (KST):', today)
    console.log('🔍 Song Goal Key:', songGoalKey)
    console.log('🔍 Song Goal Data:', songGoal)

    // Check cache
    const cacheKey = `user:streams:cache:${userId}:${today}`
    const cached = await kv.get<any>(cacheKey)
    
    if (cached) {
      console.log('📦 Returning cached data')
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
    const recentStreams: any[] = []

    console.log('🔍 Processing streams...')

    if (data.items && Array.isArray(data.items)) {
      data.items.forEach((stream: any) => {
        const streamDate = new Date(stream.endTime)
        const streamKST = new Date(streamDate.getTime() + (9 * 60 * 60 * 1000))
        const isToday = streamKST >= todayStart
        const isAteez = stream.artistIds?.includes(ATEEZ_ARTIST_ID)
        
        if (isToday && isAteez) {
          totalAteezStreams++
          
          // 🔍 DEBUG: Log track info
          console.log(`📀 ATEEZ Track: "${stream.trackName}" (ID: ${stream.trackId})`)
          
          recentStreams.push({
            trackId: stream.trackId,
            trackName: stream.trackName,
            albumId: stream.albumId,
            endTime: stream.endTime,
            playedMs: stream.playedMs
          })
          
          // Check if it matches the song goal (prefer trackId, fallback to name)
          if (songGoal) {
            if (songGoal.trackId) {
              // Compare by track ID (more reliable)
              console.log(`  📊 Comparing by ID: ${stream.trackId} === ${songGoal.trackId}`)
              
              if (stream.trackId === songGoal.trackId) {
                console.log('  ✅ MATCH (by ID)!')
                goalSongStreams++
              } else {
                console.log('  ❌ No match')
              }
            } else {
              // Fallback to name comparison
              console.log(`  📊 Comparing by name: "${stream.trackName}" === "${songGoal.song}"`)
              
              if (stream.trackName === songGoal.song) {
                console.log('  ✅ MATCH (by name)!')
                goalSongStreams++
              } else {
                console.log('  ❌ No match')
              }
            }
          }
        }
      })
    }

    console.log('📊 Final Results:')
    console.log('  Total ATEEZ Streams:', totalAteezStreams)
    console.log('  Goal Song Streams:', goalSongStreams)

    const result = {
      totalStreams: totalAteezStreams,
      goalStreams: goalSongStreams,
      username: statsfmUsername,
      date: today,
      recentStreams: recentStreams.slice(0, 20)
    }

    // Cache for 1 minute
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