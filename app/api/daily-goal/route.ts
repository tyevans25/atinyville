import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Helper: Get current date in KST (Korea Standard Time, UTC+9)
function getKSTDate(): string {
  const now = new Date()
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000))
  return kstTime.toISOString().split('T')[0]
}

// Helper: Seconds until end of NEXT KST day (gives ~24-48h buffer)
function secondsUntilEndOfNextKSTDay(): number {
  const now = new Date()
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  // End of next KST day = start of day after tomorrow in KST
  const endOfNextDay = new Date(Date.UTC(
    kstNow.getUTCFullYear(),
    kstNow.getUTCMonth(),
    kstNow.getUTCDate() + 2,
    0, 0, 0
  ) - 9 * 60 * 60 * 1000)
  return Math.floor((endOfNextDay.getTime() - now.getTime()) / 1000)
}

// GET: Fetch today's goal and user's streams
export async function GET() {
  try {
    const { userId } = await auth()
    const today = getKSTDate()  // ← Use KST date!
    
    // Get today's goal
    const goalKey = `daily:goal:${today}`
    const goal = await kv.get<{
      song: string
      trackId?: number
      trackIds?: number[]
      target: number
      current: number
    }>(goalKey)

    if (!goal) {
      return NextResponse.json(null)
    }

    // Get user's personal streams if logged in
    let userStreams = 0
    if (userId) {
      const userStreamsKey = `daily:streams:${userId}:${today}`
      userStreams = await kv.get<number>(userStreamsKey) || 0
    }

    return NextResponse.json({
      song: goal.song,
      trackId: goal.trackId,  // ← Add this!
      trackIds: goal.trackIds || (goal.trackId ? [goal.trackId] : []),
      target: goal.target,
      current: goal.current,
      userStreams
    })

  } catch (error) {
    console.error('Error fetching daily goal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goal' },
      { status: 500 }
    )
  }
}

// POST: Set today's goal (admin only - you'll call this manually or via admin panel)
export async function POST(request: Request) {
  try {
    const { song, trackId, trackIds, target } = await request.json()

    if (!song || !target) {
      return NextResponse.json(
        { error: 'Song and target are required' },
        { status: 400 }
      )
    }

    if (trackIds && (!Array.isArray(trackIds) || trackIds.some((value: unknown) => typeof value !== 'number'))) {
      return NextResponse.json(
        { error: 'trackIds must be an array of numbers when provided' },
        { status: 400 }
      )
    }

    const today = getKSTDate()  // ← Use KST date!
    const goalKey = `daily:goal:${today}`

    // Check if goal already exists
    const existingGoal = await kv.get(goalKey)
    const current = existingGoal ? (existingGoal as any).current : 0

    const normalizedTrackIds = Array.from(new Set([
      ...(Array.isArray(trackIds) ? trackIds : []),
      ...(trackId ? [trackId] : [])
    ].map((value) => Number(value)).filter((value) => Number.isFinite(value))))

    const ttl = secondsUntilEndOfNextKSTDay()

    // Keep goal through next-day rollover so carry-over can read yesterday reliably.
    await kv.set(goalKey, {
      song,
      trackId,  // ← Add this!
      trackIds: normalizedTrackIds,
      target,
      current
    }, { ex: ttl })

    return NextResponse.json({
      success: true,
      song,
      trackId,  // ← Add this!
      trackIds: normalizedTrackIds,
      target,
      current
    })

  } catch (error) {
    console.error('Error setting daily goal:', error)
    return NextResponse.json(
      { error: 'Failed to set goal' },
      { status: 500 }
    )
  }
}