import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

// Helper: Get current date in KST (Korea Standard Time, UTC+9)
function getKSTDate(): string {
  const now = new Date()
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000))
  return kstTime.toISOString().split('T')[0]
}

export async function POST(request: Request) {
  try {
    const { userId, username } = await request.json()

    // Accept either userId or username for backwards compatibility
    const identifier = userId || username

    if (!identifier) {
      return NextResponse.json(
        { error: 'User ID or username is required' },
        { status: 400 }
      )
    }

    const today = getKSTDate() // Use KST date instead of local
    const playKey = `played:${identifier}:${today}`
    const hasPlayed = await kv.get(playKey)

    return NextResponse.json({
      hasPlayed: !!hasPlayed,
      userId: identifier
    })

  } catch (error) {
    console.error('Error checking play status:', error)
    return NextResponse.json(
      { error: 'Failed to check play status' },
      { status: 500 }
    )
  }
}