import { NextResponse } from 'next/server'
import Papa from 'papaparse'
import { kv } from '@vercel/kv'

const MV_SHEET_ID = process.env.MV_SHEET_ID || 'YOUR_SHEET_ID_HERE'
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${MV_SHEET_ID}/export?format=csv`
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

export interface MVStats {
  videoId: string
  title: string
  album: string
  releaseDate: string
  viewCount: number
  likeCount: number
  viewsGainedHour: number  // Always compared to snapshot from 1 hour ago
  likesGainedHour: number
  thumbnail: string
  url: string
}

// Get the key for the snapshot taken at the top of a given hour
// e.g. "2025-02-17T02:00" for any time between 2:00 and 2:59
function getHourSnapshotKey(videoId: string, hoursAgo: number = 0): string {
  const now = new Date()
  now.setMinutes(0, 0, 0) // Round down to top of hour
  now.setHours(now.getHours() - hoursAgo)
  const hourStr = now.toISOString().slice(0, 13) // "2025-02-17T02"
  return `youtube:${videoId}:snapshot:${hourStr}`
}

export async function GET() {
  try {
    const response = await fetch(SHEET_URL, { cache: 'no-store' })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch MV list' }, { status: 500 })
    }

    const csvText = await response.text()
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true })

    const videoIds: string[] = []
    const videoMeta: Record<string, { title: string; album: string; releaseDate: string }> = {}

    for (const row of parsed.data as any[]) {
      const videoId = row['Video ID']?.trim()
      const title = row['Title']?.trim()
      const album = row['Album/Era']?.trim()
      const releaseDate = row['Release Date']?.trim()

      if (!videoId || !title) continue

      videoIds.push(videoId)
      videoMeta[videoId] = {
        title: title || 'Unknown',
        album: album || 'Unknown',
        releaseDate: releaseDate || 'Unknown'
      }
    }

    if (videoIds.length === 0) {
      return NextResponse.json({ videos: [] })
    }

    const allStats: MVStats[] = []

    for (let i = 0; i < videoIds.length; i += 50) {
      const batch = videoIds.slice(i, i + 50)
      const batchStats = await fetchYouTubeBatch(batch, videoMeta)
      allStats.push(...batchStats)
    }

    allStats.sort((a, b) => b.viewCount - a.viewCount)

    return NextResponse.json({
      videos: allStats,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in MV tracker API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function fetchYouTubeBatch(
  videoIds: string[],
  videoMeta: Record<string, { title: string; album: string; releaseDate: string }>
): Promise<MVStats[]> {

  if (!YOUTUBE_API_KEY) {
    console.error('No YouTube API key found')
    return []
  }

  try {
    const idsParam = videoIds.join(',')
    const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${idsParam}&key=${YOUTUBE_API_KEY}`

    const response = await fetch(url, { cache: 'no-store' })

    if (!response.ok) {
      console.error('YouTube API error:', response.status)
      return []
    }

    const data = await response.json()
    const stats: MVStats[] = []

    for (const video of data.items || []) {
      const videoId = video.id
      const currentViews = parseInt(video.statistics.viewCount) || 0
      const currentLikes = parseInt(video.statistics.likeCount) || 0

      // --- HOURLY SNAPSHOT LOGIC ---
      
      // Key for THIS hour's snapshot (e.g. "youtube:abc123:snapshot:2025-02-17T03")
      const thisHourKey = getHourSnapshotKey(videoId, 0)
      
      // Key for LAST hour's snapshot (e.g. "youtube:abc123:snapshot:2025-02-17T02")
      const lastHourKey = getHourSnapshotKey(videoId, 1)

      // Save current views as this hour's snapshot (only if not already saved this hour)
      const existingSnapshot = await kv.get<number>(thisHourKey)
      if (!existingSnapshot) {
        // First run this hour - save the snapshot
        await kv.set(thisHourKey, currentViews, { ex: 7200 }) // Keep for 2 hours
        console.log(`📸 Saved hourly snapshot for ${videoId}: ${currentViews} views`)
      }

      // Get last hour's snapshot to calculate actual hourly gain
      const lastHourViews = await kv.get<number>(lastHourKey)

      // Views gained = current views - what we had at the top of the PREVIOUS hour
      const viewsGainedHour = lastHourViews != null 
        ? currentViews - lastHourViews 
        : 0 // No data yet - show 0 instead of misleading number

      // Same for likes
      const thisHourLikeKey = `${thisHourKey}:likes`
      const lastHourLikeKey = `${lastHourKey}:likes`
      
      const existingLikeSnapshot = await kv.get<number>(thisHourLikeKey)
      if (!existingLikeSnapshot) {
        await kv.set(thisHourLikeKey, currentLikes, { ex: 7200 })
      }
      
      const lastHourLikes = await kv.get<number>(lastHourLikeKey)
      const likesGainedHour = lastHourLikes != null ? currentLikes - lastHourLikes : 0

      const meta = videoMeta[videoId] || { title: 'Unknown', album: 'Unknown', releaseDate: 'Unknown' }

      stats.push({
        videoId,
        title: meta.title,
        album: meta.album,
        releaseDate: meta.releaseDate,
        viewCount: currentViews,
        likeCount: currentLikes,
        viewsGainedHour,
        likesGainedHour,
        thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url || '',
        url: `https://www.youtube.com/watch?v=${videoId}`
      })
    }

    return stats

  } catch (error) {
    console.error('Error fetching YouTube batch:', error)
    return []
  }
}