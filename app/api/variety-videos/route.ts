import { NextResponse } from 'next/server'
import Papa from 'papaparse'

console.log('🔥 LOADING API ROUTE - All env vars:', Object.keys(process.env).filter(k => k.includes('YOUTUBE')))
console.log('🔥 YOUTUBE_API_KEY on load:', process.env.YOUTUBE_API_KEY)

const SHEET_ID = '1kKbm-Jp0IonVEdtbizR7wKAwluw5QuotEwUp3lWS0Tc'
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`

interface Video {
  youtubeId: string
  youtubeUrl: string
  title: string
  thumbnail: string
  uploadDate: string
  year: number
  duration: string
  category: string
  era: string
  featuredMembers: string[]
  notes: string
}

// Extract YouTube video ID from URL
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

// Convert ISO 8601 duration to readable format
function parseDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  if (!match) return '0:00'

  const hours = parseInt(match[1]) || 0
  const minutes = parseInt(match[2]) || 0
  const seconds = parseInt(match[3]) || 0

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// Fetch YouTube metadata
async function getYouTubeMetadata(videoId: string): Promise<any> {
  const API_KEY = process.env.YOUTUBE_API_KEY
  
  console.log('🔑 API Key exists:', !!API_KEY)
  console.log('🔑 API Key value:', API_KEY?.substring(0, 10) + '...')
  
  if (!API_KEY) {
    console.log('❌ No API key - using placeholder')
    return {
      title: 'ATEEZ Video',
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      uploadDate: new Date().toISOString(),
      duration: 'PT0M0S'
    }
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${API_KEY}`,
      { next: { revalidate: 86400 } }
    )

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return null
    }

    const video = data.items[0]

    return {
      title: video.snippet.title,
      thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url,
      uploadDate: video.snippet.publishedAt,
      duration: video.contentDetails.duration
    }
  } catch (error) {
    console.error(`Error fetching YouTube data for ${videoId}:`, error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    // Check if force refresh requested
    const url = new URL(request.url)
    const force = url.searchParams.get('force') === 'true'
    
    // Fetch with dev-friendly cache
    const cacheTime = process.env.NODE_ENV === 'development' 
      ? (force ? 0 : 60)  // Dev: 1 min (or no cache if forced)
      : 3600              // Prod: 1 hour
    
    const response = await fetch(SHEET_URL, {
      next: { revalidate: cacheTime },
      cache: force ? 'no-store' : 'default'
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch sheet' }, { status: 500 })
    }

    const csvText = await response.text()

    // Parse CSV with papaparse
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true
    })

    const videos: Video[] = []

    for (const row of parsed.data as any[]) {
      const youtubeUrl = row['Youtube URL']?.trim()
      const category = row['Category']?.trim()
      const era = row['Era']?.trim()
      const featuredMembersRaw = row['Featured Members']?.trim()
      const notes = row['Notes']?.trim()

      if (!youtubeUrl) continue

      const videoId = extractVideoId(youtubeUrl)
      if (!videoId) continue

      // Fetch YouTube metadata
      const metadata = await getYouTubeMetadata(videoId)
      if (!metadata) continue

      const uploadDate = new Date(metadata.uploadDate)

      // Split members by comma and clean
      const featuredMembers = featuredMembersRaw 
        ? featuredMembersRaw.split(',').map((m: string) => m.trim()).filter((m: string) => m.length > 0)
        : []

      videos.push({
        youtubeId: videoId,
        youtubeUrl: youtubeUrl,
        title: metadata.title,
        thumbnail: metadata.thumbnail,
        uploadDate: metadata.uploadDate,
        year: uploadDate.getFullYear(),
        duration: parseDuration(metadata.duration),
        category: category || 'Uncategorized',
        era: era || 'Unknown',
        featuredMembers: featuredMembers,
        notes: notes || ''
      })
    }

    return NextResponse.json({ videos })

  } catch (error) {
    console.error('Error in variety videos API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}