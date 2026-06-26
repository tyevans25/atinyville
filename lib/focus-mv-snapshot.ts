import { kv } from '@vercel/kv'

const HISTORY_MAX = 168

interface FocusMV {
  videoId: string
  title: string
  publishedAt?: string
}

interface FocusMVEntry {
  t: string
  v: number
}

interface TrendingNeighbor {
  rank: number
  videoId: string
  title: string
  channelTitle: string
  thumbnail: string
}

interface TrendingResult {
  rank: number | null
  above: TrendingNeighbor | null
  below: TrendingNeighbor | null
}

async function fetchTrendingRank(videoId: string, apiKey: string): Promise<TrendingResult> {
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

  const idx = allVideos.findIndex(v => v.videoId === videoId)
  if (idx < 0) return { rank: null, above: null, below: null }

  return {
    rank: idx + 1,
    above: idx > 0 ? { rank: idx, ...allVideos[idx - 1] } : null,
    below: idx < allVideos.length - 1 ? { rank: idx + 2, ...allVideos[idx + 1] } : null,
  }
}

export async function appendFocusMVSnapshot() {
  try {
    const focus = await kv.get<FocusMV>('focus:mv')
    if (!focus) return

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
    if (!YOUTUBE_API_KEY) return

    const hourStr = new Date().toISOString().slice(0, 13)

    const history = (await kv.get<FocusMVEntry[]>(`focus:mv:history:${focus.videoId}`)) || []
    if (history.length > 0 && history[history.length - 1].t === hourStr) return

    const [statsRes, trendingResult] = await Promise.all([
      fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${focus.videoId}&key=${YOUTUBE_API_KEY}`,
        { cache: 'no-store' }
      ),
      fetchTrendingRank(focus.videoId, YOUTUBE_API_KEY),
    ])

    if (!statsRes.ok) return
    const data = await statsRes.json()
    const views = parseInt(data.items?.[0]?.statistics?.viewCount) || 0

    const updated = [...history, { t: hourStr, v: views }].slice(-HISTORY_MAX)

    await Promise.all([
      kv.set(`focus:mv:history:${focus.videoId}`, updated, { ex: 60 * 60 * 24 * 30 }),
      kv.set('focus:mv:trending', { ...trendingResult, updatedAt: new Date().toISOString() }, { ex: 60 * 60 * 6 }),
    ])

    console.log(`📊 Focus MV snapshot: ${focus.title} — ${views.toLocaleString()} views | Trending: ${trendingResult.rank ? `#${trendingResult.rank}` : 'not ranked'}`)
  } catch (e) {
    console.error('Focus MV snapshot error:', e)
  }
}

