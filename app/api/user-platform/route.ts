import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

function getKSTDate(): string {
  const now = new Date()
  const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return kstTime.toISOString().split('T')[0]
}

// GET: return the user's saved platform + today's community platform breakdown
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const today = getKSTDate()
    const [platform, spotifyStreams, appleMusicStreams] = await Promise.all([
      kv.get<string>(`user:${userId}:platform`),
      kv.get<number>(`platform:daily:spotify:${today}`),
      kv.get<number>(`platform:daily:apple_music:${today}`)
    ])

    return NextResponse.json({
      platform: platform || null,
      communityStats: {
        spotify: spotifyStreams || 0,
        apple_music: appleMusicStreams || 0
      }
    })
  } catch (error) {
    console.error('Error fetching platform:', error)
    return NextResponse.json({ error: 'Failed to fetch platform' }, { status: 500 })
  }
}

// POST: save the user's platform preference
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { platform } = await request.json()
    if (!['spotify', 'apple_music'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform. Must be "spotify" or "apple_music".' }, { status: 400 })
    }

    await kv.set(`user:${userId}:platform`, platform)
    return NextResponse.json({ success: true, platform })
  } catch (error) {
    console.error('Error saving platform:', error)
    return NextResponse.json({ error: 'Failed to save platform' }, { status: 500 })
  }
}
