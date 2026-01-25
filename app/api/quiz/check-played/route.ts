import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Clean username
    const cleanUsername = username.toLowerCase().trim()

    // Get today's date
    const today = new Date().toISOString().split('T')[0]
    const playKey = `played:${cleanUsername}:${today}`

    // Check if user played today
    const hasPlayed = await kv.get(playKey)

    return NextResponse.json({
      hasPlayed: !!hasPlayed,
      username: cleanUsername
    })

  } catch (error) {
    console.error('Error checking play status:', error)
    return NextResponse.json(
      { error: 'Failed to check play status' },
      { status: 500 }
    )
  }
}
