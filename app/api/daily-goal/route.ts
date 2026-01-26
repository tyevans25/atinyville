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

    const dailyGoal = await kv.get<{ song: string; target: number; current?: number }>(
      `daily:goal:${today}`
    )

    if (!dailyGoal || !dailyGoal.song || !dailyGoal.target) {
      return NextResponse.json(null)
    }

    let userStreams = 0
    if (userId) {
      userStreams = (await kv.get<number>(`daily:streams:${userId}:${today}`)) || 0
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
