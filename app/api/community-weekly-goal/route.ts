import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Helper to get current week key
function getCurrentWeekKey(): string {
  const now = new Date()
  const year = now.getFullYear()
  const startOfYear = new Date(year, 0, 1)
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000))
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7)
  return `${year}-W${String(weekNumber).padStart(2, '0')}`
}

// GET: Fetch this week's total ATEEZ goal and user's streams
export async function GET() {
  try {
    const { userId } = await auth()
    const weekKey = getCurrentWeekKey()
    
    // Get this week's total goal
    const goalKey = `community:weekly:${weekKey}`
    const goal = await kv.get<{
      target: number
      current: number
    }>(goalKey)

    if (!goal) {
      return NextResponse.json(null)
    }

    // Get user's personal total ATEEZ streams if logged in
    let userStreams = 0
    if (userId) {
      const userStreamsKey = `community:weekly:user:${userId}:${weekKey}`
      userStreams = await kv.get<number>(userStreamsKey) || 0
    }

    return NextResponse.json({
      target: goal.target,
      current: goal.current,
      userStreams
    })

  } catch (error) {
    console.error('Error fetching community weekly goal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goal' },
      { status: 500 }
    )
  }
}

// POST: Set this week's total ATEEZ goal (admin only)
export async function POST(request: Request) {
  try {
    const { target } = await request.json()

    if (!target) {
      return NextResponse.json(
        { error: 'Target is required' },
        { status: 400 }
      )
    }

    const weekKey = getCurrentWeekKey()
    const goalKey = `community:weekly:${weekKey}`

    // Check if goal already exists
    const existingGoal = await kv.get(goalKey)
    const current = existingGoal ? (existingGoal as any).current : 0

    // Set this week's goal (expires in 7 days)
    await kv.set(goalKey, {
      target,
      current
    }, { ex: 604800 })

    return NextResponse.json({
      success: true,
      target,
      current,
      week: weekKey
    })

  } catch (error) {
    console.error('Error setting community weekly goal:', error)
    return NextResponse.json(
      { error: 'Failed to set goal' },
      { status: 500 }
    )
  }
}