import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Helper to get current week key (e.g., "2026-W05")
function getCurrentWeekKey(): string {
  const now = new Date()
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  const kstDay = kstNow.getUTCDay()
  const daysSinceThursday = (kstDay + 7 - 4) % 7
  const thisWeekThursday = new Date(kstNow)
  thisWeekThursday.setUTCDate(kstNow.getUTCDate() - daysSinceThursday)
  thisWeekThursday.setUTCHours(0, 0, 0, 0)
  const year = thisWeekThursday.getUTCFullYear()
  const startOfYear = new Date(Date.UTC(year, 0, 1))
  const firstThursday = new Date(startOfYear)
  const daysUntilThursday = (4 - startOfYear.getUTCDay() + 7) % 7
  firstThursday.setUTCDate(1 + daysUntilThursday)
  const weekNumber = Math.floor(
    (thisWeekThursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)
  )
  return `${year}-W${String(weekNumber).padStart(2, "0")}`
}

// GET: Fetch this week's goal and user's streams
export async function GET() {
  try {
    const { userId } = await auth()
    const weekKey = getCurrentWeekKey()
    
    // Get this week's goal
    const goalKey = `community:weekly:${weekKey}`
    const goal = await kv.get<{
      song: string
      target: number
      current: number
    }>(goalKey)

    if (!goal) {
      return NextResponse.json(null)
    }

    // Get user's personal streams if logged in
    let userStreams = 0
    if (userId) {
      const userStreamsKey = `community:weekly:user:${userId}:${weekKey}`
      userStreams = await kv.get<number>(userStreamsKey) || 0
    }

    return NextResponse.json({
      song: goal.song,
      target: goal.target,
      current: goal.current,
      userStreams
    })

  } catch (error) {
    console.error('Error fetching weekly goal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goal' },
      { status: 500 }
    )
  }
}

// POST: Set this week's goal (admin only)
export async function POST(request: Request) {
  try {
    const { song, target } = await request.json()

    if (!song || !target) {
      return NextResponse.json(
        { error: 'Song and target are required' },
        { status: 400 }
      )
    }

    const weekKey = getCurrentWeekKey()
    const goalKey = `community:weekly:goal:${weekKey}`

    // Check if goal already exists
    const existingGoal = await kv.get(goalKey)
    const current = existingGoal ? (existingGoal as any).current : 0

    // Set this week's goal (expires in 7 days)
    await kv.set(goalKey, {
      song,
      target,
      current
    }, { ex: 604800 }) // 7 days in seconds

    return NextResponse.json({
      success: true,
      song,
      target,
      current,
      week: weekKey
    })

  } catch (error) {
    console.error('Error setting weekly goal:', error)
    return NextResponse.json(
      { error: 'Failed to set goal' },
      { status: 500 }
    )
  }
}