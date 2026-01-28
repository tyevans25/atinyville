import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

interface Mission {
  id: string
  song: string
  target: number
}

// Helper: Get current date in KST (Korea Standard Time, UTC+9)
function getKSTDate(): string {
  const now = new Date()
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000))
  return kstTime.toISOString().split('T')[0]
}

// GET: Fetch today's missions and user's progress
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const today = getKSTDate() // Use KST date
    
    // Get today's mission list
    const missionKey = `daily:missions:${today}`
    const missions = await kv.get<Mission[]>(missionKey)

    if (!missions || missions.length === 0) {
      return NextResponse.json({ missions: [] })
    }

    // Get user's progress for each mission
    const missionsWithProgress = await Promise.all(
      missions.map(async (mission) => {
        const progressKey = `mission:progress:${userId}:${today}:${mission.id}`
        const current = await kv.get<number>(progressKey) || 0
        
        return {
          id: mission.id,
          song: mission.song,
          target: mission.target,
          current
        }
      })
    )

    return NextResponse.json({
      missions: missionsWithProgress
    })

  } catch (error) {
    console.error('Error fetching missions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch missions' },
      { status: 500 }
    )
  }
}

// POST: Set today's missions (admin only)
export async function POST(request: Request) {
  try {
    const { missions } = await request.json()

    if (!missions || !Array.isArray(missions)) {
      return NextResponse.json(
        { error: 'Missions array is required' },
        { status: 400 }
      )
    }

    // Validate missions format
    for (const mission of missions) {
      if (!mission.id || !mission.song || !mission.target) {
        return NextResponse.json(
          { error: 'Each mission must have id, song, and target' },
          { status: 400 }
        )
      }
    }

    const today = getKSTDate() // Use KST date
    const missionKey = `daily:missions:${today}`

    // Set today's missions (expires in 24 hours)
    await kv.set(missionKey, missions, { ex: 86400 })

    return NextResponse.json({
      success: true,
      missions,
      date: today
    })

  } catch (error) {
    console.error('Error setting missions:', error)
    return NextResponse.json(
      { error: 'Failed to set missions' },
      { status: 500 }
    )
  }
}