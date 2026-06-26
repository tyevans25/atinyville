import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { cookies } from 'next/headers'

async function isAuthorized() {
  const jar = await cookies()
  return jar.get('admin_session')?.value === process.env.ADMIN_PASSWORD
}

export async function POST() {
  if (!await isAuthorized()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const focus = await kv.get<{ videoId: string }>('focus:mv')
  if (!focus?.videoId) return NextResponse.json({ error: 'No focus MV set' }, { status: 400 })

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'No YouTube API key' }, { status: 500 })

  const allVideos: Array<{ videoId: string; title: string; channelTitle: string; thumbnail: string }> = []
  let pageToken: string | undefined

  for (let page = 0; page < 4; page++) {
    const url = new URL('https://www.googleapis.com/youtube/v3/videos')
    url.searchParams.set('part', 'snippet')
    url.searchParams.set('chart', 'mostPopular')
    url.searchParams.set('maxResults', '50')
    url.searchParams.set('key', apiKey)
    if (pageToken) url.searchParams.set('pageToken', pageToken)

    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) break
    const data = await res.json()

    for (const item of (data.items || [])) {
      allVideos.push({
        videoId: item.id,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
      })
    }

    if (!data.nextPageToken) break
    pageToken = data.nextPageToken
  }

  const idx = allVideos.findIndex(v => v.videoId === focus.videoId)
  const trending = idx < 0
    ? { rank: null, above: null, below: null, updatedAt: new Date().toISOString() }
    : {
        rank: idx + 1,
        above: idx > 0 ? { rank: idx, ...allVideos[idx - 1] } : null,
        below: idx < allVideos.length - 1 ? { rank: idx + 2, ...allVideos[idx + 1] } : null,
        updatedAt: new Date().toISOString(),
      }

  await kv.set('focus:mv:trending', trending, { ex: 60 * 60 * 6 })
  return NextResponse.json({ success: true, rank: trending.rank })
}
