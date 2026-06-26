import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { cookies } from 'next/headers'

async function isAuthorized() {
  const jar = await cookies()
  return jar.get('admin_session')?.value === process.env.ADMIN_PASSWORD
}

export async function POST() {
  if (process.env.VERCEL_ENV === 'production') {
    return NextResponse.json({ error: 'Seed disabled on production' }, { status: 403 })
  }
  if (!await isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const focus = await kv.get<{ videoId: string; title: string; publishedAt?: string }>('focus:mv')
  if (!focus) return NextResponse.json({ error: 'No focus MV set' }, { status: 400 })

  const now = Date.now()

  // Start at 1M, each hour adds (500K - h*50K), floored at 50K
  let v = 1_000_000
  const entries = Array.from({ length: 48 }, (_, i) => {
    const ms = now - (47 - i) * 3_600_000
    const t = new Date(ms).toISOString().slice(0, 13)
    const snap = { t, v }
    const delta = Math.max(500_000 - i * 50_000, 50_000)
    v += delta
    return snap
  })

  // Set goals + publishedAt anchored to 24h ago if not already set
  const publishedAt = focus.publishedAt ?? new Date(now - 24 * 3_600_000).toISOString()
  const updatedFocus = {
    ...focus,
    publishedAt,
    goal24h: 5_000_000,
    goal72h: 6_500_000,
    trendingGoal: 10,
  }

  await Promise.all([
    kv.set('focus:mv', updatedFocus),
    kv.set(`focus:mv:history:${focus.videoId}`, entries, { ex: 60 * 60 * 24 * 30 }),
    kv.set('focus:mv:trending', {
      rank: 23,
      above: {
        rank: 22,
        videoId: 'dQw4w9WgXcQ',
        title: 'APT. (feat. Bruno Mars)',
        channelTitle: 'ROSÉ',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
      },
      below: {
        rank: 24,
        videoId: 'kTJczUoc26U',
        title: 'CRAZY',
        channelTitle: 'LE SSERAFIM',
        thumbnail: 'https://i.ytimg.com/vi/kTJczUoc26U/mqdefault.jpg',
      },
      updatedAt: new Date().toISOString(),
    }, { ex: 60 * 60 * 6 }),
  ])

  return NextResponse.json({ success: true, entries: entries.length })
}
