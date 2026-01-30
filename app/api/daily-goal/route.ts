import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

const CATALOG_KEY = 'ateez:songs:catalog'

function getKSTDate(): string {
  const now = new Date()
  const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return kstTime.toISOString().split('T')[0]
}

interface Mission {
  id: string
  trackId: number
  trackName: string
  target: number
}

interface SongEntry {
  trackId: number
  trackName: string
  albumId?: number
  addedAt: string
  source: 'auto' | 'manual'
}

/* ---------------------------------- GET ---------------------------------- */

export async function GET() {
  try {
    const { userId } = await auth()
    const today = getKSTDate()

    const key = `daily:missions:${today}`
    const missions = await kv.get<Mission[]>(key) || []

    if (!userId) {
      return NextResponse.json({
        missions: missions.map(m => ({ ...m, current: 0 })),
        date: today
      })
    }

    const missionsWithProgress = await Promise.all(
      missions.map(async (mission) => {
        const progressKey = `mission:progress:${userId}:${today}:${mission.id}`
        const current = await kv.get<number>(progressKey) || 0
        return { ...mission, current }
      })
    )

    return NextResponse.json({
      missions: missionsWithProgress,
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

/* ---------------------------------- POST ---------------------------------- */

export async function POST(request: Request) {
  try {
    const { missions } = await request.json()

    if (!Array.isArray(missions)) {
      return NextResponse.json(
        { error: 'missions must be an array' },
        { status: 400 }
      )
    }

    const today = getKSTDate()
    const key = `daily:missions:${today}`

    const normalized: Mission[] = missions.map((m) => {
      if (!m.trackId || !m.trackName || !m.target) {
        throw new Error('Invalid mission data')
      }

      return {
        id: `${m.trackId}-${today}`,
        trackId: m.trackId,
        trackName: m.trackName,
        target: m.target
      }
    })

    await kv.set(key, normalized, { ex: 86400 })

    // Add each song to the catalog if not already there
    const catalog = await kv.get<Record<string, SongEntry>>(CATALOG_KEY) || {}
    let catalogUpdated = false

    for (const mission of normalized) {
      if (!catalog[mission.trackId]) {
        catalog[mission.trackId] = {
          trackId: mission.trackId,
          trackName: mission.trackName,
          addedAt: new Date().toISOString(),
          source: 'auto'
        }
        catalogUpdated = true
      }
    }

    if (catalogUpdated) {
      await kv.set(CATALOG_KEY, catalog)
    }

    return NextResponse.json({
      success: true,
      missions: normalized,
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

/* ---------------------------------- PATCH --------------------------------- */

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { missionId, streams } = body

    if (!missionId || streams === undefined) {
      return NextResponse.json(
        { error: 'Mission ID and streams required' },
        { status: 400 }
      )
    }

    const today = getKSTDate()
    const progressKey = `mission:progress:${userId}:${today}:${missionId}`
    
    // Update progress (expires in 24 hours)
    await kv.set(progressKey, streams, { ex: 86400 })

    return NextResponse.json({ 
      success: true, 
      missionId, 
      streams,
      date: today 
    })
  } catch (error) {
    console.error('Error updating mission progress:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}