import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { cookies } from 'next/headers'

const HISTORY_MAX = 168 // 7 days of hourly snapshots

async function isAuthorized() {
  const jar = await cookies()
  return jar.get('admin_session')?.value === process.env.ADMIN_PASSWORD
}

export interface FocusMVEntry {
  t: string  // ISO hour string e.g. "2026-06-25T14"
  v: number  // view count at that hour
}

export interface FocusMV {
  videoId: string
  title: string
  thumbnail: string
  channelTitle: string
  setAt: string
  publishedAt?: string
  goal24h?: number
  goal48h?: number
  goal72h?: number
  trendingGoal?: number // target trending rank (lower = better)
}

export async function GET() {
  try {
    const focus = await kv.get<FocusMV>('focus:mv')
    if (!focus) return NextResponse.json({ focus: null, history: [], trending: null })

    const [history, trending] = await Promise.all([
      kv.get<FocusMVEntry[]>(`focus:mv:history:${focus.videoId}`),
      kv.get<{ rank: number | null; updatedAt: string }>('focus:mv:trending'),
    ])

    return NextResponse.json({ focus, history: history || [], trending: trending || null })
  } catch {
    return NextResponse.json({ focus: null, history: [], trending: null })
  }
}

export async function POST(request: Request) {
  if (!await isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { videoId, goal24h, goal48h, goal72h, trendingGoal } = await request.json()
  if (!videoId || typeof videoId !== 'string') {
    return NextResponse.json({ error: 'videoId required' }, { status: 400 })
  }

  // Strip full YouTube URL down to just the ID
  const cleanId = videoId.includes('youtube.com') || videoId.includes('youtu.be')
    ? (videoId.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)?.[1] ?? videoId)
    : videoId.trim()

  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
  if (!YOUTUBE_API_KEY) return NextResponse.json({ error: 'No YouTube API key' }, { status: 500 })

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${cleanId}&key=${YOUTUBE_API_KEY}`,
    { cache: 'no-store' }
  )
  if (!res.ok) return NextResponse.json({ error: 'YouTube API error' }, { status: 500 })
  const data = await res.json()
  const video = data.items?.[0]
  if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 })

  const focus: FocusMV = {
    videoId: cleanId,
    title: video.snippet.title,
    thumbnail: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url || '',
    channelTitle: video.snippet.channelTitle,
    setAt: new Date().toISOString(),
    publishedAt: video.snippet.publishedAt || undefined,
    ...(goal24h  ? { goal24h: Number(goal24h)  } : {}),
    ...(goal48h  ? { goal48h: Number(goal48h)  } : {}),
    ...(goal72h  ? { goal72h: Number(goal72h)  } : {}),
    ...(trendingGoal ? { trendingGoal: Number(trendingGoal) } : {}),
  }

  // Preserve existing history if same video is being re-set (e.g. updating goals)
  const currentViews = parseInt(video.statistics.viewCount) || 0
  const hourStr = new Date().toISOString().slice(0, 13)
  const existingHistory = await kv.get<FocusMVEntry[]>(`focus:mv:history:${cleanId}`)
  let history: FocusMVEntry[]
  if (existingHistory && existingHistory.length > 0) {
    // Keep existing history; append current snapshot if this hour isn't already there
    const lastEntry = existingHistory.at(-1)!
    if (lastEntry.t === hourStr) {
      history = existingHistory
    } else {
      history = [...existingHistory, { t: hourStr, v: currentViews }].slice(-HISTORY_MAX)
    }
  } else {
    history = [{ t: hourStr, v: currentViews }]
  }

  await Promise.all([
    kv.set('focus:mv', focus),
    kv.set(`focus:mv:history:${cleanId}`, history, { ex: 60 * 60 * 24 * 30 }),
  ])

  return NextResponse.json({ success: true, focus, currentViews })
}

export async function PATCH(request: Request) {
  if (!await isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const current = await kv.get<FocusMV>('focus:mv')
  if (!current) return NextResponse.json({ error: 'No focus MV set' }, { status: 404 })

  const { goal24h, goal48h, goal72h, trendingGoal } = await request.json()
  const updated: FocusMV = {
    ...current,
    ...(goal24h      !== undefined ? { goal24h:      goal24h      ? Number(goal24h)      : undefined } : {}),
    ...(goal48h      !== undefined ? { goal48h:      goal48h      ? Number(goal48h)      : undefined } : {}),
    ...(goal72h      !== undefined ? { goal72h:      goal72h      ? Number(goal72h)      : undefined } : {}),
    ...(trendingGoal !== undefined ? { trendingGoal: trendingGoal ? Number(trendingGoal) : undefined } : {}),
  }

  await kv.set('focus:mv', updated)
  return NextResponse.json({ success: true, focus: updated })
}

export async function DELETE() {
  try {
    if (!await isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const focus = await kv.get<{ videoId: string }>('focus:mv')
    if (focus?.videoId) {
      await kv.del(`focus:mv:history:${focus.videoId}`)
    }
    await Promise.all([kv.del('focus:mv'), kv.del('focus:mv:trending')])

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to clear focus MV' }, { status: 500 })
  }
}


