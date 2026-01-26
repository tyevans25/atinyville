import { kv } from "@vercel/kv"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

// Runtime-safe helpers
const isValidNumber = (v: unknown): v is number =>
  typeof v === "number" && !Number.isNaN(v)

const todayKey = () =>
  new Date().toISOString().split("T")[0]

// GET: Fetch today's goal and user's streams
export async function GET() {
  try {
    const { userId } = await auth()
    const today = todayKey()

    const goalKey = `daily:goal:${today}`
    const rawGoal = await kv.get<any>(goalKey)

    // 🔒 HARD GUARD
    if (
      !rawGoal ||
      typeof rawGoal.song !== "string" ||
      !isValidNumber(rawGoal.target) ||
      !isValidNumber(rawGoal.current)
    ) {
      return NextResponse.json(null)
    }

    let userStreams = 0
    if (userId) {
      const userStreamsKey = `daily:streams:${userId}:${today}`
      const rawUserStreams = await kv.get<any>(userStreamsKey)
      userStreams = isValidNumber(rawUserStreams) ? rawUserStreams : 0
    }

    return NextResponse.json({
      song: rawGoal.song,
      target: rawGoal.target,
      current: rawGoal.current,
      userStreams,
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

    const existingGoal = await kv.get<any>(goalKey)
    const current = isValidNumber(existingGoal?.current)
      ? existingGoal.current
      : 0

    await kv.set(
      goalKey,
      {
        song: song.trim(),
        target,
        current,
      },
      { ex: 86400 }
    )

    return NextResponse.json({
      success: true,
      song: song.trim(),
      target,
      current,
    })
  } catch (error) {
    console.error("Error setting daily goal:", error)
    return NextResponse.json(
      { error: "Failed to set goal" },
      { status: 500 }
    )
  }
}
