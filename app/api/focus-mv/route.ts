import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { auth } from '@clerk/nextjs/server'

const HISTORY_MAX = 168 // 7 days of hourly snapshots

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
}

export async function GET() {
  try {
    const focus = await kv.get<FocusMV>('focus:mv')
    if (!focus) return NextResponse.json({ focus: null, history: [] })

    const history = (await kv.get<FocusMVEntry[]>(`focus:mv:history:${focus.videoId}`)) || []

    return NextResponse.json({ focus, history })
  } catch {
    return NextResponse.json({ focus: null, history: [] })
  }
}

export async function POST(request: Request) {
  const { userId } = await auth()
  const adminId = process.env.ADMIN_CLERK_USER_ID
  if (!userId || userId !== adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { videoId } = await request.json()
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
  }

  // Seed the first history entry
  const currentViews = parseInt(video.statistics.viewCount) || 0
  const hourStr = new Date().toISOString().slice(0, 13)
  const history: FocusMVEntry[] = [{ t: hourStr, v: currentViews }]

  await Promise.all([
    kv.set('focus:mv', focus),
    kv.set(`focus:mv:history:${cleanId}`, history, { ex: 60 * 60 * 24 * 30 }), // 30 days
  ])

  return NextResponse.json({ success: true, focus, currentViews })
}

export async function DELETE() {
  try {
    const { userId } = await auth()
    const adminId = process.env.ADMIN_CLERK_USER_ID
    if (!userId || userId !== adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const focus = await kv.get<{ videoId: string }>('focus:mv')
    if (focus?.videoId) {
      await kv.del(`focus:mv:history:${focus.videoId}`)
    }
    await kv.del('focus:mv')

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to clear focus MV' }, { status: 500 })
  }
}

// Called by cron to append a new hourly snapshot
export async function appendFocusMVSnapshot() {
  try {
    const focus = await kv.get<FocusMV>('focus:mv')
    if (!focus) return

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
    if (!YOUTUBE_API_KEY) return

    const hourStr = new Date().toISOString().slice(0, 13)

    // Only snapshot once per hour — check if this hour already exists
    const history = (await kv.get<FocusMVEntry[]>(`focus:mv:history:${focus.videoId}`)) || []
    if (history.length > 0 && history[history.length - 1].t === hourStr) return

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${focus.videoId}&key=${YOUTUBE_API_KEY}`,
      { cache: 'no-store' }
    )
    if (!res.ok) return

    const data = await res.json()
    const views = parseInt(data.items?.[0]?.statistics?.viewCount) || 0

    const updated = [...history, { t: hourStr, v: views }].slice(-HISTORY_MAX)
    await kv.set(`focus:mv:history:${focus.videoId}`, updated, { ex: 60 * 60 * 24 * 30 })
    console.log(`📊 Focus MV snapshot: ${focus.title} — ${views.toLocaleString()} views`)
  } catch (e) {
    console.error('Focus MV snapshot error:', e)
  }
}
