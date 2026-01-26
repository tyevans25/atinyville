import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// GET: Fetch today's total ATEEZ goal and user's streams
export async function GET() {
  try {
    const { userId } = await auth()
    const today = new Date().toISOString().split('T')[0]
    
    // Get today's total goal (ANY ATEEZ) - MATCHES CRON KEY
    const goalKey = `daily:goal:${today}`
    const goal = await kv.get<{
      target: number
      current?: number
    }>(goalKey)

    if (!goal) {
      return NextResponse.json(null)
    }

    // Get user's personal total ATEEZ streams if logged in - MATCHES CRON KEY
    let userStreams = 0
    if (userId) {
      const userStreamsKey = `daily:streams:${userId}:${today}`
      userStreams = await kv.get<number>(userStreamsKey) || 0
    }

    return NextResponse.json({
      target: goal.target,
      current: goal.current || 0,
      userStreams
    })

  } catch (error) {
    console.error('Error fetching community daily goal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goal' },
      { status: 500 }
    )
  }
}

// POST: Set today's total ATEEZ goal (admin only)
export async function POST(request: Request) {
  try {
    const { target } = await request.json()

    if (!target) {
      return NextResponse.json(
        { error: 'Target is required' },
        { status: 400 }
      )
    }

    const today = new Date().toISOString().split('T')[0]
    const goalKey = `daily:goal:${today}` // MATCHES CRON KEY

    // Check if goal already exists
    const existingGoal = await kv.get<{ target: number; current?: number }>(goalKey)
    const current = existingGoal?.current || 0

    // Set today's goal (expires in 24 hours)
    await kv.set(goalKey, {
      target,
      current
    }, { ex: 86400 })

    return NextResponse.json({
      success: true,
      target,
      current
    })

  } catch (error) {
    console.error('Error setting community daily goal:', error)
    return NextResponse.json(
      { error: 'Failed to set goal' },
      { status: 500 }
    )
  }
}