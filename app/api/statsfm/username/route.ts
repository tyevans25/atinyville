import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { statsfmUsername } = await request.json()

    if (!statsfmUsername || statsfmUsername.trim() === '') {
      return NextResponse.json(
        { error: 'stats.fm username is required' },
        { status: 400 }
      )
    }

    const cleanUsername = statsfmUsername.trim()

    // Verify the username exists and profile is public
    try {
      const response = await fetch(
        `https://api.stats.fm/api/v1/users/${cleanUsername}/streams`
      )
      
      if (!response.ok) {
        return NextResponse.json(
          { error: 'stats.fm username not found or profile is private. Make sure your profile is public!' },
          { status: 404 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Could not verify stats.fm username' },
        { status: 500 }
      )
    }

    // Save to user's profile
    await kv.set(`user:${userId}:statsfm`, cleanUsername)

    return NextResponse.json({
      success: true,
      username: cleanUsername
    })

  } catch (error) {
    console.error('Error saving stats.fm username:', error)
    return NextResponse.json(
      { error: 'Failed to save username' },
      { status: 500 }
    )
  }
}

// Get user's stats.fm username
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const statsfmUsername = await kv.get(`user:${userId}:statsfm`)

    return NextResponse.json({
      statsfmUsername: statsfmUsername || null
    })

  } catch (error) {
    console.error('Error fetching stats.fm username:', error)
    return NextResponse.json(
      { error: 'Failed to fetch username' },
      { status: 500 }
    )
  }
}