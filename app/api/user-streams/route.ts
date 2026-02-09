import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

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

    // Get user's stats.fm username (to check if they're linked)
    const statsfmUsername = await kv.get<string>(`user:${userId}:statsfm`)
    
    if (!statsfmUsername) {
      return NextResponse.json({ 
        totalStreams: 0,
        goalStreams: 0,
        message: "No stats.fm username linked" 
      })
    }

    const today = getKSTDate()

    // Pull from the SAME keys the cron populates
    const [todayStreams, goalStreams] = await Promise.all([
      kv.get<number>(`community:daily:user:${userId}:${today}`),  // Total ATEEZ streams today
      kv.get<number>(`daily:streams:${userId}:${today}`)          // Daily song goal streams
    ])

    return NextResponse.json({
      totalStreams: todayStreams || 0,
      goalStreams: goalStreams || 0,
      username: statsfmUsername,
      date: today
    })

  } catch (error) {
    console.error("Error fetching user streams:", error)
    return NextResponse.json(
      { totalStreams: 0, goalStreams: 0, error: "Failed to fetch streams" },
      { status: 500 }
    )
  }
}