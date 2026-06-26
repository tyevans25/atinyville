import { kv } from '@vercel/kv'

const HISTORY_MAX = 168 // 7 days of hourly snapshots

interface FocusMV {
  videoId: string
  title: string
}

interface FocusMVEntry {
  t: string
  v: number
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
