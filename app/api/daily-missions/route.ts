import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

// Helper: Get current date in KST
function getKSTDate(): string {
  const now = new Date()
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000))
  return kstTime.toISOString().split('T')[0]
}

interface Mission {
  id: string
  trackId: number
  trackName: string
  target: number
}

// GET: Fetch today's missions
export async function GET() {
  try {
    const today = getKSTDate()
    const missionsKey = `daily:missions:${today}`
    
    const missions = await kv.get<Mission[]>(missionsKey) || []
    
    return NextResponse.json({
      missions,
      date: today
    })
  } catch (error) {
    console.error('Error fetching missions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch missions' },
      { status: 500 }
    )
  }
}

// POST: Set today's missions
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { missions } = body
    
    if (!missions || !Array.isArray(missions)) {
      return NextResponse.json(
        { error: 'Missions array required' },
        { status: 400 }
      )
    }
    
    // Validate each mission has required fields
    for (const mission of missions) {
      if (!mission.trackId || !mission.trackName || !mission.target) {
        return NextResponse.json(
          { error: 'Each mission must have trackId, trackName, and target' },
          { status: 400 }
        )
      }
    }
    
    const today = getKSTDate()
    const missionsKey = `daily:missions:${today}`
    
    // Store missions for 24 hours
    await kv.set(missionsKey, missions, { ex: 86400 })
    
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