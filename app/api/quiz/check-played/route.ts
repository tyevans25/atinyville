import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const today = new Date().toISOString().split('T')[0]
    const playKey = `played:${userId}:${today}`
    const hasPlayed = await kv.get(playKey)

    return NextResponse.json({
      hasPlayed: !!hasPlayed,
      userId
    })

  } catch (error) {
    console.error('Error checking play status:', error)
    return NextResponse.json(
      { error: 'Failed to check play status' },
      { status: 500 }
    )
  }
}