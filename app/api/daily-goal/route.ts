import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

interface DailyGoalData {
  song: string
  target: number
  current: number
  userStreams: number
}

// GET: Fetch today's daily song goal and user's streams
export async function GET() {
  try {
    const { userId } = await auth()
    const today = new Date().toISOString().split('T')[0]

    const goalKey = `daily:song-goal:${today}`
    const dailyGoal = await kv.get<{ song: string; target: number; current?: number }>(goalKey)

    if (!dailyGoal || !dailyGoal.song || !dailyGoal.target) {
      return NextResponse.json(null)
    }

    let userStreams = 0
    if (userId) {
      const userStreamsKey = `daily:song-streams:${userId}:${today}`
      userStreams = await kv.get<number>(userStreamsKey) || 0
    }

    return NextResponse.json({
      song: dailyGoal.song,
      target: dailyGoal.target,
      current: dailyGoal.current || 0,
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

// POST: Set today's daily song goal (admin only)
export async function POST(request: Request) {
  try {
    const { song, target } = await request.json()

    if (!song || !target) {
      return NextResponse.json(
        { error: 'Song and target are required' },
        { status: 400 }
      )
    }

    const today = new Date().toISOString().split('T')[0]
    const goalKey = `daily:song-goal:${today}`

    const existingGoal = await kv.get<{ song: string; target: number; current?: number }>(goalKey)
    const current = existingGoal?.current || 0

    await kv.set(goalKey, {
      song,
      target,
      current
    }, { ex: 86400 })

    return NextResponse.json({
      success: true,
      song,
      target,
      current,
      date: today
    })

  } catch (error) {
    console.error('Error setting daily goal:', error)
    return NextResponse.json(
      { error: 'Failed to set goal' },
      { status: 500 }
    )
  }
}