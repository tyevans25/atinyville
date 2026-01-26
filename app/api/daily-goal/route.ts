import { kv } from "@vercel/kv"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

interface DailyGoalData {
  song: string
  target: number
  current: number
  userStreams: number
}

export async function GET() {
  try {
    const { userId } = await auth() // optional user check
    const today = new Date().toISOString().split("T")[0]

    // Read from daily:song-goal (SPECIFIC song for homepage) - MATCHES CRON KEY
    const dailyGoal = await kv.get<{ song: string; target: number; current?: number }>(
      `daily:song-goal:${today}`
    )

    if (!dailyGoal || !dailyGoal.song || !dailyGoal.target) {
      return NextResponse.json(null)
    }

    let userStreams = 0
    if (userId) {
      // Read from daily:song-streams (user's specific song count) - MATCHES CRON KEY
      userStreams = (await kv.get<number>(`daily:song-streams:${userId}:${today}`)) || 0
    }

    const response: DailyGoalData = {
      song: dailyGoal.song,
      target: dailyGoal.target,
      current: dailyGoal.current || 0,
      userStreams
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching daily goal:", error)
    return NextResponse.json({ error: "Failed to fetch goal" }, { status: 500 })
  }
}